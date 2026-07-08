"""
detection_service.py

Runs the live YOLOv8 detection loop in a background thread and holds the
current per-table state in memory, so Flask routes can read it instantly
without blocking on video processing.

Pipeline per frame:
    1. Read one frame from the video (loops back to the start at the end).
    2. Run YOLOv8 once -> person boxes + dining-table boxes.
    3. RegionMapper maps person centers -> per-table person counts.
    4. TableTracker maps dining-table boxes -> merge relationships.
    5. TableClassifier turns (person count, capacity) -> status, unless
       the table is under manual admin control (reserved/maintenance).
    6. Merged tables are combined into one reported group.

This is intentionally a simple polling-friendly design (shared dict guarded
by a lock) rather than websockets, since the frontend already polls
GET /api/detection/status on an interval.

Usage:
    service = DetectionService(region_mapper)
    service.load_video("data/uploads/sample.mp4")
    service.start()
    ...
    status = service.get_status()   # safe to call from any request thread
    service.stop()
"""

import threading
import time

import cv2

from .yolo_detector import YoloDetector
from .table_classifier import TableClassifier
from .table_tracker import TableTracker

# Process at most this many frames per second. The sample videos are just
# looping demo footage, not a real-time camera, so we don't need to match
# the file's native FPS — this keeps CPU inference load predictable.
PROCESS_FPS = 5


class DetectionService:
    def __init__(self, region_mapper, tables_store):
        """
        :param region_mapper: RegionMapper instance (table_id -> polygon).
        :param tables_store:  TablesStore instance (table_id -> capacity /
                               manual status), so classification respects
                               admin-configured capacity and overrides.
        """
        self.region_mapper = region_mapper
        self.tables_store  = tables_store
        self.tracker       = TableTracker(region_mapper)
        self.detector       = None  # lazy-loaded on first start() call

        self._video_path = None
        self._cap         = None
        self._thread       = None
        self._stop_event   = threading.Event()
        self._lock         = threading.Lock()

        # Shared state read by Flask routes. Keys are table IDs.
        self._state = {}
        self._running = False
        self._error = None
        self._current_frame = None  # Latest frame being processed
        self._current_detections = {"persons": [], "tables": []}

    # ── Video source ─────────────────────────────────────────────────────

    def load_video(self, video_path: str):
        """Point the service at a video file. Call before start()."""
        self._video_path = video_path

    def has_video(self) -> bool:
        return bool(self._video_path)

    @property
    def video_path(self):
        return self._video_path

    # ── Lifecycle ────────────────────────────────────────────────────────

    def start(self, confidence: float = 0.5):
        """Start the background detection loop. No-op if already running."""
        if self._running:
            return
        if not self._video_path:
            raise RuntimeError("No video loaded — call load_video() first.")

        if self.detector is None or self.detector.confidence != confidence:
            self.detector = YoloDetector(confidence=confidence)

        self._stop_event.clear()
        self._error = None
        self._running = True
        self._thread = threading.Thread(target=self._run_loop, daemon=True)
        self._thread.start()

    def stop(self):
        """Stop the background detection loop and release the video file."""
        self._stop_event.set()
        if self._thread is not None:
            self._thread.join(timeout=5)
        self._running = False
        if self._cap is not None:
            self._cap.release()
            self._cap = None

    def is_running(self) -> bool:
        return self._running

    def get_error(self):
        return self._error

    # ── State access (thread-safe reads for Flask routes) ───────────────

    def get_status(self) -> list[dict]:
        """
        Return the latest per-table detection results.

        :returns: [{ tableId, personCount, capacity, status, confidence,
                      mergedInto }, ...]
        """
        with self._lock:
            return [dict(v) for v in self._state.values()]

    def get_current_frame(self):
        """
        Return the latest frame being processed by the detection loop.
        Used by the annotated frame endpoint to show synchronized video playback.
        """
        with self._lock:
            return self._current_frame.copy() if self._current_frame is not None else None

    def get_current_detections(self) -> dict:
        """Return the latest YOLO result produced by the background loop."""
        with self._lock:
            return {
                "persons": [dict(p) for p in self._current_detections.get("persons", [])],
                "tables": [dict(t) for t in self._current_detections.get("tables", [])],
            }

    # ── Background loop ──────────────────────────────────────────────────

    def _run_loop(self):
        self._cap = cv2.VideoCapture(self._video_path)
        if not self._cap.isOpened():
            self._error = f"Could not open video: {self._video_path}"
            self._running = False
            return

        frame_interval = 1.0 / PROCESS_FPS

        while not self._stop_event.is_set():
            loop_start = time.time()

            ok, frame = self._cap.read()
            if not ok:
                # End of file — loop back to the start (sample footage
                # is a short demo clip meant to run continuously).
                self._cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                continue

            try:
                detections = self.detector.detect_all(frame)
                with self._lock:
                    self._current_frame = frame.copy()
                    self._current_detections = detections
                self._process_detections(detections)
            except Exception as exc:  # keep the loop alive on a bad frame
                self._error = str(exc)

            elapsed = time.time() - loop_start
            sleep_for = max(0.0, frame_interval - elapsed)
            time.sleep(sleep_for)

    def _process_detections(self, detections: dict):
        persons = detections["persons"]
        tables  = detections["tables"]

        assignments = self.region_mapper.assign_persons_to_tables(persons)
        merges      = self.tracker.update(tables)

        # TableTracker only reports the table that moved (e.g. {"T01": "T02"}
        # meaning T01 was pushed into T02). Both tables need to know they're
        # part of the same merge group so the frontend renders them as one
        # combined tile instead of two separate ones.
        merged_group_of = {}
        for moved_id, target_id in merges.items():
            group_id = "-".join(sorted([moved_id, target_id]))
            merged_group_of[moved_id]  = group_id
            merged_group_of[target_id] = group_id

        new_state = {}
        for table_id in self.region_mapper.regions:
            info      = self.tables_store.get(table_id)
            capacity  = info["capacity"] if info else 4
            manual    = info["status"] if info else None

            assigned = assignments.get(table_id, [])
            occupied = len(assigned)
            confidence = (
                round(sum(p["conf"] for p in assigned) / occupied, 2)
                if occupied else None
            )

            group_id = merged_group_of.get(table_id)

            if manual and not TableClassifier.should_update(manual):
                status = manual  # respect admin override (reserved/maintenance)
            elif group_id:
                status = "merged"
            else:
                status = TableClassifier.classify(occupied, capacity)

            new_state[table_id] = {
                "tableId":     table_id,
                "personCount": occupied,
                "capacity":    capacity,
                "status":      status,
                "confidence":  confidence,
                "mergeGroup":  group_id,
            }

        with self._lock:
            self._state = new_state

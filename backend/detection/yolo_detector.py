"""
yolo_detector.py

Wraps the YOLOv8 model for person and dining-table detection on video frames.

TABLEYE needs two COCO classes:
    - 'person'       (class 0)  -> drives occupancy (person-in-table-region).
    - 'dining table' (class 60) -> drives merge detection (table pushed into
                                    a neighboring table's region).

Usage:
    detector = YoloDetector(confidence=0.5)
    persons  = detector.detect(frame)         # people only (existing API)
    tables   = detector.detect_tables(frame)  # dining-table blobs only
"""

from ultralytics import YOLO


class YoloDetector:
    # COCO class indices used by TABLEYE.
    PERSON_CLASS = 0
    DINING_TABLE_CLASS = 60

    def __init__(self, model_path: str = "yolov8n.pt", confidence: float = 0.5):
        """
        Load the YOLOv8 model.

        :param model_path:  Path to .pt weights file, or a model name to
                            auto-download (e.g. 'yolov8n.pt').
        :param confidence:  Minimum detection confidence (0–1).
        """
        self.model      = YOLO(model_path)
        self.confidence = confidence

    def detect_all(self, frame) -> dict[str, list[dict]]:
        """
        Run inference ONCE on a frame and split results by class.

        Running the model a single time and filtering by class (instead of
        calling it once per class) matters for CPU inference speed, since
        this runs continuously in a background loop over video frames.

        :param frame: numpy ndarray — one video frame (BGR from OpenCV).
        :returns: { "persons": [...], "tables": [...] } — each a list of
                  dicts with keys x1, y1, x2, y2, cx, cy, conf.
        """
        results = self.model(frame, conf=self.confidence, verbose=False)
        persons, tables = [], []

        for result in results:
            for box in result.boxes:
                class_id = int(box.cls[0])
                if class_id not in (self.PERSON_CLASS, self.DINING_TABLE_CLASS):
                    continue

                x1, y1, x2, y2 = map(int, box.xyxy[0])
                entry = {
                    "x1":   x1,
                    "y1":   y1,
                    "x2":   x2,
                    "y2":   y2,
                    "cx":   (x1 + x2) // 2,   # center x
                    "cy":   (y1 + y2) // 2,   # center y
                    "conf": round(float(box.conf[0]), 2),
                }
                if class_id == self.PERSON_CLASS:
                    persons.append(entry)
                else:
                    tables.append(entry)

        return {"persons": persons, "tables": tables}

    def detect(self, frame) -> list[dict]:
        """
        Detect people in a single frame. Used for table occupancy.

        :param frame: numpy ndarray — one video frame.
        :returns: List of person boxes (see detect_all).
        """
        return self.detect_all(frame)["persons"]

    def detect_tables(self, frame) -> list[dict]:
        """
        Detect dining-table objects in a single frame. Used for merge
        detection (has a table been pushed into a neighboring region?).

        :param frame: numpy ndarray — one video frame.
        :returns: List of dining-table boxes (see detect_all).
        """
        return self.detect_all(frame)["tables"]

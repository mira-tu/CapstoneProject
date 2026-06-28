"""
yolo_detector.py

Wraps the YOLOv8 model for person detection on video frames.
Only 'person' class (COCO class 0) detections are returned.

Usage:
    detector = YoloDetector(confidence=0.5)
    persons  = detector.detect(frame)   # returns list of bounding boxes
"""

from ultralytics import YOLO


class YoloDetector:
    # COCO class index for 'person'.
    PERSON_CLASS = 0

    def __init__(self, model_path: str = "yolov8n.pt", confidence: float = 0.5):
        """
        Load the YOLOv8 model.

        :param model_path:  Path to .pt weights file, or a model name to
                            auto-download (e.g. 'yolov8n.pt').
        :param confidence:  Minimum detection confidence (0–1).
        """
        self.model      = YOLO(model_path)
        self.confidence = confidence

    def detect(self, frame) -> list[dict]:
        """
        Run inference on a single BGR frame (numpy array from OpenCV).

        :param frame: numpy ndarray — one video frame.
        :returns: List of dicts with keys: x1, y1, x2, y2, cx, cy, conf.
                  cx/cy are the bounding-box center points used for table
                  region mapping.
        """
        results  = self.model(frame, conf=self.confidence, verbose=False)
        persons  = []

        for result in results:
            for box in result.boxes:
                if int(box.cls[0]) != self.PERSON_CLASS:
                    continue

                x1, y1, x2, y2 = map(int, box.xyxy[0])
                persons.append({
                    "x1":   x1,
                    "y1":   y1,
                    "x2":   x2,
                    "y2":   y2,
                    "cx":   (x1 + x2) // 2,   # center x — used for region mapping
                    "cy":   (y1 + y2) // 2,   # center y — used for region mapping
                    "conf": round(float(box.conf[0]), 2),
                })

        return persons

#!/usr/bin/env python3
"""
Test if YOLOv8 is actually detecting objects in the video
"""

import cv2
from detection.yolo_detector import YoloDetector

# Load the video
video_path = "data/uploads/1783451302_demo_restaurant2.mp4"
cap = cv2.VideoCapture(video_path)

if not cap.isOpened():
    print(f"ERROR: Cannot open video: {video_path}")
    exit(1)

# Read first frame
ok, frame = cap.read()
cap.release()

if not ok:
    print("ERROR: Cannot read frame from video")
    exit(1)

print(f"Frame size: {frame.shape[1]}x{frame.shape[0]} ({frame.shape[2]} channels)")

# Run YOLOv8 detection
print("\nRunning YOLOv8 detection...")
detector = YoloDetector(confidence=0.3)  # Lower confidence to catch more
detections = detector.detect_all(frame)

print(f"\nDetections found:")
print(f"  Persons: {len(detections.get('persons', []))}")
print(f"  Dining tables: {len(detections.get('tables', []))}")

if detections.get("persons"):
    print("\nPerson detections:")
    for i, person in enumerate(detections["persons"][:5]):  # Show first 5
        print(f"  {i+1}. Box: ({person['x1']:.0f}, {person['y1']:.0f}) to ({person['x2']:.0f}, {person['y2']:.0f}), Conf: {person['conf']:.2f}")

if detections.get("tables"):
    print("\nTable detections:")
    for i, table in enumerate(detections["tables"][:5]):
        print(f"  {i+1}. Box: ({table['x1']:.0f}, {table['y1']:.0f}) to ({table['x2']:.0f}, {table['y2']:.0f}), Conf: {table['conf']:.2f}")

if not detections.get("persons") and not detections.get("tables"):
    print("\n⚠️  NO DETECTIONS FOUND!")
    print("This could mean:")
    print("  1. The video frame has no people or dining tables")
    print("  2. The confidence threshold is too high")
    print("  3. The YOLO model needs better training for this scene")
    print("\nTry lowering the confidence threshold or using a different video.")
else:
    print(f"\n✓ Detection working! Found {len(detections.get('persons', []))} persons and {len(detections.get('tables', []))} tables")

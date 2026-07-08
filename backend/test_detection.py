#!/usr/bin/env python3
"""
Quick test script to verify detection is working
Run this from the backend/ directory:
    python test_detection.py
"""

from state import detection_service
import cv2

print("=" * 60)
print("DETECTION SERVICE STATUS")
print("=" * 60)

print(f"\n1. Has video loaded: {detection_service.has_video()}")
print(f"2. Video path: {detection_service.video_path}")
print(f"3. Detection running: {detection_service.is_running()}")
print(f"4. Detector initialized: {detection_service.detector is not None}")
print(f"5. Error (if any): {detection_service.get_error()}")

print("\n" + "=" * 60)
print("DETECTION STATUS DATA")
print("=" * 60)

status = detection_service.get_status()
print(f"\nNumber of tables in status: {len(status)}")
for table in status:
    print(f"  - {table['tableId']}: {table['personCount']}/{table['capacity']} ({table['status']})")

if not detection_service.is_running():
    print("\n" + "!" * 60)
    print("WARNING: Detection is NOT RUNNING!")
    print("!" * 60)
    print("\nTrying to start detection manually...")
    
    try:
        detection_service.start(confidence=0.5)
        print("✓ Detection started successfully!")
        print(f"  Running: {detection_service.is_running()}")
    except Exception as e:
        print(f"✗ Failed to start detection: {e}")

print("\n" + "=" * 60)
print("VIDEO TEST")
print("=" * 60)

if detection_service.has_video():
    cap = cv2.VideoCapture(detection_service.video_path)
    if cap.isOpened():
        print(f"\n✓ Video can be opened by OpenCV")
        print(f"  Resolution: {int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))}x{int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))}")
        print(f"  FPS: {cap.get(cv2.CAP_PROP_FPS)}")
        print(f"  Frame count: {int(cap.get(cv2.CAP_PROP_FRAME_COUNT))}")
        cap.release()
    else:
        print(f"\n✗ Video CANNOT be opened: {detection_service.video_path}")
else:
    print("\n✗ No video loaded")

print("\n" + "=" * 60)

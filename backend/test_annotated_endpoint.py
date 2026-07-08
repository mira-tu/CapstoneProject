#!/usr/bin/env python3
"""
Test the /api/detection/frame/annotated endpoint to verify it's drawing boxes
"""

import cv2
import numpy as np
from routes.detection import get_annotated_frame
from state import detection_service
from flask import Flask

# Create a minimal Flask app context
app = Flask(__name__)

with app.app_context():
    # Ensure detection is running
    if not detection_service.is_running():
        print("Starting detection...")
        detection_service.start(confidence=0.3)
    
    print("Calling /api/detection/frame/annotated endpoint...")
    response = get_annotated_frame()
    
    # Handle Flask Response object
    if hasattr(response, 'status_code'):
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            # Save the annotated frame to a file
            output_path = "test_annotated_frame.jpg"
            with open(output_path, 'wb') as f:
                f.write(response.data)
            print(f"✓ Annotated frame saved to: {output_path}")
            print("  Open this file to see if detection boxes are drawn!")
            
            # Load and analyze the image
            img = cv2.imread(output_path)
            if img is not None:
                print(f"  Image size: {img.shape[1]}x{img.shape[0]}")
                
                # Count green pixels (person boxes)
                green_mask = cv2.inRange(img, (0, 250, 0), (5, 255, 5))
                green_pixels = cv2.countNonZero(green_mask)
                
                # Count blue pixels (table boxes)  
                blue_mask = cv2.inRange(img, (250, 0, 0), (255, 5, 5))
                blue_pixels = cv2.countNonZero(blue_mask)
                
                print(f"  Green pixels (persons): {green_pixels}")
                print(f"  Blue pixels (tables): {blue_pixels}")
                
                if green_pixels > 0 or blue_pixels > 0:
                    print("\n✓✓✓ DETECTION BOXES ARE BEING DRAWN! ✓✓✓")
                    print("The problem is in the frontend - it's not displaying the annotated frames.")
                else:
                    print("\n✗✗✗ NO BOXES DRAWN! ✗✗✗")
                    print("The backend is not drawing detection boxes on the frame.")
        else:
            print(f"✗ Error response: {response.data}")
    elif isinstance(response, tuple):
        data, status_code = response
        print(f"Response status: {status_code}")
        print(f"✗ Error response: {data}")
    else:
        print(f"Unexpected response type: {type(response)}")

"""
routes/detection.py

Flask Blueprint for /api/detection endpoints.
These expose the live YOLOv8 detection results to the React frontend.

Endpoints:
    POST /api/detection/upload   — upload a video file to run detection on
    POST /api/detection/start    — start the background detection loop
    POST /api/detection/stop     — stop the background detection loop
    GET  /api/detection/status   — latest per-table person counts + merges
    GET  /api/detection/settings — current camera / model config
    POST /api/detection/settings — save camera / model config
"""

import os
import time

from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename

from state import detection_service, UPLOAD_DIR

detection_bp = Blueprint("detection", __name__)

ALLOWED_EXTENSIONS = {"mp4", "mov", "avi", "mkv", "webm"}

# In-memory settings — persisted only for the lifetime of the process.
# TODO: persist to a settings file or .env once that's needed beyond the demo.
_settings = {
    "rtspUrl":    "",
    "fps":        15,
    "confidence": 0.5,
    "videoUrl":   None,
}


def _allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@detection_bp.post("/upload")
def upload_video():
    """
    Upload a video file (e.g. a sample overhead restaurant clip) that the
    detection engine will run YOLOv8 on, looping it like a live feed.
    """
    if "video" not in request.files:
        return jsonify({"error": "No 'video' file part in the request"}), 400

    file = request.files["video"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400
    if not _allowed_file(file.filename):
        return jsonify({"error": f"Unsupported file type. Allowed: {sorted(ALLOWED_EXTENSIONS)}"}), 400

    # Prefix with a timestamp so repeated uploads don't collide.
    safe_name = f"{int(time.time())}_{secure_filename(file.filename)}"
    save_path = os.path.join(UPLOAD_DIR, safe_name)
    file.save(save_path)

    detection_service.load_video(save_path)
    _settings["videoUrl"] = f"/api/detection/video/{safe_name}"

    return jsonify({"uploaded": True, "videoUrl": _settings["videoUrl"]}), 200


@detection_bp.get("/video/<filename>")
def serve_video(filename):
    """
    Serve an uploaded video file so the frontend <video> tag can play it.
    Supports range requests for seeking/streaming.
    """
    from flask import send_from_directory
    safe_filename = secure_filename(filename)
    file_path = os.path.join(UPLOAD_DIR, safe_filename)
    
    # Check file exists
    if not os.path.isfile(file_path):
        return jsonify({"error": "Video file not found"}), 404
    
    # Send with MIME type and cache headers
    response = send_from_directory(
        UPLOAD_DIR, 
        safe_filename,
        mimetype="video/mp4" if filename.endswith(".mp4") else "application/octet-stream"
    )
    response.headers['Accept-Ranges'] = 'bytes'
    response.headers['Cache-Control'] = 'no-cache'
    return response


@detection_bp.get("/frame")
def get_calibration_frame():
    """
    Grab a single frame from the currently loaded video and return it as a
    JPEG image. Camera Calibration uses this as the background to draw table
    regions on — regions MUST be calibrated against real video pixel space,
    not an unrelated floor plan diagram, or detection coordinates won't line
    up with what YOLOv8 actually sees.
    """
    import cv2
    from flask import Response

    if not detection_service.has_video():
        return jsonify({"error": "No video uploaded yet."}), 400

    cap = cv2.VideoCapture(detection_service.video_path)
    ok, frame = cap.read()
    cap.release()

    if not ok:
        return jsonify({"error": "Could not read a frame from the video."}), 500

    ok, buffer = cv2.imencode(".jpg", frame)
    if not ok:
        return jsonify({"error": "Could not encode frame as JPEG."}), 500

    return Response(buffer.tobytes(), mimetype="image/jpeg")


@detection_bp.get("/frame/dimensions")
def get_frame_dimensions():
    """
    Return the pixel width/height of the loaded video's frames, so the
    frontend can convert click positions on the displayed (scaled-down)
    calibration image into real video pixel coordinates.
    """
    import cv2

    if not detection_service.has_video():
        return jsonify({"error": "No video uploaded yet."}), 400

    cap = cv2.VideoCapture(detection_service.video_path)
    width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    cap.release()

    return jsonify({"width": width, "height": height}), 200


@detection_bp.post("/start")
def start_detection():
    """Start the background YOLOv8 detection loop on the loaded video."""
    if not detection_service.has_video():
        return jsonify({"error": "No video uploaded yet. POST a video to /api/detection/upload first."}), 400

    try:
        detection_service.start(confidence=_settings["confidence"])
    except RuntimeError as exc:
        return jsonify({"error": str(exc)}), 400

    return jsonify({"running": True}), 200


@detection_bp.post("/stop")
def stop_detection():
    """Stop the background detection loop."""
    detection_service.stop()
    return jsonify({"running": False}), 200


@detection_bp.get("/status")
def get_status():
    """
    Return the most recent YOLOv8 detection results (per-table person counts,
    computed status, and any merge relationships).

    Response shape:
        {
          "running": true,
          "error": null,
          "tables": [
            { "tableId": "T01", "personCount": 2, "capacity": 4,
              "status": "partial", "confidence": 0.91, "mergeGroup": null },
            ...
          ]
        }
        mergeGroup is a shared string (e.g. "T01-T02") on every table that is
        currently part of the same merged group, or null if not merged.
    """
    return jsonify({
        "running": detection_service.is_running(),
        "error":   detection_service.get_error(),
        "tables":  detection_service.get_status(),
    }), 200


@detection_bp.get("/settings")
def get_settings():
    """Return the current camera and detection model settings."""
    return jsonify(_settings), 200


@detection_bp.get("/frame/annotated")
def get_annotated_frame():
    """
    Return a single frame from the video WITH detection annotations overlaid:
    - Green boxes around detected persons
    - Blue boxes around detected tables
    - Red region polygons for table calibration areas
    - Table status labels (available/occupied/merged/reserved/maintenance)
    
    This is used for real-time visualization of what the detection engine sees.
    """
    import cv2
    from flask import Response

    if not detection_service.has_video():
        return jsonify({"error": "No video uploaded yet."}), 400

    try:
        cap = cv2.VideoCapture(detection_service.video_path)
        ok, frame = cap.read()
        cap.release()

        if not ok:
            return jsonify({"error": "Could not read a frame from the video."}), 500

        # Get latest detection results
        detections = detection_service.detector.detect_all(frame) if detection_service.detector else {}
        status = detection_service.get_status()

        # Draw detection boxes
        if detections:
            # Draw person detection boxes (green)
            for person in detections.get("persons", []):
                x1, y1, x2, y2 = int(person["x1"]), int(person["y1"]), int(person["x2"]), int(person["y2"])
                conf = person["conf"]
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)  # Green
                cv2.putText(frame, f"Person {conf:.2f}", (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)

            # Draw dining table boxes (blue)
            for table in detections.get("tables", []):
                x1, y1, x2, y2 = int(table["x1"]), int(table["y1"]), int(table["x2"]), int(table["y2"])
                cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)  # Blue
                cv2.putText(frame, "Table", (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 1)

        # Draw calibrated table regions (red polygons) with status
        for table_info in status:
            table_id = table_info["tableId"]
            person_count = table_info["personCount"]
            capacity = table_info["capacity"]
            table_status = table_info["status"]

            # Get the region polygon
            region = detection_service.region_mapper.regions.get(table_id)
            if region and len(region) >= 2:
                # Draw region bounds (red)
                points = [(int(p["x"]), int(p["y"])) for p in region]
                if len(points) >= 3:
                    pts = [points]
                    cv2.polylines(frame, pts, True, (0, 0, 255), 2)  # Red

                    # Draw status label
                    min_y = min(p[1] for p in points)
                    min_x = min(p[0] for p in points)
                    
                    # Color based on status
                    status_colors = {
                        "vacant": (0, 255, 0),       # Green
                        "partial": (0, 255, 255),   # Yellow
                        "full": (0, 0, 255),         # Red
                        "merged": (255, 0, 0),       # Cyan
                        "reserved": (255, 255, 0),   # Blue
                        "maintenance": (128, 128, 128),  # Gray
                    }
                    color = status_colors.get(table_status, (255, 255, 255))

                    label = f"{table_id}: {person_count}/{capacity} ({table_status})"
                    cv2.putText(frame, label, (min_x, min_y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

        ok, buffer = cv2.imencode(".jpg", frame)
        if not ok:
            return jsonify({"error": "Could not encode annotated frame as JPEG."}), 500

        return Response(buffer.tobytes(), mimetype="image/jpeg")

    except Exception as exc:
        return jsonify({"error": f"Error generating annotated frame: {str(exc)}"}), 500


@detection_bp.post("/settings")
def save_settings():
    """Save updated camera / detection settings."""
    data = request.get_json() or {}
    for key in ("rtspUrl", "fps", "confidence"):
        if key in data:
            _settings[key] = data[key]
    return jsonify({"saved": True, **_settings}), 200

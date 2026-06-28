"""
routes/detection.py

Flask Blueprint for /api/detection endpoints.
These expose the live YOLOv8 detection results to the React frontend.

Endpoints (planned):
    GET  /api/detection/status   — latest per-table person counts
    GET  /api/detection/settings — current camera / model config
    POST /api/detection/settings — save camera / model config
"""

from flask import Blueprint, jsonify, request

detection_bp = Blueprint("detection", __name__)


@detection_bp.get("/status")
def get_status():
    """
    Return the most recent YOLOv8 detection results (per-table person counts).
    TODO: read from the shared detection state updated by the detection loop.

    Response shape:
        [{ "tableId": "T01", "personCount": 2, "confidence": 0.93 }, ...]
    """
    # Placeholder — replace with real detection state.
    return jsonify([]), 200


@detection_bp.get("/settings")
def get_settings():
    """
    Return the current camera and detection model settings.
    TODO: read from .env / a settings store.
    """
    return jsonify({
        "rtspUrl":    "",
        "fps":        15,
        "confidence": 0.5,
    }), 200


@detection_bp.post("/settings")
def save_settings():
    """
    Save updated camera / detection settings.
    TODO: persist to a settings file or environment.
    """
    data = request.get_json()
    return jsonify({"saved": True, **data}), 200

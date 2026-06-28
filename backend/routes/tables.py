"""
routes/tables.py

Flask Blueprint for all /api/tables endpoints.
Connect this to app.py once the Supabase integration is ready.

Endpoints (planned):
    GET  /api/tables           — fetch all tables with current status
    PATCH /api/tables/<id>     — update a table (manual override, capacity)
    POST /api/tables/<id>/calibration — save polygon calibration coordinates
"""

from flask import Blueprint, jsonify, request

tables_bp = Blueprint("tables", __name__)


@tables_bp.get("/")
def get_tables():
    """
    Return all tables with their current occupancy status.
    TODO: fetch from Supabase once the DB integration is wired up.
    """
    # Placeholder — replace with Supabase query.
    return jsonify([]), 200


@tables_bp.patch("/<table_id>")
def update_table(table_id):
    """
    Apply a partial update to a table (e.g. status override, capacity change).
    TODO: write to Supabase.
    """
    data = request.get_json()
    # Placeholder — replace with Supabase update.
    return jsonify({"id": table_id, **data}), 200


@tables_bp.post("/<table_id>/calibration")
def save_calibration(table_id):
    """
    Save the 4-point polygon coordinates for a table region.
    Writes to data/table_regions.json.
    """
    data   = request.get_json()
    points = data.get("points", [])

    if len(points) != 4:
        return jsonify({"error": "Exactly 4 points required"}), 400

    # TODO: write to table_regions.json and reload RegionMapper.
    return jsonify({"tableId": table_id, "points": points}), 200

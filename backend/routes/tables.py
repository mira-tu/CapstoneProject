"""
routes/tables.py

Flask Blueprint for all /api/tables endpoints.

Endpoints:
    GET  /api/tables                  — fetch all tables with current status
    POST /api/tables                  — create a table
    PATCH /api/tables/<id>             — update a table (manual override, capacity)
    DELETE /api/tables/<id>            — remove a table
    POST /api/tables/<id>/calibration — save this table's region on the floor plan

NOTE: table metadata (label/floor/capacity/status) currently lives in the
in-memory TablesStore (see backend/state.py) since Supabase isn't wired up
yet. Swap TablesStore's internals for real Supabase calls later — the
route handlers below won't need to change shape.
"""

from flask import Blueprint, jsonify, request

from state import tables_store, region_mapper

tables_bp = Blueprint("tables", __name__)


@tables_bp.get("/")
def get_tables():
    """Return all tables with their current occupancy status."""
    return jsonify(tables_store.get_all()), 200


@tables_bp.post("/")
def create_table():
    """Create a new table."""
    data = request.get_json() or {}
    table_id = data.get("id")
    if not table_id:
        return jsonify({"error": "Table 'id' is required"}), 400

    record = tables_store.upsert(
        table_id,
        label=data.get("label"),
        floor=data.get("floor"),
        capacity=data.get("capacity"),
        status=data.get("status"),
    )
    return jsonify(record), 201


@tables_bp.patch("/<table_id>")
def update_table(table_id):
    """Apply a partial update to a table (e.g. status override, capacity change)."""
    data = request.get_json() or {}
    record = tables_store.upsert(table_id, **data)
    return jsonify(record), 200


@tables_bp.delete("/<table_id>")
def delete_table(table_id):
    """Remove a table and its calibrated region."""
    existed = tables_store.delete(table_id)
    region_mapper.delete_region(table_id)
    if not existed:
        return jsonify({"error": "Table not found"}), 404
    return jsonify({"deleted": table_id}), 200


@tables_bp.post("/<table_id>/calibration")
def save_calibration(table_id):
    """
    Save this table's region (a 4-point box) on the floor plan / video frame.
    The detection engine uses this to know which pixels belong to this table.
    """
    data   = request.get_json() or {}
    points = data.get("points", [])

    if len(points) != 4:
        return jsonify({"error": "Exactly 4 points required"}), 400

    region_mapper.save_region(table_id, points)
    return jsonify({"tableId": table_id, "points": points}), 200

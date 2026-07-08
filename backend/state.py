"""
state.py

Shared singleton instances used across Flask blueprints:
    - region_mapper:     table_id -> calibrated region polygon
    - tables_store:       table_id -> label/floor/capacity/manual status
    - detection_service:  background YOLOv8 video loop + live results

Kept in one small module (instead of created inside app.py) so that
routes/tables.py and routes/detection.py can both import the same
instances without circular imports.
"""

import os
import glob

from detection.region_mapper import RegionMapper
from detection.detection_service import DetectionService
from models.tables_store import TablesStore

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
DATA_DIR   = os.path.join(BASE_DIR, "data")
UPLOAD_DIR = os.path.join(DATA_DIR, "uploads")
REGIONS_PATH = os.path.join(DATA_DIR, "table_regions.json")

os.makedirs(UPLOAD_DIR, exist_ok=True)

region_mapper = RegionMapper(REGIONS_PATH)
tables_store  = TablesStore()

for table in (
    {"id": "T01", "label": "Window Booth", "floor": 1, "capacity": 4, "status": "vacant"},
    {"id": "T02", "label": "Center Table", "floor": 1, "capacity": 4, "status": "vacant"},
    {"id": "T03", "label": "Bar Counter", "floor": 1, "capacity": 2, "status": "vacant"},
    {"id": "T04", "label": "Corner Booth", "floor": 1, "capacity": 4, "status": "vacant"},
):
    tables_store.upsert(table["id"], **{k: v for k, v in table.items() if k != "id"})

detection_service = DetectionService(region_mapper, tables_store)

# Auto-load the most recent video file if one exists (DISABLED)
def _auto_load_and_start_detection():
    """
    Auto-load and start detection if a video file exists in uploads.
    DISABLED: Requires explicit admin action to upload and start detection.
    This prevents confusion where a frame appears without admin uploading a video.
    """
    # Disabled - admin must manually upload video via UI
    pass

# Don't auto-start detection - require manual upload
# _auto_load_and_start_detection()

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
detection_service = DetectionService(region_mapper, tables_store)

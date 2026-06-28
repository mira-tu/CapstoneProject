"""
region_mapper.py

Maps person bounding-box center points to table regions.

Each table region is a 4-point polygon stored in table_regions.json.
For each detected person, we check whether their (cx, cy) center point
falls inside any table polygon using OpenCV's pointPolygonTest.

Usage:
    mapper  = RegionMapper("data/table_regions.json")
    counts  = mapper.count_persons_per_table(persons)
    # returns e.g. {"T01": 2, "T02": 0, "T03": 1}
"""

import json
import cv2
import numpy as np


class RegionMapper:
    def __init__(self, regions_path: str = "data/table_regions.json"):
        """
        Load table region polygons from the JSON file.

        :param regions_path: Path to table_regions.json.
        """
        self.regions_path = regions_path
        self.regions: dict = self._load()

    def _load(self) -> dict:
        """
        Load and return table regions. Returns an empty dict if the file
        does not exist yet (first-run before calibration).
        """
        try:
            with open(self.regions_path, "r") as f:
                return json.load(f)
        except FileNotFoundError:
            return {}

    def reload(self):
        """Reload regions from disk (call after the admin saves calibration)."""
        self.regions = self._load()

    def count_persons_per_table(self, persons: list[dict]) -> dict[str, int]:
        """
        Count how many detected persons fall inside each table region.

        :param persons: List of person dicts from YoloDetector.detect().
        :returns: Dict mapping table ID → person count.
        """
        counts = {table_id: 0 for table_id in self.regions}

        for person in persons:
            cx, cy = person["cx"], person["cy"]
            for table_id, polygon_points in self.regions.items():
                poly = np.array(polygon_points, dtype=np.float32)
                # pointPolygonTest returns > 0 if the point is inside the polygon.
                if cv2.pointPolygonTest(poly, (cx, cy), measureDist=False) >= 0:
                    counts[table_id] += 1
                    break  # a person belongs to at most one table

        return counts

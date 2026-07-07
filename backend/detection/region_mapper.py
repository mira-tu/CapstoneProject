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

        Keys starting with "_" (e.g. "_comment", "_format", "_example")
        are documentation notes baked into the JSON file, not real table
        regions — they're filtered out so downstream code never mistakes
        them for a table's polygon.
        """
        try:
            with open(self.regions_path, "r") as f:
                raw = json.load(f)
        except FileNotFoundError:
            return {}
        return {k: v for k, v in raw.items() if not k.startswith("_")}

    def reload(self):
        """Reload regions from disk (call after the admin saves calibration)."""
        self.regions = self._load()

    def save_region(self, table_id: str, points: list) -> None:
        """
        Save (or replace) one table's region polygon and persist to disk.

        :param table_id: Table ID, e.g. 'T01'.
        :param points:   List of [x, y] pixel coordinate pairs (4 points
                          for a rectangle region).
        """
        self.regions[table_id] = points
        self._write()

    def delete_region(self, table_id: str) -> None:
        """Remove a table's region, e.g. when the table itself is deleted."""
        if table_id in self.regions:
            del self.regions[table_id]
            self._write()

    def _write(self) -> None:
        # Keep the file self-documenting: re-add the "_comment"/"_format"
        # metadata keys on every save, since self.regions itself only
        # holds real table entries (see _load()).
        payload = {
            "_comment": "Table region polygons saved by the Camera Calibration screen.",
            "_format":  "Each key is a table ID. Value is an array of 4 [x, y] pixel coordinate pairs.",
            **self.regions,
        }
        with open(self.regions_path, "w") as f:
            json.dump(payload, f, indent=2)

    def assign_persons_to_tables(self, persons: list[dict]) -> dict[str, list[dict]]:
        """
        Group detected persons by which table region they fall inside.

        :param persons: List of person dicts from YoloDetector.detect().
        :returns: Dict mapping table ID -> list of person dicts assigned
                  to that table (empty list if none).
        """
        assignments = {table_id: [] for table_id in self.regions}

        for person in persons:
            cx, cy = person["cx"], person["cy"]
            for table_id, polygon_points in self.regions.items():
                poly = np.array(polygon_points, dtype=np.float32)
                # pointPolygonTest returns > 0 if the point is inside the polygon.
                if cv2.pointPolygonTest(poly, (cx, cy), measureDist=False) >= 0:
                    assignments[table_id].append(person)
                    break  # a person belongs to at most one table

        return assignments

    def count_persons_per_table(self, persons: list[dict]) -> dict[str, int]:
        """
        Count how many detected persons fall inside each table region.

        :param persons: List of person dicts from YoloDetector.detect().
        :returns: Dict mapping table ID → person count.
        """
        assignments = self.assign_persons_to_tables(persons)
        return {table_id: len(people) for table_id, people in assignments.items()}

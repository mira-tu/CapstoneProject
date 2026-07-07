"""
table_tracker.py

Tracks 'dining table' detections (COCO class 60) across video frames to
detect when two tables have been physically pushed together (merged).

How merge detection works (simple centroid + adjacency approach):
    1. Each frame, YOLOv8 also detects dining-table objects (not just persons).
    2. We match each detected table blob to the closest known table region
       by centroid distance, as long as it's within MERGE_DISTANCE_PX.
    3. If a table's detected blob centroid drifts far enough from its own
       calibrated region AND lands inside a neighboring table's region,
       we flag the two tables as merged.
    4. If a previously-merged table's blob moves back near its own region
       and away from its neighbor, the merge is cleared.

This is intentionally simple (centroid distance, not full multi-object
tracking with IDs) — it is good enough to catch "table dragged next to
another table" without needing a trained re-identification model.

Usage:
    tracker = TableTracker(region_mapper)
    merges  = tracker.update(table_boxes)
    # merges -> {"T01": "T02"} meaning T01 has been pushed into T02's region
"""

import numpy as np


class TableTracker:
    # How close (in pixels) a table blob's centroid must be to a region's
    # centroid to count as "still in its own spot" vs "moved elsewhere".
    OWN_REGION_TOLERANCE_PX = 40

    # How close a table blob's centroid must be to a *different* table's
    # region centroid to count as "pushed into that table".
    NEIGHBOR_MERGE_TOLERANCE_PX = 60

    def __init__(self, region_mapper):
        """
        :param region_mapper: RegionMapper instance — source of truth for
                               each table's calibrated region polygon.
        """
        self.region_mapper = region_mapper
        # Cache of {table_id: (cx, cy)} for each region's own centroid.
        self._region_centroids = {}
        self._refresh_region_centroids()

    def _refresh_region_centroids(self):
        self._region_centroids = {}
        for table_id, points in self.region_mapper.regions.items():
            if not points:
                continue
            poly = np.array(points, dtype=np.float32)
            cx, cy = poly.mean(axis=0)
            self._region_centroids[table_id] = (float(cx), float(cy))

    @staticmethod
    def _distance(a, b):
        return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5

    # A detected table blob only "belongs to" a region if it's within this
    # distance of that region's own centroid. Prevents a region with no
    # matching blob at all from being falsely matched to some other
    # region's blob (see _match_blobs_to_regions docstring).
    MAX_BLOB_MATCH_DISTANCE_PX = 250

    def _match_blobs_to_regions(self, table_boxes: list[dict]) -> dict[str, dict]:
        """
        Match each calibrated region to AT MOST ONE detected table blob,
        and each detected blob to AT MOST ONE region (one-to-one, closest
        pair first) — a real bipartite nearest-neighbor match, not "closest
        blob to each region independently".

        Why this matters: if there's only one detected table blob and two
        calibrated regions, matching independently would assign that same
        blob to BOTH regions (whichever one is "closest" to it), making the
        farther region look like it drifted far from "its own" blob when
        really it just never had a blob to begin with. That produced a
        false merge in testing against real footage.

        :returns: Dict of {table_id: blob} only for regions that actually
                  have a plausible matching blob within MAX_BLOB_MATCH_DISTANCE_PX.
        """
        pairs = []
        for table_id, region_centroid in self._region_centroids.items():
            for i, box in enumerate(table_boxes):
                dist = self._distance((box["cx"], box["cy"]), region_centroid)
                if dist <= self.MAX_BLOB_MATCH_DISTANCE_PX:
                    pairs.append((dist, table_id, i))

        pairs.sort(key=lambda p: p[0])

        matched = {}
        used_table_ids = set()
        used_box_indices = set()
        for dist, table_id, box_idx in pairs:
            if table_id in used_table_ids or box_idx in used_box_indices:
                continue
            matched[table_id] = table_boxes[box_idx]
            used_table_ids.add(table_id)
            used_box_indices.add(box_idx)

        return matched

    def update(self, table_boxes: list[dict]) -> dict[str, str]:
        """
        Given this frame's detected dining-table boxes, return which
        calibrated tables currently look merged into a neighbor.

        :param table_boxes: List of dicts with keys x1,y1,x2,y2,cx,cy,conf
                             (same shape as YoloDetector person boxes, but
                             for the 'dining table' class).
        :returns: Dict of {table_id: merged_into_table_id} for every table
                  currently detected as pushed into a neighbor's region.
                  Empty dict means no merges detected this frame.
        """
        self._refresh_region_centroids()
        if not table_boxes or not self._region_centroids:
            return {}

        blob_by_table = self._match_blobs_to_regions(table_boxes)
        merges = {}

        for table_id, own_centroid in self._region_centroids.items():
            matched_blob = blob_by_table.get(table_id)
            # No plausible blob for this region at all this frame (occluded,
            # missed detection, or genuinely just not visible) — nothing to
            # compare, so don't guess. This is different from "found a blob
            # but it's far away", which is the actual merge signal.
            if matched_blob is None:
                continue

            blob_centroid = (matched_blob["cx"], matched_blob["cy"])
            dist_from_own = self._distance(blob_centroid, own_centroid)

            # Still sitting in its own spot — no merge.
            if dist_from_own <= self.OWN_REGION_TOLERANCE_PX:
                continue

            # Drifted — check if it's now sitting near a neighbor's region.
            nearest_neighbor_id, nearest_neighbor_dist = None, float("inf")
            for other_id, other_centroid in self._region_centroids.items():
                if other_id == table_id:
                    continue
                d = self._distance(blob_centroid, other_centroid)
                if d < nearest_neighbor_dist:
                    nearest_neighbor_id, nearest_neighbor_dist = other_id, d

            if (
                nearest_neighbor_id is not None
                and nearest_neighbor_dist <= self.NEIGHBOR_MERGE_TOLERANCE_PX
            ):
                merges[table_id] = nearest_neighbor_id

        return merges

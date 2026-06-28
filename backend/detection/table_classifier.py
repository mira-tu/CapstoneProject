"""
table_classifier.py

Classifies each table's status from its person count and chair capacity.

Three-status rule (from project spec):
    P == 0          → 'vacant'   (Available)
    0 < P < C       → 'partial'  (Partially Occupied)
    P >= C          → 'full'     (Fully Occupied)

Admin-set statuses ('reserved', 'maintenance') are passed through unchanged.

Usage:
    classifier = TableClassifier()
    status = classifier.classify(occupied=2, capacity=4)  # → 'partial'
"""

# Statuses that a human admin has set — never override these with detection.
MANUAL_STATUSES = {"reserved", "maintenance"}


class TableClassifier:
    @staticmethod
    def classify(occupied: int, capacity: int) -> str:
        """
        Return the occupancy status for a table.

        :param occupied: Number of persons detected inside the table region.
        :param capacity: Admin-configured chair capacity for this table.
        :returns: 'vacant', 'partial', or 'full'.
        """
        if occupied <= 0:
            return "vacant"
        if occupied < capacity:
            return "partial"
        return "full"

    @staticmethod
    def should_update(current_status: str) -> bool:
        """
        Return False if the table is under manual admin control
        and must not be updated by the detection engine.
        """
        return current_status not in MANUAL_STATUSES

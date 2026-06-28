"""
models/table.py

Python dataclass for a TABLEYE table record.
Used as the shared data structure passed between the detection engine,
the Flask routes, and the Supabase integration.
"""

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Table:
    id:         str
    label:      str
    floor:      int
    capacity:   int
    occupied:   int                    = 0
    status:     str                    = "vacant"   # vacant | partial | full | reserved | maintenance | merged
    auto:       bool                   = True        # False when admin has set a manual status
    conf:       Optional[float]        = None        # Last YOLOv8 detection confidence
    x:          Optional[float]        = None        # Floor plan position (% of canvas width)
    y:          Optional[float]        = None        # Floor plan position (% of canvas height)
    coordinates: list                  = field(default_factory=list)  # 4-point polygon from calibration

    def to_dict(self) -> dict:
        """Serialize to a plain dict for JSON responses."""
        return {
            "id":          self.id,
            "label":       self.label,
            "floor":       self.floor,
            "capacity":    self.capacity,
            "occupied":    self.occupied,
            "status":      self.status,
            "auto":        self.auto,
            "conf":        self.conf,
            "x":           self.x,
            "y":           self.y,
            "coordinates": self.coordinates,
        }

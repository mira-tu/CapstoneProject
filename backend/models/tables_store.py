"""
tables_store.py

In-memory table registry: id, label, floor, capacity, and manual status
overrides (reserved / maintenance) set by the admin.

This exists because Supabase isn't wired up yet (see backend/routes/tables.py
TODOs). It's a simple, thread-safe stand-in so the detection service has
something real to read capacity from, and the admin UI has somewhere to
save table info and manual overrides.

When Supabase is ready, replace the dict-based storage in this file with
real DB reads/writes — the get()/upsert()/set_status() method shapes below
are written to make that swap easy later.

Usage:
    store = TablesStore()
    store.upsert("T01", label="Window Booth", capacity=4)
    store.set_status("T01", "reserved")
    info = store.get("T01")   # {"id": "T01", "label": ..., "capacity": 4, "status": "reserved"}
"""

import threading


class TablesStore:
    def __init__(self):
        self._lock = threading.Lock()
        self._tables = {}

    def upsert(self, table_id: str, **fields) -> dict:
        """Create or update a table's metadata. Returns the stored record."""
        with self._lock:
            record = self._tables.setdefault(table_id, {
                "id": table_id,
                "label": table_id,
                "floor": 1,
                "capacity": 4,
                "status": "vacant",
            })
            record.update({k: v for k, v in fields.items() if v is not None})
            return dict(record)

    def get(self, table_id: str) -> dict | None:
        with self._lock:
            record = self._tables.get(table_id)
            return dict(record) if record else None

    def get_all(self) -> list[dict]:
        with self._lock:
            return [dict(v) for v in self._tables.values()]

    def set_status(self, table_id: str, status: str) -> dict | None:
        """Apply a manual admin status override (e.g. 'reserved')."""
        return self.upsert(table_id, status=status)

    def delete(self, table_id: str) -> bool:
        with self._lock:
            return self._tables.pop(table_id, None) is not None

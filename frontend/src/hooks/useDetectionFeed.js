import { useEffect, useRef } from 'react';

const POLL_INTERVAL_MS = 2000;

/**
 * useDetectionFeed
 *
 * Polls the real Flask detection backend (GET /api/detection/status) on an
 * interval and merges the results into the tables state. This replaces the
 * old useTableSimulation/useMergeSimulation hooks — occupancy and merges
 * now come from actual YOLOv8 inference on the uploaded video, not from
 * random simulated changes.
 *
 * A log entry is written only when a table's status actually changes,
 * matching the existing "log on change, not every poll" design.
 *
 * @param {boolean}  enabled   - Whether polling is active (mirrors the old simEnabled toggle).
 * @param {Function} setTables - React state setter for the tables array.
 * @param {Function} addLog    - addLog function from useOccupancyLog.
 * @returns {{ running: boolean, error: string|null }} Latest detection engine status.
 */
export function useDetectionFeed(enabled, setTables, addLog) {
  const tablesRef = useRef([]);
  const statusRef = useRef({ running: false, error: null });

  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch('/api/detection/status');
        if (!res.ok) throw new Error(`Detection status request failed: ${res.status}`);
        const data = await res.json();
        if (cancelled) return;

        statusRef.current = { running: data.running, error: data.error };

        const byId = {};
        (data.tables || []).forEach(t => { byId[t.tableId] = t; });

        setTables(prev => {
          tablesRef.current = prev;
          const changes = [];

          const next = prev.map(table => {
            const detected = byId[table.id];
            // No detection data yet for this table (e.g. not calibrated) —
            // leave it untouched rather than guessing.
            if (!detected) return table;

            // Manual overrides (reserved/maintenance) are owned by the admin,
            // never by the detection feed.
            if (!table.auto) return table;

            const nextStatus = detected.status;
            if (nextStatus !== table.status) {
              changes.push({ table, previous: table.status, current: nextStatus });
            }

            return {
              ...table,
              occupied: detected.personCount,
              capacity: detected.capacity ?? table.capacity,
              status: nextStatus,
              conf: detected.confidence != null ? Math.round(detected.confidence * 100) : table.conf,
              mergeId: detected.mergeGroup || null,
            };
          });

          changes.forEach(c => addLog(
            c.table,
            c.previous,
            c.current,
            'YOLOv8 Detection',
          ));

          return next;
        });
      } catch (err) {
        if (!cancelled) statusRef.current = { running: false, error: err.message };
      }
    };

    poll(); // fire immediately, then on interval
    const timer = window.setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [enabled, setTables, addLog]);

  return statusRef.current;
}

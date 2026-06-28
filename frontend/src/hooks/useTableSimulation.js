import { useEffect, useRef } from 'react';
import { computeStatus, MANUAL_STATUSES } from '../constants/tableStatus';

/**
 * useTableSimulation
 *
 * Simulates the YOLOv8 detection feed during the prototype stage.
 * Every 3 seconds, each AUTO table's person count is nudged ±1
 * (staying within [0, capacity]). Status is recomputed and a log
 * entry is written only when the status actually changes.
 *
 * This hook will be removed / replaced once the real Flask API is connected.
 *
 * @param {boolean}  simEnabled - Whether the simulation is running.
 * @param {Function} setTables  - React state setter for the tables array.
 * @param {Function} addLog     - addLog function from useOccupancyLog.
 */
export function useTableSimulation(simEnabled, setTables, addLog) {
  // Keep a ref to the latest tables array so the interval callback can
  // read current values without being re-created on every render.
  const tablesRef = useRef([]);

  // Keep tablesRef in sync by letting the parent pass it through setTables,
  // but we also expose a setter so the parent can wire it up.
  const syncRef = (tables) => {
    tablesRef.current = tables;
  };

  useEffect(() => {
    if (!simEnabled) return undefined;

    const tick = () => {
      const changes = [];

      setTables(prev => {
        tablesRef.current = prev; // keep ref fresh inside the updater
        return prev.map(table => {
          // Skip manually-overridden tables and tables in a merged group.
          if (!table.auto || MANUAL_STATUSES.includes(table.status) || table.mergeId) {
            return table;
          }

          // 50% chance this table stays the same tick — makes changes feel natural.
          if (Math.random() < 0.5) return table;

          const capacity = table.capacity || 4;
          const step = Math.random() < 0.5 ? -1 : 1;
          const nextOccupied = Math.min(capacity, Math.max(0, (table.occupied || 0) + step));
          const nextStatus = computeStatus(nextOccupied, capacity);

          if (nextStatus !== table.status) {
            changes.push({ table, previous: table.status, current: nextStatus });
          }

          return {
            ...table,
            occupied: nextOccupied,
            status: nextStatus,
            // Simulate a believable YOLOv8 detection confidence score.
            conf: 85 + Math.floor(Math.random() * 14),
          };
        });
      });

      // Write log entries outside the state updater to avoid side effects.
      changes.forEach(c => addLog(c.table, c.previous, c.current, 'YOLOv8 Auto'));
    };

    const timer = window.setInterval(tick, 3000);
    return () => window.clearInterval(timer);
  }, [simEnabled, setTables, addLog]);

  return { syncRef };
}

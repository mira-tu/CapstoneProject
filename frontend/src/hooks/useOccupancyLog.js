import { useState, useCallback } from 'react';
import { STATUS_LABEL } from '../constants/tableStatus';

/**
 * useOccupancyLog
 *
 * Manages the historical occupancy log.
 * Log entries are written only when a table's status actually changes
 * (per project scope: "log on status change, not every second").
 *
 * @returns {{ logs: Array, addLog: Function }}
 */
export function useOccupancyLog() {
  const [logs, setLogs] = useState([]);

  /**
   * Append one entry to the log.
   * @param {object} table    - The table object that changed.
   * @param {string} previous - Previous status key.
   * @param {string} current  - New status key.
   * @param {string} source   - What triggered the change (e.g. 'YOLOv8 Auto', 'Manual Override').
   */
  const addLog = useCallback((table, previous, current, source) => {
    setLogs(prev => [
      {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        table: table.id,
        previous: STATUS_LABEL[previous] || previous,
        current: STATUS_LABEL[current] || current,
        source,
      },
      ...prev,
    ].slice(0, 50)); // keep at most 50 entries so memory stays bounded
  }, []);

  return { logs, addLog };
}

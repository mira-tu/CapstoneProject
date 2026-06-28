import { useEffect, useRef } from 'react';
import { computeStatus } from '../constants/tableStatus';

/**
 * useMergeSimulation
 *
 * Demonstrates the "merged table" feature for the prototype stage.
 * Every 12 seconds, tables T01 and T02 are toggled between merged
 * and split states so the Public Lobby shows what a combined table
 * looks like on the floor plan.
 *
 * This hook will be replaced by real merge detection from the Flask API.
 *
 * @param {boolean}  simEnabled - Whether the simulation is running.
 * @param {Function} setTables  - React state setter for the tables array.
 * @param {Function} addLog     - addLog function from useOccupancyLog.
 */
export function useMergeSimulation(simEnabled, setTables, addLog) {
  const tablesRef = useRef([]);

  useEffect(() => {
    if (!simEnabled) return undefined;

    // The two tables that will be demo-merged in the prototype.
    const MERGE_PAIR = ['T01', 'T02'];
    let merged = false;

    const toggleMerge = () => {
      merged = !merged;

      setTables(prev => {
        tablesRef.current = prev;
        return prev.map(t => {
          if (!MERGE_PAIR.includes(t.id)) return t;

          if (merged) {
            // Mark both tables as part of merge group 'M1'.
            return { ...t, status: 'merged', mergeId: 'M1', auto: false };
          }
          // Split: restore each table's status from its current person count.
          const restored = computeStatus(t.occupied || 0, t.capacity || 4);
          return { ...t, status: restored, mergeId: null, auto: true };
        });
      });

      // Log the merge or split event against the lead table.
      const lead = tablesRef.current.find(t => t.id === MERGE_PAIR[0]);
      if (lead) {
        addLog(
          lead,
          lead.status,
          merged ? 'merged' : computeStatus(lead.occupied || 0, lead.capacity || 4),
          merged ? 'Merge Detected' : 'Split Detected',
        );
      }
    };

    const timer = window.setInterval(toggleMerge, 12000);
    return () => window.clearInterval(timer);
  }, [simEnabled, setTables, addLog]);
}

/**
 * detectionApi.js
 *
 * All HTTP calls related to the YOLOv8 detection engine.
 *
 * These are NOT called yet during the prototype stage.
 * Connect these once the Flask detection backend is running.
 */

const BASE_URL = '/api';

/**
 * Fetch the latest detection results from the Flask backend.
 * Flask route: GET /api/detection/status
 * Returns per-table person counts from the most recent YOLOv8 frame.
 * @returns {Promise<Array>} Array of { tableId, personCount, confidence }.
 */
export async function getDetectionStatus() {
  const res = await fetch(`${BASE_URL}/detection/status`);
  if (!res.ok) throw new Error(`Failed to fetch detection status: ${res.statusText}`);
  return res.json();
}

/**
 * Fetch current camera / detection settings.
 * Flask route: GET /api/detection/settings
 * @returns {Promise<object>} { rtspUrl, fps, confidence }
 */
export async function getDetectionSettings() {
  const res = await fetch(`${BASE_URL}/detection/settings`);
  if (!res.ok) throw new Error(`Failed to fetch detection settings: ${res.statusText}`);
  return res.json();
}

/**
 * Save updated camera / detection settings.
 * Flask route: POST /api/detection/settings
 * @param {object} settings - { rtspUrl, fps, confidence }
 * @returns {Promise<object>} Saved settings confirmation.
 */
export async function saveDetectionSettings(settings) {
  const res = await fetch(`${BASE_URL}/detection/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error(`Failed to save detection settings: ${res.statusText}`);
  return res.json();
}

/**
 * tablesApi.js
 *
 * All HTTP calls related to table data.
 * This is the only place in the frontend that knows the API URL.
 *
 * During the prototype stage these functions are NOT called yet —
 * the app uses the simulation hooks instead.
 *
 * When the Flask backend is ready, import these functions in the
 * relevant page/hook and replace the simulated data with real responses.
 */

const BASE_URL = '/api'; // Vite proxies /api → http://localhost:5000

/**
 * Fetch all tables with their current occupancy status.
 * Flask route: GET /api/tables
 * @returns {Promise<Array>} Array of table objects.
 */
export async function getTables() {
  const res = await fetch(`${BASE_URL}/tables`);
  if (!res.ok) throw new Error(`Failed to fetch tables: ${res.statusText}`);
  return res.json();
}

/**
 * Update a table's status (manual override from admin).
 * Flask route: PATCH /api/tables/:id
 * @param {string} id     - Table ID (e.g. 'T01').
 * @param {object} update - Fields to update (e.g. { status: 'reserved' }).
 * @returns {Promise<object>} Updated table object.
 */
export async function updateTable(id, update) {
  const res = await fetch(`${BASE_URL}/tables/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  if (!res.ok) throw new Error(`Failed to update table ${id}: ${res.statusText}`);
  return res.json();
}

/**
 * Save calibration coordinates for a table region.
 * Flask route: POST /api/tables/:id/calibration
 * @param {string}   id     - Table ID.
 * @param {number[][]} points - Array of 4 [x, y] coordinate pairs.
 * @returns {Promise<object>} Confirmation with saved centroid position.
 */
export async function saveCalibration(id, points) {
  const res = await fetch(`${BASE_URL}/tables/${id}/calibration`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ points }),
  });
  if (!res.ok) throw new Error(`Failed to save calibration for ${id}: ${res.statusText}`);
  return res.json();
}

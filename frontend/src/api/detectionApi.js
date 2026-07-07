/**
 * detectionApi.js
 *
 * All HTTP calls related to the YOLOv8 detection engine.
 * Handles video upload, detection control, and live results polling.
 */

const BASE_URL = '/api';

/**
 * Upload a video file to the backend for detection.
 * Flask route: POST /api/detection/upload
 * @param {File} videoFile - Video file from input[type="file"]
 * @returns {Promise<object>} { uploaded: true, videoUrl: "/api/detection/video/..." }
 */
export async function uploadVideo(videoFile) {
  const formData = new FormData();
  formData.append('video', videoFile);
  
  const res = await fetch(`${BASE_URL}/detection/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`Failed to upload video: ${res.statusText}`);
  return res.json();
}

/**
 * Fetch the latest detection results from the Flask backend.
 * Flask route: GET /api/detection/status
 * Returns per-table person counts from the most recent YOLOv8 frame.
 * @returns {Promise<object>} { running, error, tables: [...] }
 */
export async function getDetectionStatus() {
  const res = await fetch(`${BASE_URL}/detection/status`);
  if (!res.ok) throw new Error(`Failed to fetch detection status: ${res.statusText}`);
  return res.json();
}

/**
 * Start the background detection loop.
 * Flask route: POST /api/detection/start
 * @returns {Promise<object>} { running: true }
 */
export async function startDetection() {
  const res = await fetch(`${BASE_URL}/detection/start`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to start detection: ${res.statusText}`);
  return res.json();
}

/**
 * Stop the background detection loop.
 * Flask route: POST /api/detection/stop
 * @returns {Promise<object>} { running: false }
 */
export async function stopDetection() {
  const res = await fetch(`${BASE_URL}/detection/stop`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to stop detection: ${res.statusText}`);
  return res.json();
}

/**
 * Fetch a calibration frame from the loaded video.
 * Flask route: GET /api/detection/frame
 * Returns JPEG binary data.
 * @returns {Promise<Blob>} JPEG image
 */
export async function getCalibrationFrame() {
  const res = await fetch(`${BASE_URL}/detection/frame`);
  if (!res.ok) throw new Error(`Failed to fetch calibration frame: ${res.statusText}`);
  return res.blob();
}

/**
 * Fetch the video frame dimensions for coordinate mapping.
 * Flask route: GET /api/detection/frame/dimensions
 * @returns {Promise<object>} { width: number, height: number }
 */
export async function getFrameDimensions() {
  const res = await fetch(`${BASE_URL}/detection/frame/dimensions`);
  if (!res.ok) throw new Error(`Failed to fetch frame dimensions: ${res.statusText}`);
  return res.json();
}

/**
 * Fetch current camera / detection settings.
 * Flask route: GET /api/detection/settings
 * @returns {Promise<object>} { rtspUrl, fps, confidence, videoUrl }
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

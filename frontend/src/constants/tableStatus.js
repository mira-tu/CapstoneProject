/**
 * tableStatus.js
 * Single source of truth for all table status logic and labels.
 * Import from here instead of defining these in individual components.
 */

// Statuses that a human admin has set manually.
// The simulation / YOLOv8 engine must NOT overwrite these.
export const MANUAL_STATUSES = ['reserved', 'maintenance'];

/**
 * Compute a table's occupancy status from person count and chair capacity.
 *
 * P = persons detected inside the table region
 * C = admin-configured chair capacity
 *
 *   P == 0      → 'vacant'   (Available)
 *   0 < P < C   → 'partial'  (Partially Occupied)
 *   P >= C      → 'full'     (Fully Occupied)
 *
 * @param {number} occupied - Number of persons detected.
 * @param {number} capacity - Chair capacity configured by admin.
 * @returns {'vacant'|'partial'|'full'}
 */
export const computeStatus = (occupied, capacity) => {
  if (occupied <= 0) return 'vacant';
  if (occupied < capacity) return 'partial';
  return 'full';
};

/** Human-readable labels for use in logs and UI text. */
export const STATUS_LABEL = {
  vacant: 'Vacant',
  partial: 'Partial',
  full: 'Full',
  reserved: 'Reserved',
  maintenance: 'Maintenance',
  merged: 'Merged',
};

/**
 * Full styling metadata per status.
 * Used by PublicDashboard legend and FloorPlanTable color theming.
 */
export const STATUS_META = {
  vacant: {
    label: 'Available/Unoccupied',
    dot: 'bg-green-500',
    text: 'text-green-300',
    border: 'border-green-500',
    bg: 'bg-green-500/15',
  },
  partial: {
    label: 'Partially Occupied',
    dot: 'bg-yellow-500',
    text: 'text-yellow-300',
    border: 'border-yellow-500',
    bg: 'bg-yellow-500/15',
  },
  full: {
    label: 'Fully Occupied',
    dot: 'bg-red-500',
    text: 'text-red-300',
    border: 'border-red-500',
    bg: 'bg-red-500/15',
  },
  merged: {
    label: 'Merged Table/s',
    dot: 'bg-orange-500',
    text: 'text-orange-300',
    border: 'border-orange-500',
    bg: 'bg-orange-500/15',
  },
  reserved: {
    label: 'Reserved/Under Maintenance',
    dot: 'bg-slate-500',
    text: 'text-slate-300',
    border: 'border-slate-600',
    bg: 'bg-slate-700/60',
  },
  maintenance: {
    label: 'Reserved/Under Maintenance',
    dot: 'bg-slate-500',
    text: 'text-slate-300',
    border: 'border-slate-600',
    bg: 'bg-slate-700/60',
  },
};

/** Tailwind color classes for each status used by TableCard (admin light theme). */
export const STATUS_COLORS_LIGHT = {
  vacant:      'border-green-400 bg-green-50 text-green-800',
  full:        'border-red-400 bg-red-50 text-red-800',
  partial:     'border-yellow-400 bg-yellow-50 text-yellow-800',
  maintenance: 'border-slate-300 bg-slate-100 text-slate-600',
  reserved:    'border-blue-300 bg-blue-50 text-blue-700',
  merged:      'border-orange-400 bg-orange-50 text-orange-800',
};

/** Tailwind color classes for each status used by TableCard (public dark theme). */
export const STATUS_COLORS_DARK = {
  vacant:      'border-green-500 bg-green-950 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]',
  full:        'border-slate-800 bg-slate-800 text-slate-500 opacity-50',
  partial:     'border-yellow-500 bg-yellow-950 text-yellow-400',
  maintenance: 'border-slate-800 bg-slate-900 text-slate-600 border-dashed',
  reserved:    'border-blue-700 bg-blue-950 text-blue-400',
  merged:      'border-orange-500 bg-orange-950 text-orange-400',
};

/** Tailwind color theme for FloorPlanTable chair/table coloring. */
export const STATUS_THEME = {
  vacant: {
    table: 'bg-green-600/90 border-green-300',
    chair: 'bg-green-400 border-green-200',
    text: 'text-white',
  },
  partial: {
    table: 'bg-yellow-500/90 border-yellow-200',
    chair: 'bg-yellow-300 border-yellow-100',
    text: 'text-yellow-950',
  },
  full: {
    table: 'bg-red-600/90 border-red-300',
    chair: 'bg-red-400 border-red-200',
    text: 'text-white',
  },
  merged: {
    table: 'bg-orange-600/90 border-orange-300',
    chair: 'bg-orange-400 border-orange-200',
    text: 'text-white',
  },
  reserved: {
    table: 'bg-slate-600/90 border-slate-400',
    chair: 'bg-slate-500 border-slate-400',
    text: 'text-slate-100',
  },
  maintenance: {
    table: 'bg-slate-600/90 border-slate-400',
    chair: 'bg-slate-500 border-slate-400',
    text: 'text-slate-100',
  },
};

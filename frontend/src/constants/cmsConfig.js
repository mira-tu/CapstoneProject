/**
 * cmsConfig.js
 * Single source of truth for the public dashboard "CMS" defaults.
 * Edited by admins via the CMS editor in AdminSettings, consumed by PublicDashboard.
 *
 * NOTE: backgroundColor/textColor default to the dashboard's current dark theme
 * (slate-950 / white) so the public dashboard looks unchanged until an admin
 * explicitly customizes it.
 */
export const DEFAULT_CMS_CONFIG = {
  brandName: 'TABLEYE',
  welcomeMessage: 'Live Occupancy Dashboard',
  logo: null,
  backgroundImage: null,
  floorPlanImage: null,
  themeColor: '#3b82f6',
  sidebarColor: '#0f172a',
  accentColor: '#10b981',
  backgroundColor: '#020617',
  textColor: '#ffffff',
  showLiveVideoPublicly: true,
  showOccupancyStats: true,
  showTableList: true,
  footerText: '© 2026 TABLEYE. All Rights Reserved.',
};

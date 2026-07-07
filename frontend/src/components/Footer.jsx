import React from 'react';

/**
 * Footer
 *
 * Reusable footer component for TABLEYE admin pages.
 *
 * @param {string} text - Footer text. Falls back to the default copyright line
 *                         if not provided (e.g. before CMS config loads).
 */
export default function Footer({ text = '© 2026 TABLEYE. All Rights Reserved.' }) {
  return (
    <footer className="mt-12 w-full border-t border-slate-200 bg-gradient-to-b from-slate-50/50 to-slate-100 py-6 text-center text-xs font-medium tracking-wide text-slate-400">
      {text}
    </footer>
  );
}

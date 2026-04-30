/** Design tokens — course detail reference (8px spacing grid). */

export const colors = {
  primary: '#3b82f6',
  /** Course title & key headings (reference deep blue) */
  headingNavy: '#1e3a8a',
  text: '#111827',
  muted: '#6b7280',
  border: '#e5e7eb',
  bg: '#f9fafb',
  white: '#ffffff',
  star: '#fbbf24',
  starEmpty: '#e5e7eb',
};

export const radii = {
  card: '12px',
  pill: '999px',
};

export const shadow = {
  card: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
  cardHover: '0 12px 24px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04)',
};

/** n = number of 8px units */
export const space = (n) => `${n * 8}px`;

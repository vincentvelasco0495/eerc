/** TinyMCE-like chrome tokens (reference UI). */
export const TINYMCE = {
  /** Reference TinyMCE active tool background */
  activeBg: '#bbdefb',
  border: 'rgba(0, 0, 0, 0.12)',
  chromeSurface: '#ffffff',
  /** Main frame behind toolbar + editor panels */
  frameBg: '#f5f5f5',
  hairline: '#e5e5e5',
  rowDivider: '#e5e5e5',
  menuColor: 'text.secondary',
  controlHeight: 26,
  iconBtnSize: 24,
  buttonRadius: '6px',
  /** Space between toolbar control groups (px) */
  groupGapPx: 16,
  toolbarShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
};

export const TEXT_COLORS = [
  '#000000',
  '#4d4d4d',
  '#808080',
  '#b3b3b3',
  '#e06666',
  '#f6b26b',
  '#ffd966',
  '#93c47d',
  '#76a5af',
  '#6d9eeb',
  '#8e7cc3',
  '#ffffff',
];

export const HIGHLIGHT_COLORS = [
  '#fef08a',
  '#fde047',
  '#fdba74',
  '#fca5a5',
  '#86efac',
  '#7dd3fc',
  '#c4b5fd',
  '#fbcfe8',
  '#e5e5e5',
  '#ffffff',
];

export const FONT_FAMILIES = [
  { label: 'System Font', value: '', cssFamily: 'inherit' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif', cssFamily: 'Arial, Helvetica, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif', cssFamily: 'Georgia, serif' },
  {
    label: 'Times New Roman',
    value: '"Times New Roman", Times, serif',
    cssFamily: '"Times New Roman", Times, serif',
  },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif', cssFamily: 'Verdana, Geneva, sans-serif' },
  {
    label: 'Courier New',
    value: '"Courier New", Courier, monospace',
    cssFamily: '"Courier New", Courier, monospace',
  },
];

export const FONT_SIZE_STEPS = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px'];

export const LINE_HEIGHT_OPTIONS = [
  { label: '1', value: '1' },
  { label: '1.15', value: '1.15' },
  { label: '1.5', value: '1.5' },
  { label: '2', value: '2' },
];

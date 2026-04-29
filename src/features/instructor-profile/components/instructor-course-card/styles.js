const COURSE_ART = {
  cobalt: ['#0f172a', '#1d4ed8', '#60a5fa'],
  stone: ['#332f2f', '#6b7280', '#d6d3d1'],
  sky: ['#0f172a', '#0284c7', '#7dd3fc'],
  amber: ['#451a03', '#d97706', '#fcd34d'],
  violet: ['#2e1065', '#7c3aed', '#c4b5fd'],
  forest: ['#052e16', '#15803d', '#86efac'],
};

export function getCourseArtSx(tone) {
  const [base, mid, accent] = COURSE_ART[tone] ?? COURSE_ART.cobalt;

  return {
    position: 'relative',
    minHeight: 146,
    overflow: 'hidden',
    borderRadius: 2,
    color: 'common.white',
    backgroundImage: `linear-gradient(135deg, ${base} 0%, ${mid} 55%, ${accent} 100%)`,
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 'auto -14% -36% auto',
      width: 148,
      height: 148,
      borderRadius: '50%',
      bgcolor: 'rgba(255,255,255,0.16)',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      left: '-14%',
      top: '-18%',
      width: 190,
      height: 118,
      borderRadius: '45%',
      bgcolor: 'rgba(255,255,255,0.11)',
      transform: 'rotate(-12deg)',
    },
  };
}

export const styles = {
  card: {
    width: 1,
    height: '100%',
    borderRadius: 2.5,
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'none',
  },
  cardContent: { p: 1.5 },
  categoryCaptionOuter: { opacity: 0.84 },
  badgeChip: { height: 24, '& .MuiChip-label': { px: 1, fontWeight: 700 } },
  artIconStack: {
    mt: 3.5,
    width: 56,
    height: 56,
    borderRadius: 2,
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'rgba(255,255,255,0.14)',
    backdropFilter: 'blur(8px)',
  },
  categoryCaption: { color: 'text.secondary' },
  title: { minHeight: 58, lineHeight: 1.3 },
  courseMetaIcon: { color: 'text.secondary' },
  courseMetaText: { color: 'text.secondary' },
  ratingCaption: { color: 'text.secondary' },
  statusCaption: { color: 'text.secondary' },
  statusChip: { width: 'fit-content', textTransform: 'capitalize' },
  updatedCaption: { color: 'text.secondary' },
  updatedValue: { fontWeight: 600 },
};

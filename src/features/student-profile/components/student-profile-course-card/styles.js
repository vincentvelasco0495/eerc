const ART_VARIANTS = {
  stage: ['#171822', '#98234f', '#ff9165'],
  linen: ['#d4d7d5', '#e9e0d5', '#a5b28e'],
  slate: ['#242a35', '#485767', '#7a8ea6'],
  studio: ['#102146', '#1d82cf', '#ff924c'],
  graphite: ['#17181d', '#464a52', '#d8cbc0'],
  ember: ['#2d1d1c', '#9b3a4d', '#f39b4a'],
  cobalt: ['#0d2d53', '#386cbf', '#55b6ff'],
};

export function cardArtSx(variant) {
  const [base, mid, accent] = ART_VARIANTS[variant] ?? ART_VARIANTS.cobalt;

  return {
    position: 'relative',
    minHeight: 180,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundImage: `linear-gradient(135deg, ${base} 0%, ${mid} 58%, ${accent} 100%)`,
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 'auto -10% -30% auto',
      width: 150,
      height: 150,
      borderRadius: '50%',
      bgcolor: 'rgba(255,255,255,0.18)',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      left: '-12%',
      top: '-18%',
      width: 190,
      height: 130,
      borderRadius: '45%',
      bgcolor: 'rgba(255,255,255,0.1)',
      transform: 'rotate(-10deg)',
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
  cardContent: { p: 2 },
  badgeChip: { ml: 'auto', display: 'flex', width: 'fit-content' },
  categoryCaption: { color: 'text.secondary' },
  title: { minHeight: 58, lineHeight: 1.35 },
  courseMetaPill: {
    px: 1,
    py: 0.6,
    borderRadius: 1,
    bgcolor: 'background.neutral',
    color: 'text.secondary',
  },
  ratingCaption: { color: 'text.secondary' },
  startCourseBtn: { py: 1.2 },
  startedCaption: { color: 'text.secondary', textAlign: 'center' },
};

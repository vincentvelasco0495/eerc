export const GRADE_STYLES = {
  'A+': { bg: '#1f7aff', color: '#ffffff' },
  A: { bg: '#3c82f6', color: '#ffffff' },
  'B+': { bg: '#f59e0b', color: '#ffffff' },
  B: { bg: '#fb923c', color: '#ffffff' },
  'C-': { bg: '#dc2626', color: '#ffffff' },
};

export const styles = {
  mainRow: { py: 1.75 },
  primaryStack: { minWidth: 0, flex: '1 1 auto' },
  quizTitle: { fontWeight: 700 },
  statusChip: { height: 20, fontSize: 10, fontWeight: 700 },
  metricSep: { color: 'text.disabled' },
  metricText: { color: 'text.secondary' },
  actionsStrip: {
    width: { xs: 1, lg: 'auto' },
    justifyContent: { lg: 'flex-end' },
  },
  gradeLane: { minWidth: 118 },
  gradeCircle: (colors) => ({
    width: 22,
    height: 22,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    bgcolor: colors.bg,
    color: colors.color,
    fontSize: 10,
    fontWeight: 700,
    lineHeight: 1,
  }),
  gradeScoreLabel: { fontWeight: 700 },
  progressLine: { minWidth: 40, fontWeight: 600 },
  detailsBtn: { minWidth: 84 },
};

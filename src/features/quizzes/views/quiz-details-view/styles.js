export const styles = {
  cardBorderVars: {
    border: (theme) => `1px solid ${theme.vars.palette.divider}`,
    boxShadow: 'none',
  },
  questionList: {
    borderRadius: 2,
    bgcolor: 'background.neutral',
    px: 2.5,
  },
  listItem: {
    px: 0,
    py: 2,
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  questionHeadingRow: { mb: 0.75 },
  choiceCaption: { color: 'text.secondary' },
  attemptMetaWrap: { px: 0.5 },
  attemptMetaCaption: { color: 'text.secondary' },
};

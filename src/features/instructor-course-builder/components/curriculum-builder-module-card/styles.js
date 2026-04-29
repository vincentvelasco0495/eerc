import { alpha } from '@mui/material/styles';

export const styles = {
  card: (theme) => ({
    p: 0,
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: `0 4px 24px ${alpha(theme.palette.grey[500], 0.08)}`,
    bgcolor: 'background.paper',
    overflow: 'hidden',
  }),
  header: {
    px: 1.75,
    py: 1.25,
    cursor: 'pointer',
    userSelect: 'none',
  },
  title: { fontWeight: 700, flex: 1, minWidth: 0 },
  expandButton: {
    width: 32,
    height: 32,
    bgcolor: 'grey.200',
    color: 'text.secondary',
    '&:hover': { bgcolor: 'grey.300' },
  },
  lessons: { px: 1, pb: 1.5, pt: 0.5 },
};

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
  header: (theme) => ({
    px: 1.75,
    py: 1.25,
    cursor: 'pointer',
    userSelect: 'none',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1.25,
    '&:hover': {
      bgcolor: alpha(theme.palette.common.black, theme.palette.mode === 'light' ? 0.035 : 0.08),
    },
    '& .module-header-actions': {
      opacity: 0,
      visibility: 'hidden',
      transition: 'opacity 0.2s ease, visibility 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexShrink: 0,
    },
    '&:hover .module-header-actions, &:focus-within .module-header-actions': {
      opacity: 1,
      visibility: 'visible',
    },
  }),
  headerLeft: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1.25,
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    flexShrink: 0,
  },
  title: { fontWeight: 700, flex: 1, minWidth: 0 },
  expandButton: {
    width: 32,
    height: 32,
    bgcolor: 'grey.200',
    color: 'text.secondary',
    '&:hover': { bgcolor: 'grey.300' },
  },
  deleteButton: (theme) => ({
    flexShrink: 0,
    opacity: 1,
    color: 'text.secondary',
    '&:hover': {
      color: 'error.main',
      bgcolor: alpha(theme.palette.error.main, 0.08),
    },
  }),
  editTitleButton: (theme) => ({
    flexShrink: 0,
    opacity: 1,
    color: 'text.secondary',
    '&:hover': {
      color: 'primary.main',
      bgcolor: alpha(theme.palette.primary.main, 0.08),
    },
  }),
  lessons: { px: 1, pb: 1.5, pt: 0.5 },
};

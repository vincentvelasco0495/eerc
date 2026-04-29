import { alpha } from '@mui/material/styles';

const DRAFT_BORDER = '#F5A623';
const DRAFT_BG = '#FFF9F2';

export const styles = {
  row: (theme, { selected, draft }) => {
    if (draft) {
      return {
        py: 1,
        px: 1,
        borderRadius: 1,
        cursor: 'pointer',
        border: '1px solid',
        borderColor: DRAFT_BORDER,
        bgcolor: selected ? alpha(DRAFT_BORDER, 0.12) : DRAFT_BG,
        boxShadow: selected ? `0 0 0 1px ${DRAFT_BORDER}` : 'none',
        transition: theme.transitions.create(['background-color', 'border-color', 'box-shadow'], {
          duration: theme.transitions.duration.shorter,
        }),
        '&:hover': {
          bgcolor: alpha(DRAFT_BORDER, 0.14),
        },
        '&:hover .curriculum-row-actions': { opacity: 1 },
      };
    }
    return {
      py: 1,
      px: 1,
      borderRadius: 1,
      cursor: 'pointer',
      border: '1px solid',
      borderColor: selected ? 'primary.main' : 'transparent',
      bgcolor: selected ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
      transition: theme.transitions.create(['background-color', 'border-color'], {
        duration: theme.transitions.duration.shorter,
      }),
      '&:hover': {
        bgcolor: selected
          ? alpha(theme.palette.primary.main, 0.1)
          : alpha(theme.palette.grey[500], 0.08),
      },
      '&:hover .curriculum-row-actions': { opacity: 1 },
    };
  },
  draftChip: {
    flexShrink: 0,
    height: 22,
    fontSize: '0.65rem',
    fontWeight: 700,
    color: 'common.white',
    bgcolor: DRAFT_BORDER,
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
    '& .MuiChip-label': { px: 1 },
  },
  title: {
    fontWeight: 500,
    color: 'text.primary',
    minWidth: 0,
    flex: 1,
  },
  actions: (theme) => ({
    opacity: 0,
    flexShrink: 0,
    transition: theme.transitions.create('opacity', {
      duration: theme.transitions.duration.shorter,
    }),
  }),
  iconButton: { color: 'text.secondary' },
};

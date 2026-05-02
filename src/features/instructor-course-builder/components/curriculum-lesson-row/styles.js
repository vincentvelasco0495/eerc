import { alpha } from '@mui/material/styles';

const DRAFT_BORDER = '#F5A623';
const DRAFT_BG = '#FFF9F2';

/** Reveal action icons when row is hovered or contains focus (keyboard / screen readers). */
const lessonActionsRevealSelectors = {
  '& .lesson-actions': {
    opacity: 0,
    visibility: 'hidden',
    transition: 'opacity 0.2s ease, visibility 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  '&:hover .lesson-actions, &:focus-within .lesson-actions': {
    opacity: 1,
    visibility: 'visible',
  },
};

export const styles = {
  lessonItem: (theme, { selected, draft }) => {
    if (draft) {
      return {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.25,
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
        ...lessonActionsRevealSelectors,
      };
    }
    return {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1.25,
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
          : alpha(
              theme.palette.common.black,
              theme.palette.mode === 'light' ? 0.035 : 0.1
            ),
      },
      ...lessonActionsRevealSelectors,
    };
  },
  leftCluster: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1.25,
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
  iconButton: { color: 'text.secondary' },
};

import { alpha } from '@mui/material/styles';

export const styles = {
  root: (theme) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    bgcolor: 'background.paper',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 2,
    px: { xs: 2, sm: 2.5 },
    pt: 2.5,
    pb: 2,
    overflow: 'auto',
    boxShadow: theme.palette.mode === 'light' ? theme.shadows[1] : 'none',
  }),
  tabsBar: {
    mt: 2,
    mb: 2,
    width: 1,
  },
  /** Reference: light gray rounded shell; active tab = white “pill”; inactive = same gray as shell. */
  tabs: (theme) => {
    const trackBg =
      theme.palette.mode === 'light'
        ? theme.palette.grey[100]
        : alpha(theme.palette.grey[500], 0.2);

    return {
      minHeight: 48,
      bgcolor: trackBg,
      borderRadius: '8px',
      p: '4px',
      boxSizing: 'border-box',
      '& .MuiTabs-flexContainer': {
        gap: '4px',
      },
      '& .MuiTabs-indicator': { display: 'none' },
      '& .MuiTab-root': {
        flex: 1,
        maxWidth: 'none',
        minHeight: 40,
        py: 1,
        px: 2,
        borderRadius: '6px',
        textTransform: 'none',
        fontWeight: 600,
        fontSize: 14,
        letterSpacing: 0,
        color: theme.palette.text.primary,
        bgcolor: 'transparent',
        opacity: 0.72,
        transition: theme.transitions.create(['background-color', 'box-shadow', 'opacity', 'color'], {
          duration: theme.transitions.duration.shorter,
        }),
        '&:hover': {
          opacity: 0.9,
          bgcolor: 'transparent',
        },
      },
      '& .MuiTab-root.Mui-selected': {
        color: theme.palette.text.primary,
        opacity: 1,
        bgcolor: theme.palette.background.paper,
        boxShadow:
          theme.palette.mode === 'light'
            ? '0 1px 2px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.08)'
            : theme.shadows[2],
        '&:hover': {
          bgcolor: theme.palette.background.paper,
          opacity: 1,
        },
      },
    };
  },
  lessonPanel: {
    gap: 3,
    pb: 2,
  },
  qaPanel: {
    py: 4,
    px: 1,
  },
  qaText: {
    color: 'text.secondary',
    fontSize: 14,
    lineHeight: 1.6,
  },
  footer: {
    pt: 2,
    mt: 'auto',
    borderTop: '1px solid',
    borderColor: 'divider',
    flexShrink: 0,
  },
  footerButton: {
    px: 2.5,
    py: 1,
    fontWeight: 600,
    textTransform: 'none',
    borderRadius: 1.5,
  },
};

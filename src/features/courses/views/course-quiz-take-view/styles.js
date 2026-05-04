import { alpha } from '@mui/material/styles';

export const rootSx = {
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  py: { xs: 2, sm: 3 },
  px: { xs: 2, sm: 3 },
};

export const columnSx = {
  width: '100%',
  maxWidth: 720,
};

export function headerRowSx(theme) {
  return {
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    alignItems: { xs: 'stretch', sm: 'flex-end' },
    justifyContent: 'space-between',
    gap: 2,
    mb: 3,
  };
}

export function timerBoxSx(theme) {
  const isDark = theme.palette.mode === 'dark';
  return {
    alignSelf: { xs: 'flex-end', sm: 'center' },
    flexShrink: 0,
    px: 2,
    py: 1,
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: isDark ? alpha(theme.palette.common.white, 0.06) : alpha(theme.palette.primary.main, 0.08),
    minWidth: 88,
    textAlign: 'center',
  };
}

export function resultBannerSx(theme, tone) {
  const isDark = theme.palette.mode === 'dark';
  if (tone === 'success') {
    return {
      borderRadius: 2,
      p: 2.5,
      mb: 3,
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: { sm: 'center' },
      justifyContent: 'space-between',
      gap: 2,
      bgcolor: isDark ? alpha('#22c55e', 0.16) : alpha('#16a34a', 0.12),
      border: '1px solid',
      borderColor: isDark ? alpha('#22c55e', 0.35) : alpha('#16a34a', 0.35),
    };
  }
  if (tone === 'error') {
    return {
      borderRadius: 2,
      p: 2.5,
      mb: 3,
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: { sm: 'center' },
      justifyContent: 'space-between',
      gap: 2,
      bgcolor: isDark ? alpha(theme.palette.error.main, 0.16) : alpha(theme.palette.error.main, 0.08),
      border: '1px solid',
      borderColor: isDark ? alpha(theme.palette.error.main, 0.4) : alpha(theme.palette.error.main, 0.35),
    };
  }
  return {};
}

export function optionRowSx(theme, { phase, isSelected, isCorrect, revealCorrect }) {
  const isDark = theme.palette.mode === 'dark';
  if (phase !== 'complete') {
    return {
      justifyContent: 'flex-start',
      textAlign: 'left',
      py: 1.25,
      px: 2,
      borderRadius: 1.5,
      borderColor: isSelected ? 'primary.main' : 'divider',
      bgcolor: isSelected ? alpha(theme.palette.primary.main, isDark ? 0.12 : 0.08) : 'background.paper',
    };
  }
  if (isCorrect && (!revealCorrect ? isSelected : true)) {
    return {
      justifyContent: 'flex-start',
      textAlign: 'left',
      py: 1.25,
      px: 2,
      borderRadius: 1.5,
      borderColor: alpha(theme.palette.info.main, 0.55),
      bgcolor: isDark ? alpha(theme.palette.info.main, 0.12) : alpha(theme.palette.info.main, 0.08),
    };
  }
  if (isSelected && !isCorrect) {
    return {
      justifyContent: 'flex-start',
      textAlign: 'left',
      py: 1.25,
      px: 2,
      borderRadius: 1.5,
      borderColor: alpha(theme.palette.error.main, 0.55),
      bgcolor: isDark ? alpha(theme.palette.error.main, 0.14) : alpha(theme.palette.error.main, 0.08),
    };
  }
  return {
    justifyContent: 'flex-start',
    textAlign: 'left',
    py: 1.25,
    px: 2,
    borderRadius: 1.5,
    borderColor: 'divider',
    opacity: 0.72,
  };
}

export const bottomBarSx = (theme) => ({
  position: 'sticky',
  bottom: 0,
  left: 0,
  right: 0,
  mt: 'auto',
  py: 2,
  px: { xs: 2, sm: 0 },
  mx: { xs: -2, sm: 0 },
  borderTop: '1px solid',
  borderColor: 'divider',
  bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.default, 0.92) : theme.palette.background.paper,
  backdropFilter: 'blur(8px)',
});

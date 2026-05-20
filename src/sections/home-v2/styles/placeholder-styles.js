import { varAlpha } from 'minimal-shared/utils';

export const placeholderStyles = {
  root: (aspectRatio) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    width: 1,
    aspectRatio,
    borderRadius: 3,
    border: (theme) => `2px dashed ${varAlpha(theme.vars.palette.grey['500Channel'], 0.36)}`,
    bgcolor: (theme) =>
      theme.palette.mode === 'dark'
        ? varAlpha(theme.vars.palette.grey['500Channel'], 0.12)
        : varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
    overflow: 'hidden',
    transition: (theme) =>
      theme.transitions.create(['box-shadow', 'transform', 'border-color'], {
        duration: theme.transitions.duration.shorter,
      }),
    '&:hover': {
      borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.48),
      boxShadow: (theme) => `0 16px 40px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.12)}`,
    },
  }),
  icon: {
    color: 'text.disabled',
  },
  label: {
    px: 2,
    textAlign: 'center',
    color: 'text.secondary',
    fontWeight: 600,
  },
};

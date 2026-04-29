import { alpha } from '@mui/material/styles';

export const styles = {
  root: {
    gap: 2.5,
    py: 0.5,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: 'text.primary',
    mb: 0.75,
  },
  dropzone: (theme) => ({
    border: '2px dashed',
    borderColor: alpha(theme.palette.grey[500], 0.45),
    borderRadius: 2,
    bgcolor: alpha(theme.palette.grey[500], 0.04),
    py: 4,
    px: 2,
    textAlign: 'center',
    cursor: 'pointer',
    transition: theme.transitions.create(['border-color', 'background-color'], {
      duration: theme.transitions.duration.shorter,
    }),
    '&:hover': {
      borderColor: alpha(theme.palette.grey[600], 0.55),
      bgcolor: alpha(theme.palette.grey[500], 0.07),
    },
  }),
  dropzoneActive: (theme) => ({
    borderColor: theme.palette.primary.main,
    bgcolor: alpha(theme.palette.primary.main, 0.06),
  }),
  hint: {
    mt: 1.5,
    mb: 2,
    color: 'text.secondary',
    fontSize: 14,
    maxWidth: 400,
    mx: 'auto',
    lineHeight: 1.5,
  },
  actionButton: {
    px: 3,
    py: 1,
    fontWeight: 600,
    textTransform: 'none',
    borderRadius: 1.5,
  },
  row: {
    flexDirection: { xs: 'column', sm: 'row' },
    gap: 2,
    alignItems: { xs: 'stretch', sm: 'flex-start' },
  },
};

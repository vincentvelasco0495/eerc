import { alpha } from '@mui/material/styles';

export const styles = {
  root: (theme) => ({
    width: { xs: 1, md: 380 },
    flexShrink: 0,
    bgcolor: alpha(theme.palette.grey[500], 0.06),
    borderBottom: { xs: '1px solid', md: 'none' },
    borderColor: 'divider',
    overflow: 'auto',
    py: 2.5,
    px: 2,
  }),
  heading: { mb: 2, px: 0.5 },
  headingTitle: { fontWeight: 700 },
};

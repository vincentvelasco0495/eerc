export const styles = {
  root: {
    bgcolor: 'background.default',
  },
  container: {
    py: { xs: 6, md: 10 },
  },
  section: {
    '& + &': {
      mt: { xs: 6, md: 8 },
    },
  },
  sectionTitle: {
    fontSize: { xs: '1.75rem', md: '2.25rem' },
    fontWeight: 700,
    color: 'text.secondary',
    letterSpacing: '-0.02em',
    mb: { xs: 2.5, md: 3 },
  },
  overviewGrid: {
    alignItems: 'start',
  },
  bodyCopy: {
    color: 'text.secondary',
    lineHeight: 1.95,
    fontSize: { xs: '0.95rem', md: '1rem' },
  },
  bodyStack: {
    display: 'grid',
    gap: { xs: 2, md: 2.5 },
  },
  photoCard: {
    p: 0.75,
    borderRadius: 3,
    bgcolor: 'background.paper',
    boxShadow: (theme) => theme.shadows[8],
    border: '1px solid',
    borderColor: 'divider',
    mx: { xs: 'auto', md: 0 },
    maxWidth: { xs: 360, md: 'none' },
  },
  photoFrame: {
    borderRadius: 2.5,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: { xs: 280, md: 340 },
    bgcolor: 'background.neutral',
  },
  logoImage: {
    width: 1,
    height: 1,
    maxWidth: '100%',
    maxHeight: { xs: 320, md: 380 },
    objectFit: 'contain',
    p: { xs: 2, md: 3 },
  },
};

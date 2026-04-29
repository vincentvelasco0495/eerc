import { alpha } from '@mui/material/styles';

export const styles = {
  root: {
    bgcolor: 'background.default',
  },
  container: {
    py: { xs: 6, md: 10 },
  },
  introGrid: {
    alignItems: 'start',
  },
  introTitle: {
    fontSize: { xs: '2rem', md: '3rem' },
    lineHeight: 1.08,
    letterSpacing: '-0.03em',
  },
  introCopy: {
    color: 'text.secondary',
    lineHeight: 1.95,
    maxWidth: 540,
  },
  subheading: {
    mt: 1,
    fontWeight: 600,
  },
  list: {
    m: 0,
    p: 0,
    listStyle: 'none',
    display: 'grid',
    gap: 1.25,
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
    color: 'text.secondary',
    lineHeight: 1.7,
  },
  listIcon: {
    color: 'warning.main',
    flexShrink: 0,
    mt: 0.2,
  },
  photoCard: {
    p: 0.75,
    borderRadius: 3,
    bgcolor: 'common.white',
    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.1)',
    border: '1px solid',
    borderColor: 'divider',
  },
  photoFrame: {
    borderRadius: 2.5,
    overflow: 'hidden',
    height: { xs: 260, md: 360 },
    background:
      'linear-gradient(135deg, rgba(52, 119, 255, 0.2) 0%, rgba(239, 47, 122, 0.18) 100%)',
  },
  featureGrid: {
    mt: { xs: 5, md: 7 },
    alignItems: 'stretch',
  },
  illustrationCard: {
    position: 'relative',
    minHeight: { xs: 260, md: 320 },
    borderRadius: 3,
    overflow: 'hidden',
    bgcolor: '#3f4696',
    boxShadow: '0 24px 50px rgba(63, 70, 150, 0.28)',
  },
  illustrationGlow: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(8px)',
  },
  illustrationMonitor: {
    position: 'absolute',
    left: '50%',
    top: '52%',
    transform: 'translate(-50%, -50%)',
    width: { xs: 200, md: 250 },
    height: { xs: 130, md: 160 },
    borderRadius: 2.5,
    bgcolor: 'common.white',
    boxShadow: '0 18px 34px rgba(13, 20, 54, 0.22)',
    p: 1.8,
  },
  illustrationStand: {
    position: 'absolute',
    left: '50%',
    bottom: 32,
    transform: 'translateX(-50%)',
    width: 110,
    height: 18,
    borderRadius: 999,
    bgcolor: alpha('#ffffff', 0.42),
  },
  tabCard: {
    height: 1,
    borderRadius: 0,
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'none',
  },
  tabListWrap: {
    px: { xs: 2, md: 3 },
    borderBottom: '1px solid',
    borderColor: 'divider',
  },
  tabList: {
    minHeight: 56,
    '& .MuiTab-root': {
      px: 0,
      mr: 3,
      minHeight: 56,
      fontWeight: 700,
      color: 'text.secondary',
      textTransform: 'none',
    },
  },
  tabPanel: {
    p: { xs: 2.5, md: 3 },
  },
  tabPanelTitle: {
    fontSize: { xs: '1.5rem', md: '2.1rem' },
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  tabPanelCopy: {
    color: 'text.secondary',
    lineHeight: 1.9,
  },
  bulletList: {
    m: 0,
    pl: 2.5,
    color: 'text.secondary',
    display: 'grid',
    gap: 1,
  },
  divider: {
    my: { xs: 6, md: 8 },
    borderColor: 'divider',
  },
  sectionTitle: {
    fontSize: { xs: '2rem', md: '2.6rem' },
    lineHeight: 1.15,
    letterSpacing: '-0.03em',
  },
  certGrid: {
    mt: 4,
  },
  certItem: {
    textAlign: 'center',
  },
  certCard: {
    p: 2,
    borderRadius: 2.5,
    bgcolor: '#40291f',
    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.12)',
  },
  certPaper: {
    aspectRatio: '1 / 0.78',
    borderRadius: 1,
    bgcolor: '#fbf6ec',
    border: '8px solid #f0dfc2',
    boxShadow: 'inset 0 0 0 2px #60362f',
    display: 'grid',
    placeItems: 'center',
    px: 2.5,
  },
  certSeal: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    bgcolor: '#c43833',
    border: '4px solid #efc4b4',
    boxShadow: '0 8px 18px rgba(0,0,0,0.18)',
  },
  certLabel: {
    mt: 2.25,
    color: 'text.secondary',
  },
};

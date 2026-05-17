import { varAlpha } from 'minimal-shared/utils';

export const COURSE_COLOR_MAP = {
  'course-ce-review': ['#0f4c81', '#49a5ff', '#f0b14f'],
  'course-plumbing-mastery': ['#1f6b5c', '#34c38f', '#f6b23c'],
  'course-materials-intensive': ['#4f46a5', '#8b5cf6', '#f97316'],
  'course-how-to-design-components': ['#2563eb', '#38bdf8', '#fcd34d'],
};

export function getPalette(theme) {
  return theme.vars?.palette || theme.palette;
}

export function courseArtSx(courseId, compact = false) {
  const [base, accent, glow] = COURSE_COLOR_MAP[courseId] ?? COURSE_COLOR_MAP['course-ce-review'];

  return {
    position: 'relative',
    overflow: 'hidden',
    width: 1,
    minHeight: compact ? 84 : 340,
    borderRadius: compact ? 2 : 3,
    bgcolor: base,
    backgroundImage: `linear-gradient(135deg, ${base} 0%, ${accent} 55%, ${glow} 100%)`,
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: compact ? 'auto -8% -35% auto' : 'auto -5% -22% auto',
      width: compact ? 84 : 240,
      height: compact ? 84 : 240,
      borderRadius: '50%',
      bgcolor: 'rgba(255,255,255,0.18)',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      left: compact ? '-10%' : '-4%',
      bottom: compact ? '-30%' : '-18%',
      width: compact ? 110 : 320,
      height: compact ? 76 : 220,
      borderRadius: '50% 50% 0 0',
      bgcolor: 'rgba(255,255,255,0.14)',
      transform: 'rotate(-8deg)',
    },
  };
}

export function heroPanelSx(theme) {
  return {
    maxWidth: 320,
    p: 2,
    borderRadius: 2,
    color: 'common.white',
    backdropFilter: 'blur(10px)',
    bgcolor: varAlpha(getPalette(theme).common.blackChannel, 0.18),
  };
}

export function noticeIconBoxSx(theme) {
  return {
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    color: 'primary.main',
    bgcolor: varAlpha(getPalette(theme).primary.mainChannel, 0.08),
  };
}

export const styles = {
  sidebarRowIcon: { color: 'text.secondary' },
  sidebarLabelMuted: { color: 'text.secondary' },
  sidebarValueEmphasis: { fontWeight: 700 },
  popularCourseLink: {
    gap: 1.5,
    width: 1,
    color: 'inherit',
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    py: 1.5,
  },
  popularCourseThumb: { width: 72, flexShrink: 0 },
  popularCourseStack: { minWidth: 0 },
  popularCourseTitle: { lineHeight: 1.35 },
  popularCourseCategory: { color: 'primary.main', fontWeight: 700 },
  popularCourseMentor: { color: 'text.secondary' },
  toolbarTextButton: { color: 'text.secondary' },
  pageTitle: {
    fontSize: { xs: '2rem', md: '3rem' },
    lineHeight: 1.08,
    color: 'primary.darker',
    letterSpacing: '-0.02em',
  },
  heroDescription: { maxWidth: 860, color: 'text.secondary', lineHeight: 1.85 },
  heroMetaRow: {
    display: 'grid',
    width: 1,
    alignItems: 'center',
    columnGap: { xs: 0, md: 3 },
    rowGap: { xs: 2.25, md: 0 },
    gridTemplateColumns: { xs: '1fr', md: 'minmax(0,1fr) auto minmax(0,1fr)' },
    py: { xs: 0.75, md: 1 },
  },
  heroMetaCategoryGroup: {
    justifySelf: { xs: 'stretch', md: 'start' },
  },
  heroMetaCenterGroup: {
    justifySelf: { xs: 'stretch', md: 'center' },
  },
  heroMetaReviewsGroup: {
    justifySelf: { xs: 'stretch', md: 'end' },
    textAlign: { xs: 'left', md: 'right' },
  },
  heroCategoryLabelBold: {
    fontWeight: 700,
    color: 'text.primary',
  },
  heroCategoryValueMuted: {
    fontWeight: 400,
    color: 'text.secondary',
    letterSpacing: 0,
  },
  heroInstructorOverline: {
    color: 'text.secondary',
    fontWeight: 600,
    fontSize: (theme) => theme.typography.pxToRem(11),
    lineHeight: 1.35,
    letterSpacing: '0.12em',
  },
  heroInstructorName: {
    fontWeight: 700,
    fontSize: { xs: '1.0625rem', md: '1.125rem' },
    lineHeight: 1.35,
    color: 'primary.darker',
  },
  heroBadgeChip: {
    fontWeight: 800,
    letterSpacing: 0.6,
    height: 28,
    '& .MuiChip-label': { px: 1.25 },
  },
  heroMetaRatingsCaption: {
    mt: 0.35,
    color: 'text.secondary',
    fontWeight: 500,
    fontSize: (theme) => theme.typography.pxToRem(12),
  },
  heroMetaAvgLabel: {
    fontWeight: 700,
    color: 'text.primary',
    fontSize: { xs: '1.125rem', md: '1.25rem' },
    lineHeight: 1,
  },
  heroMetaTitleDivider: { borderColor: 'divider' },
  mentorAvatar: { width: 48, height: 48, bgcolor: 'grey.900', color: 'common.white', fontSize: '0.95rem' },
  tabbedCard: {
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'none',
  },
  tabHeaderBox: {
    px: { xs: 2, md: 3 },
    pt: 1.5,
    borderBottom: '1px solid',
    borderColor: 'divider',
  },
  tabList: {
    minHeight: 52,
    '& .MuiTab-root': {
      px: 0,
      minHeight: 52,
      mr: 3,
      fontWeight: 700,
      color: 'text.secondary',
    },
  },
  tabPanel: { p: { xs: 2, md: 3 } },
  heroArtBox: { display: 'flex', alignItems: 'flex-end' },
  heroArtPadding: { p: { xs: 2.5, md: 4 } },
  heroPanelOverline: { opacity: 0.9 },
  heroPanelTitle: { mt: 1 },
  bodyParagraph: { color: 'text.secondary', lineHeight: 1.9 },
  learnList: { m: 0, pl: 2.5, color: 'text.secondary' },
  learnListItem: { lineHeight: 1.8 },
  moduleCard: {
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'none',
  },
  moduleCardContent: { p: { xs: 2, md: 2.5 } },
  lectureOverline: { color: 'primary.main' },
  moduleSummary: { color: 'text.secondary', lineHeight: 1.8 },
  faqAccordion: {
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 2,
    overflow: 'hidden',
    '&::before': { display: 'none' },
  },
  faqAnswer: { color: 'text.secondary', lineHeight: 1.85 },
  noticeBody: { color: 'text.secondary', lineHeight: 1.8 },
  ratingSummaryFooter: { color: 'text.secondary' },
  reviewCard: {
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'none',
  },
  ratingCardContent: { p: { xs: 2.5, md: 3 } },
  reviewCardContent: { p: { xs: 2.5, md: 3 } },
  reviewRole: { color: 'text.secondary' },
  reviewQuote: { color: 'text.secondary', lineHeight: 1.8 },
  sidebarCard: {
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'none',
  },
  sidebarCardPadding: { p: { xs: 2.5, md: 3 } },
  startCourseCta: { borderRadius: 1.5, py: 1.6 },
  aboutProgramBody: { color: 'text.secondary', lineHeight: 1.85 },
  completionSidebarCard: {
    bgcolor: 'primary.lighter',
    border: '1px solid',
    borderColor: 'primary.light',
    boxShadow: 'none',
  },
  relatedCourseCard: {
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'none',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
};

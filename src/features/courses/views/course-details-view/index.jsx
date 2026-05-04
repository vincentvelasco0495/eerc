import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import TabList from '@mui/lab/TabList';
import Stack from '@mui/material/Stack';
import TabPanel from '@mui/lab/TabPanel';
import Avatar from '@mui/material/Avatar';
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TabContext from '@mui/lab/TabContext';
import MenuItem from '@mui/material/MenuItem';
import Accordion from '@mui/material/Accordion';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import {
  useLmsCourse,
  useLmsCourses,
  useLmsQuizzes,
  useLmsPrograms,
  useLmsModulesByCourse,
  useResolvedCourseIdFromLookup,
} from 'src/hooks/use-lms';

import { DashboardContent } from 'src/layouts/dashboard';
import { getCourseCopy } from 'src/features/courses/data/course-page-copy';
import { mergeTabsContentFromCourseApi } from 'src/features/courses/utils/merge-course-tabs-from-api';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { lmsPageShellStyles } from 'src/components/layout/lms-page-shell.styles';

import { styles, courseArtSx, heroPanelSx, noticeIconBoxSx } from './styles';

const ARCHIVE_OPTIONS = ['Current intake', 'May 2026', 'April 2026', 'March 2026'];

const TAB_OPTIONS = [
  { value: 'description', label: 'Description' },
  { value: 'curriculum', label: 'Curriculum' },
  { value: 'faq', label: 'FAQ' },
  { value: 'notice', label: 'Notice' },
  { value: 'reviews', label: 'Reviews' },
];

function SidebarDetailRow({ icon, label, value }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
      <Stack direction="row" alignItems="center" spacing={1.25}>
        <Iconify icon={icon} width={18} sx={styles.sidebarRowIcon} />
        <Typography variant="body2" sx={styles.sidebarLabelMuted}>
          {label}
        </Typography>
      </Stack>
      <Typography variant="body2" sx={styles.sidebarValueEmphasis}>
        {value}
      </Typography>
    </Stack>
  );
}

/** Subject on the left, primary tag on the right when both exist — matches catalog cards. */
function resolveThumbChipLabels(course, copy) {
  const subj = typeof course?.subjects?.[0] === 'string' ? course.subjects[0].trim() : '';
  const tag0 = typeof course?.tags?.[0] === 'string' ? course.tags[0].trim() : '';
  const badge = typeof copy?.badge === 'string' ? copy.badge.trim() : '';

  if (subj && tag0 && tag0 !== subj) {
    return { left: subj, right: tag0 };
  }
  if (subj) {
    return { left: subj, right: '' };
  }
  if (tag0) {
    return { left: tag0, right: '' };
  }
  return { left: badge, right: '' };
}

function PopularCourseItem({ course }) {
  const copy = getCourseCopy(course);
  const { left: thumbLeft, right: thumbRight } = resolveThumbChipLabels(course, copy);
  /** Sidebar thumb is narrow (~72px); show subject, else tag / badge. */
  const thumbSingle = thumbLeft || thumbRight;
  const itemRating =
    copy.reviews.length > 0
      ? copy.reviews.reduce((sum, review) => sum + review.rating, 0) / copy.reviews.length
      : 4.8;

  return (
    <Box
      component={RouterLink}
      href={paths.dashboard.courseDetails(course.slug)}
      sx={styles.popularCourseLink}
    >
      <Box sx={{ position: 'relative', ...styles.popularCourseThumb, ...courseArtSx(course.id, true) }}>
        {thumbSingle ? (
          <Chip
            label={thumbSingle}
            size="small"
            sx={{ ...styles.thumbOverlayChip, ...styles.thumbOverlayChipPopular }}
          />
        ) : null}
      </Box>
      <Stack spacing={0.35} sx={styles.popularCourseStack}>
        <Typography variant="subtitle2" sx={styles.popularCourseTitle}>
          {course.title}
        </Typography>
        <Typography variant="caption" sx={styles.popularCourseCategory}>
          {copy.category}
        </Typography>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Free
          </Typography>
          <Rating readOnly precision={0.5} value={itemRating} size="small" />
        </Stack>
        <Typography variant="caption" sx={styles.popularCourseMentor}>
          By {course.mentor}
        </Typography>
      </Stack>
    </Box>
  );
}

function RelatedCourseCard({ course: related }) {
  const rcopy = getCourseCopy(related);
  const { left: thumbLeft, right: thumbRight } = resolveThumbChipLabels(related, rcopy);
  const itemRating =
    rcopy.reviews.length > 0
      ? rcopy.reviews.reduce((sum, review) => sum + review.rating, 0) / rcopy.reviews.length
      : 4.5;

  return (
    <Card
      component={RouterLink}
      href={paths.dashboard.courseDetails(related.slug)}
      sx={styles.relatedCourseCard}
    >
      <Box
        sx={{
          position: 'relative',
          minHeight: 132,
          borderRadius: 0,
          ...courseArtSx(related.id, true),
        }}
      >
        {thumbLeft ? (
          <Chip
            label={thumbLeft}
            size="small"
            sx={{ ...styles.thumbOverlayChip, ...styles.thumbOverlayChipRelated }}
          />
        ) : null}
        {thumbRight ? (
          <Chip
            label={thumbRight}
            size="small"
            sx={{ ...styles.thumbOverlayChip, ...styles.thumbOverlayChipRelatedRight }}
          />
        ) : null}
      </Box>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', pt: 2, pb: 2.5 }}>
        <Typography variant="subtitle2" sx={{ lineHeight: 1.35, mb: 0.5 }}>
          {related.title}
        </Typography>
        <Typography variant="subtitle2" color="primary" fontWeight={700}>
          Free
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.5 }}>
          <Rating readOnly precision={0.5} value={itemRating} size="small" />
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          By {related.mentor}
        </Typography>
      </CardContent>
    </Card>
  );
}

export function CourseDetailsView({ courseLookup }) {
  const [tabValue, setTabValue] = useState('description');
  const courseId = useResolvedCourseIdFromLookup(courseLookup);
  const course = useLmsCourse(courseId);
  const { courses } = useLmsCourses(1, 500);
  const { programs } = useLmsPrograms();
  const { modules } = useLmsModulesByCourse(courseId);
  const { quizzes: lmsQuizzes } = useLmsQuizzes();

  const relatedCourses = useMemo(
    () => courses.filter((item) => item.id !== courseId).slice(0, 3),
    [courseId, courses]
  );

  const quizzesForCourse = useMemo(
    () => lmsQuizzes.filter((q) => q.courseId === courseId),
    [lmsQuizzes, courseId]
  );

  if (!course) {
    return (
      <DashboardContent maxWidth={false}>
        <Typography variant="body2">This course is not available in the current LMS mock set.</Typography>
      </DashboardContent>
    );
  }

  const copy = getCourseCopy(course);
  const tabs = mergeTabsContentFromCourseApi(course, copy);
  const heroDescription =
    typeof course.description === 'string' && course.description.trim()
      ? course.description.trim()
      : (tabs.paragraphs[0] ?? copy.description ?? '');
  const program = programs.find((item) => item.id === course.programId);
  const videoLessons = modules.filter((moduleItem) => moduleItem.resources.includes('Video')).length;
  const videoDetailValue =
    course.videoHoursLabel ??
    (videoLessons > 0 ? `${videoLessons} ${videoLessons === 1 ? 'lesson' : 'lessons'} with video` : '—');
  const detailRows = [
    { label: 'Duration', value: `${course.hours} hours`, icon: 'solar:clock-circle-linear' },
    { label: 'Lectures', value: modules.length, icon: 'solar:notebook-minimalistic-linear' },
    { label: 'Video', value: videoDetailValue, icon: 'solar:play-circle-linear' },
    { label: 'Quizzes', value: quizzesForCourse.length, icon: 'solar:clipboard-check-linear' },
    { label: 'Level', value: course.level, icon: 'solar:graph-up-linear' },
  ];
  const averageRating = copy.reviews.length
    ? copy.reviews.reduce((sum, review) => sum + review.rating, 0) / copy.reviews.length
    : 4.8;

  const formattedAverageRating = (() => {
    if (!Number.isFinite(averageRating)) {
      return '—';
    }
    const roundedTenth = Number(averageRating.toFixed(1));
    const asInt = Math.round(roundedTenth);
    return Math.abs(roundedTenth - asInt) < 1e-6 ? String(asInt) : roundedTenth.toFixed(1);
  })();

  return (
    <DashboardContent maxWidth={false}>
      <Stack spacing={4.5} sx={lmsPageShellStyles.content}>
        <CustomBreadcrumbs
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Programs', href: paths.dashboard.courses.root },
            { name: copy.category },
          ]}
        />

        <Grid container spacing={{ xs: 4, lg: 5 }} alignItems="flex-start">
          <Grid size={{ xs: 12, lg: 8 }} sx={{ order: { xs: 1, lg: 2 } }}>
            <Stack spacing={3}>
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  flexWrap="wrap"
                  spacing={1.25}
                  useFlexGap
                >
                  {copy.badge ? (
                    <Chip label={copy.badge} color="warning" variant="filled" size="small" sx={styles.heroBadgeChip} />
                  ) : (
                    <Box />
                  )}

                  <Stack direction="row" spacing={0.5}>
                    <Button
                      variant="text"
                      color="inherit"
                      startIcon={<Iconify icon="solar:heart-linear" />}
                      sx={styles.toolbarTextButton}
                    >
                      Add to wishlist
                    </Button>
                    <Button
                      variant="text"
                      color="inherit"
                      startIcon={<Iconify icon="solar:share-linear" />}
                      sx={styles.toolbarTextButton}
                    >
                      Share
                    </Button>
                  </Stack>
                </Stack>

                <Box sx={styles.heroMetaRow}>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={styles.heroMetaCategoryGroup}
                  >
                    <Iconify
                      icon="solar:bookmark-square-linear"
                      width={22}
                      sx={{ color: 'primary.main', flexShrink: 0 }}
                    />
                    <Typography variant="body2" sx={{ lineHeight: 1.55 }}>
                      <Box component="span" sx={styles.heroCategoryLabelBold}>
                        Program:
                      </Box>{' '}
                      <Box component="span" sx={styles.heroCategoryValueMuted}>
                        {copy.category}
                      </Box>
                    </Typography>
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={styles.heroMetaCenterGroup}
                  >
                    <Avatar sx={styles.mentorAvatar}>
                      {course.mentor
                        .split(' ')
                        .slice(0, 2)
                        .map((item) => item[0])
                        .join('')}
                    </Avatar>
                    <Stack spacing={0.35} sx={{ minWidth: 0 }}>
                      <Typography variant="caption" sx={styles.heroInstructorOverline}>
                        INSTRUCTOR
                      </Typography>
                      <Typography variant="subtitle1" component="div" sx={styles.heroInstructorName} noWrap>
                        {course.mentor}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Stack
                    spacing={0.5}
                    sx={{
                      ...styles.heroMetaReviewsGroup,
                      width: { xs: '100%', md: 'auto' },
                      alignItems: { xs: 'flex-start', md: 'flex-end' },
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.25} flexWrap="wrap">
                      <Rating readOnly precision={0.5} value={averageRating} size="small" />
                      <Typography component="span" variant="subtitle1" sx={styles.heroMetaAvgLabel}>
                        {formattedAverageRating}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={styles.heroMetaRatingsCaption}>
                      {copy.reviews.length}{' '}
                      {copy.reviews.length === 1 ? 'review' : 'reviews'}
                    </Typography>
                  </Stack>
                </Box>

                <Divider sx={styles.heroMetaTitleDivider} />

                <Typography variant="h2" sx={styles.pageTitle}>
                  {course.title}
                </Typography>

                <Typography variant="body1" sx={styles.heroDescription}>
                  {heroDescription}
                </Typography>
              </Stack>

              <Card sx={styles.tabbedCard}>
                <TabContext value={tabValue}>
                  <Box sx={styles.tabHeaderBox}>
                    <TabList
                      onChange={(_, value) => setTabValue(value)}
                      variant="scrollable"
                      scrollButtons="auto"
                      sx={styles.tabList}
                    >
                      {TAB_OPTIONS.map((tab) => (
                        <Tab key={tab.value} value={tab.value} label={tab.label} disableRipple />
                      ))}
                    </TabList>
                  </Box>

                  <TabPanel value="description" sx={styles.tabPanel}>
                    <Stack spacing={3}>
                      <Box
                        sx={{ ...courseArtSx(course.id), ...styles.heroArtPadding, ...styles.heroArtBox }}
                      >
                        <Box sx={heroPanelSx}>
                          <Typography variant="overline" sx={styles.heroPanelOverline}>
                            {copy.category}
                          </Typography>
                          <Typography variant="h4" sx={styles.heroPanelTitle}>
                            {program?.title ?? copy.category}
                          </Typography>
                        </Box>
                      </Box>

                      <Stack spacing={2}>
                        {tabs.paragraphs.map((paragraph, pIndex) => (
                          <Typography key={`desc-p-${pIndex}`} variant="body1" sx={styles.bodyParagraph}>
                            {paragraph}
                          </Typography>
                        ))}
                      </Stack>

                      <Stack spacing={1.5}>
                        <Typography variant="h4">What you&apos;ll learn</Typography>
                        <Stack component="ul" spacing={1.1} sx={styles.learnList}>
                          {tabs.learningOutcomes.map((item, i) => (
                            <Typography key={`learn-${i}`} component="li" variant="body1" sx={styles.learnListItem}>
                              {item}
                            </Typography>
                          ))}
                        </Stack>
                      </Stack>

                      <Stack spacing={1.5}>
                        <Typography variant="h4">Who is the target audience?</Typography>
                        <Stack component="ul" spacing={1.1} sx={styles.learnList}>
                          {tabs.audience.map((item, i) => (
                            <Typography key={`aud-${i}`} component="li" variant="body1" sx={styles.learnListItem}>
                              {item}
                            </Typography>
                          ))}
                        </Stack>
                      </Stack>

                      <Stack spacing={2}>
                        <Typography variant="h5">Related courses</Typography>
                        <Grid container spacing={2}>
                          {relatedCourses.map((rc) => (
                            <Grid key={rc.id} size={{ xs: 12, sm: 6, md: 4 }}>
                              <RelatedCourseCard course={rc} />
                            </Grid>
                          ))}
                        </Grid>
                      </Stack>
                    </Stack>
                  </TabPanel>

                  <TabPanel value="curriculum" sx={styles.tabPanel}>
                    <Stack spacing={2}>
                      {modules.map((moduleItem, index) => (
                        <Card key={moduleItem.id} sx={styles.moduleCard}>
                          <CardContent sx={styles.moduleCardContent}>
                            <Stack spacing={1.25}>
                              <Stack
                                direction={{ xs: 'column', md: 'row' }}
                                justifyContent="space-between"
                                spacing={1}
                              >
                                <Stack spacing={0.5}>
                                  <Typography variant="overline" sx={styles.lectureOverline}>
                                    Lecture {index + 1}
                                  </Typography>
                                  <Typography variant="h6">{moduleItem.title}</Typography>
                                </Stack>
                                <Chip label={`${moduleItem.duration} • ${moduleItem.type}`} color="primary" variant="outlined" size="small" />
                              </Stack>
                              <Typography variant="body2" sx={styles.moduleSummary}>
                                {moduleItem.summary}
                              </Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {moduleItem.resources.map((resource) => (
                                  <Chip key={resource} label={resource} size="small" />
                                ))}
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  </TabPanel>

                  <TabPanel value="faq" sx={styles.tabPanel}>
                    <Stack spacing={1.5}>
                      {tabs.faqPairs.map((item, index) => (
                        <Accordion
                          key={`faq-${index}`}
                          defaultExpanded={index === 0}
                          disableGutters
                          elevation={0}
                          sx={styles.faqAccordion}
                        >
                          <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-linear" width={18} />}>
                            <Typography variant="subtitle1">{item.question}</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body2" sx={styles.faqAnswer}>
                              {item.answer}
                            </Typography>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Stack>
                  </TabPanel>

                  <TabPanel value="notice" sx={styles.tabPanel}>
                    <Stack spacing={1.5}>
                      {(tabs.noticeHeading ? (
                        <Typography variant="h5" sx={{ mb: -0.5 }}>
                          {tabs.noticeHeading}
                        </Typography>
                      ) : null)}
                      {tabs.noticeStrings.map((item, nIndex) => (
                        <Card key={`notice-${nIndex}`} sx={styles.moduleCard}>
                          <CardContent sx={styles.moduleCardContent}>
                            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                              <Box sx={noticeIconBoxSx}>
                                <Iconify icon="solar:info-circle-bold" width={18} />
                              </Box>
                              <Typography variant="body2" sx={styles.noticeBody}>
                                {item}
                              </Typography>
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  </TabPanel>

                  <TabPanel value="reviews" sx={styles.tabPanel}>
                    <Stack spacing={2.5}>
                      <Card sx={styles.reviewCard}>
                        <CardContent sx={styles.ratingCardContent}>
                          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
                            <Stack spacing={0.6}>
                              <Typography variant="h3">{averageRating.toFixed(1)}</Typography>
                              <Rating readOnly precision={0.5} value={averageRating} />
                              <Typography variant="body2" sx={styles.ratingSummaryFooter}>
                                Based on {copy.reviews.length}{' '}
                                {copy.reviews.length === 1 ? 'learner review' : 'learner reviews'}
                              </Typography>
                            </Stack>
                            <Chip label={`${course.learners.toLocaleString()} enrolled learners`} color="primary" variant="outlined" />
                          </Stack>
                        </CardContent>
                      </Card>

                      {copy.reviews.map((review) => (
                        <Card key={review.author} sx={styles.reviewCard}>
                          <CardContent sx={styles.reviewCardContent}>
                            <Stack spacing={1.5}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                                <Box>
                                  <Typography variant="subtitle1">{review.author}</Typography>
                                  <Typography variant="body2" sx={styles.reviewRole}>
                                    {review.role}
                                  </Typography>
                                </Box>
                                <Rating readOnly precision={0.5} value={review.rating} size="small" />
                              </Stack>
                              <Typography variant="body2" sx={styles.reviewQuote}>
                                {review.content}
                              </Typography>
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  </TabPanel>
                </TabContext>
              </Card>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }} sx={{ order: { xs: 2, lg: 1 } }}>
            <Stack spacing={3}>
              {course.previewCompleted ? (
                <Card sx={[styles.sidebarCard, styles.completionSidebarCard]}>
                  <CardContent sx={styles.sidebarCardPadding}>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Iconify icon="solar:check-circle-bold" width={28} sx={{ color: 'primary.main' }} />
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            Course complete
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Score: 100%
                          </Typography>
                        </Box>
                      </Stack>
                      <Button variant="outlined" color="primary" size="small">
                        Details
                      </Button>
                      <Button
                        component={RouterLink}
                        href={paths.dashboard.modules.details(course.nextModuleId)}
                        variant="contained"
                        size="large"
                        sx={styles.startCourseCta}
                      >
                        CONTINUE
                      </Button>
                      <Divider />
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Button
                          variant="text"
                          color="inherit"
                          size="small"
                          startIcon={<Iconify icon="solar:heart-linear" />}
                          sx={styles.toolbarTextButton}
                        >
                          Add to wishlist
                        </Button>
                        <Button
                          variant="text"
                          color="inherit"
                          size="small"
                          startIcon={<Iconify icon="solar:share-linear" />}
                          sx={styles.toolbarTextButton}
                        >
                          Share
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ) : (
                <Card sx={styles.sidebarCard}>
                  <CardContent sx={styles.sidebarCardPadding}>
                    <Button
                      component={RouterLink}
                      href={paths.dashboard.modules.details(course.nextModuleId)}
                      variant="contained"
                      size="large"
                      fullWidth
                      sx={styles.startCourseCta}
                    >
                      START COURSE
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card sx={[styles.sidebarCard, { bgcolor: 'grey.50' }]}>
                <CardContent sx={styles.sidebarCardPadding}>
                  <Stack spacing={1.6}>
                    <Typography variant="h5">Course details</Typography>
                    <Divider />
                    {detailRows.map((item) => (
                      <SidebarDetailRow key={item.label} {...item} />
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              <Card sx={styles.sidebarCard}>
                <CardContent sx={styles.sidebarCardPadding}>
                  <Stack spacing={1.2}>
                    <Typography variant="h5">Popular courses</Typography>
                    <Divider />
                    {relatedCourses.map((item) => (
                      <Box key={item.id}>
                        <PopularCourseItem course={item} />
                        <Divider />
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              <Card sx={styles.sidebarCard}>
                <CardContent sx={styles.sidebarCardPadding}>
                  <Stack spacing={1.5}>
                    <Typography variant="overline" sx={{ letterSpacing: 1.2, fontWeight: 700 }}>
                      Archive
                    </Typography>
                    <Divider />
                    <TextField select fullWidth defaultValue={ARCHIVE_OPTIONS[0]} label="Select Month">
                      {ARCHIVE_OPTIONS.map((item) => (
                        <MenuItem key={item} value={item}>
                          {item}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                </CardContent>
              </Card>

              {course.id !== 'course-how-to-design-components' && (
                <Card sx={styles.sidebarCard}>
                  <CardContent sx={styles.sidebarCardPadding}>
                    <Stack spacing={1.5}>
                      <Typography variant="h5">About this program</Typography>
                      <Divider />
                      <Typography variant="body2" sx={styles.aboutProgramBody}>
                        {program?.description ?? copy.description}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {course.tags.map((tag) => (
                          <Chip key={tag} label={tag} size="small" />
                        ))}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </DashboardContent>
  );
}

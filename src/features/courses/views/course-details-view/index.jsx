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
  useLmsPrograms,
  useLmsModulesByCourse,
} from 'src/hooks/use-lms';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { lmsPageShellStyles } from 'src/components/layout/lms-page-shell.styles';

import { styles, courseArtSx, heroPanelSx, noticeIconBoxSx } from './styles';

const COURSE_PAGE_COPY = {
  'course-ce-review': {
    category: 'Civil Engineering',
    badge: 'NEW',
    description:
      'A comprehensive Civil Engineering review course focused on hydraulics, structures, and environmental systems. It helps learners organize technical concepts, practice board-style problems, and build confidence for licensure preparation.',
    body: [
      'This structured review track is designed for engineering learners who need a cleaner way to study major subjects, revisit difficult formulas, and move through guided modules in a logical sequence. Lessons combine recorded walkthroughs, technical references, and review checkpoints in one course experience.',
      'Each module is arranged to support both theory and application. Learners can move from concept refreshers into practice drills, follow instructor guidance, and prepare for mock-board style assessments without losing context between topics.',
    ],
    learn: [
      'Strengthen hydraulics, structures, and environmental engineering fundamentals.',
      'Practice board-style computations through guided module drills.',
      'Review formulas, references, and technical problem-solving workflows in one place.',
      'Build a repeatable study path for coaching sessions and exam preparation.',
    ],
    audience: [
      'Civil Engineering graduates preparing for professional licensure exams.',
      'Review-center learners who need structured technical modules and practice sessions.',
      'Working professionals refreshing core concepts before certification or promotion.',
    ],
    faqs: [
      {
        question: 'Is this course suitable for first-time board review learners?',
        answer:
          'Yes. The course starts with concept refreshers, then gradually builds into guided drills and structured practice sessions.',
      },
      {
        question: 'Does the course include downloadable references?',
        answer:
          'Yes. Modules can include PDFs, e-books, and reference materials alongside the main lesson flow.',
      },
      {
        question: 'Can this be used by review centers for group cohorts?',
        answer:
          'Yes. The layout supports individual study as well as organized cohort delivery with instructor oversight.',
      },
    ],
    notices: [
      'Streaming is enabled for core lecture content to keep review materials secure.',
      'Progress is tracked per module so instructors can quickly identify weak areas.',
      'Mock-board coaching sessions can be layered on top of this core review sequence.',
    ],
    reviews: [
      {
        author: 'Mark Dela Cruz',
        role: 'Civil Engineering examinee',
        rating: 5,
        content:
          'The hydraulics and structures modules are very clear. It feels like a focused review center workflow instead of scattered files and chats.',
      },
      {
        author: 'Angela Ramos',
        role: 'Review program coordinator',
        rating: 4.5,
        content:
          'The guided module flow and technical references make it much easier to support our learners and track what they need next.',
      },
    ],
  },
  'course-plumbing-mastery': {
    category: 'Master Plumbing',
    badge: 'HOT',
    description:
      'An exam-focused Master Plumbing course that covers code interpretation, pipe sizing, sanitary systems, and practical troubleshooting for faster review progress.',
    body: [
      'This course is built for plumbing licensure preparation with a practical balance of technical explanation, code review, and solution walkthroughs. Lessons are organized to help learners move from system concepts into field-relevant applications.',
      'Review-center teams can use it to deliver structured plumbing modules, timed practice, and final coaching sessions while keeping learner progress and curriculum visibility in one place.',
    ],
    learn: [
      'Interpret plumbing code requirements with more confidence.',
      'Practice pipe sizing, sanitary system design, and fixture-unit calculations.',
      'Review troubleshooting scenarios with guided explanations and technical references.',
      'Prepare for mock-board assessments with structured progress checkpoints.',
    ],
    audience: [
      'Master Plumbing examinees preparing for board review programs.',
      'Learners who want more guided practice on code-based scenarios.',
      'Review-center instructors building a reusable plumbing course workflow.',
    ],
    faqs: [
      {
        question: 'Does this course focus on code-heavy topics?',
        answer:
          'Yes. Code interpretation and applied problem-solving are central parts of the program content.',
      },
      {
        question: 'Are practice scenarios included?',
        answer:
          'Yes. The course includes guided drills, module-based reviews, and final coaching content.',
      },
      {
        question: 'Can instructors use this for live sessions too?',
        answer:
          'Yes. The structure works well for both recorded delivery and live review-center sessions.',
      },
    ],
    notices: [
      'Code review modules are arranged to support both self-paced and guided coaching.',
      'Technical references can be attached per lesson to improve exam readiness.',
      'Learner progress highlights which areas need remediation before mock exams.',
    ],
    reviews: [
      {
        author: 'Jose Mendoza',
        role: 'Master Plumbing examinee',
        rating: 5,
        content:
          'The pipe sizing practice and code discussions are easy to follow. It feels like a modern review center platform.',
      },
      {
        author: 'Rhea Santos',
        role: 'Program mentor',
        rating: 4.5,
        content:
          'The course structure makes it easier to coach learners and point them to the exact lesson or drill they need.',
      },
    ],
  },
  'course-materials-intensive': {
    category: 'Materials Engineering',
    badge: 'ADVANCED',
    description:
      'A deep Materials Engineering review experience covering metallurgy, thermodynamics, failures, and materials behavior with guided modules and exam-ready practice.',
    body: [
      'This program is designed for learners who need a more organized way to study materials characterization, thermal processes, and failure analysis. The course combines conceptual refreshers with review checkpoints so technical topics stay manageable.',
      'It is especially useful for programs that want structured digital delivery of advanced lessons, references, and coaching notes across a longer review timeline.',
    ],
    learn: [
      'Review metallurgical behavior, heat treatment, and material response concepts.',
      'Connect thermodynamics principles with manufacturing and performance scenarios.',
      'Practice failure analysis reasoning in a guided learning sequence.',
      'Use structured references and review modules for long-form technical preparation.',
    ],
    audience: [
      'Materials Engineering learners preparing for intensive exam review.',
      'Advanced students who want clearer module progression across difficult topics.',
      'Institutions delivering long-form technical coaching and digital content.',
    ],
    faqs: [
      {
        question: 'Is this course best for advanced learners?',
        answer:
          'It is designed for intermediate to advanced learners, but the guided sequence still helps structure core refreshers.',
      },
      {
        question: 'What topics are emphasized most?',
        answer:
          'Metallurgy, thermodynamics, material behavior, heat treatment, and failure analysis are all emphasized.',
      },
      {
        question: 'Can learners revisit references after the lesson?',
        answer:
          'Yes. Modules can include PDFs, e-books, and structured summaries for later study.',
      },
    ],
    notices: [
      'Advanced modules are arranged to keep high-density technical topics easier to revisit.',
      'Reference materials can be paired with each module to support independent review.',
      'The course flow is ideal for longer intensive programs and exam-season schedules.',
    ],
    reviews: [
      {
        author: 'Paula Reyes',
        role: 'Materials Engineering learner',
        rating: 5,
        content:
          'The modules are organized really well. Difficult topics like heat treatment and failure analysis feel less overwhelming.',
      },
      {
        author: 'Dr. Ian Torres',
        role: 'Technical reviewer',
        rating: 4.5,
        content:
          'This layout works well for advanced engineering topics because the references, modules, and progress flow stay connected.',
      },
    ],
  },
};

const ARCHIVE_OPTIONS = ['Current intake', 'May 2026', 'April 2026', 'March 2026'];

const TAB_OPTIONS = [
  { value: 'description', label: 'Description' },
  { value: 'curriculum', label: 'Curriculum' },
  { value: 'faq', label: 'FAQ' },
  { value: 'notice', label: 'Notice' },
  { value: 'reviews', label: 'Reviews' },
];

function getCourseCopy(course) {
  return (
    COURSE_PAGE_COPY[course.id] ?? {
      category: 'Engineering Program',
      badge: 'FEATURED',
      description: course.description,
      body: [course.description],
      learn: course.subjects,
      audience: ['Learners preparing for guided technical review.'],
      faqs: [],
      notices: [],
      reviews: [],
    }
  );
}

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

function PopularCourseItem({ course }) {
  const copy = getCourseCopy(course);

  return (
    <Box component={RouterLink} href={paths.dashboard.courses.details(course.id)} sx={styles.popularCourseLink}>
      <Box sx={{ ...styles.popularCourseThumb, ...courseArtSx(course.id, true) }} />
      <Stack spacing={0.35} sx={styles.popularCourseStack}>
        <Typography variant="subtitle2" sx={styles.popularCourseTitle}>
          {course.title}
        </Typography>
        <Typography variant="caption" sx={styles.popularCourseCategory}>
          {copy.category}
        </Typography>
        <Typography variant="caption" sx={styles.popularCourseMentor}>
          By {course.mentor}
        </Typography>
      </Stack>
    </Box>
  );
}

export function CourseDetailsView({ courseId }) {
  const [tabValue, setTabValue] = useState('description');
  const course = useLmsCourse(courseId);
  const courses = useLmsCourses();
  const programs = useLmsPrograms();
  const modules = useLmsModulesByCourse(courseId);
  const relatedCourses = useMemo(
    () => courses.filter((item) => item.id !== courseId).slice(0, 3),
    [courseId, courses]
  );

  if (!course) {
    return (
      <DashboardContent maxWidth={false}>
        <Typography variant="body2">This course is not available in the current LMS mock set.</Typography>
      </DashboardContent>
    );
  }

  const copy = getCourseCopy(course);
  const program = programs.find((item) => item.id === course.programId);
  const videoLessons = modules.filter((moduleItem) => moduleItem.resources.includes('Video')).length;
  const averageRating = copy.reviews.length
    ? copy.reviews.reduce((sum, review) => sum + review.rating, 0) / copy.reviews.length
    : 4.8;
  const detailRows = [
    { label: 'Duration', value: `${course.hours} hours`, icon: 'solar:clock-circle-linear' },
    { label: 'Lectures', value: modules.length, icon: 'solar:notebook-minimalistic-linear' },
    { label: 'Video', value: `${videoLessons} lessons`, icon: 'solar:play-circle-linear' },
    { label: 'Level', value: course.level, icon: 'solar:shield-check-linear' },
  ];

  return (
    <DashboardContent maxWidth={false}>
      <Stack spacing={4.5} sx={lmsPageShellStyles.content}>
        <CustomBreadcrumbs
          heading={course.title}
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Programs', href: paths.dashboard.courses.root },
            { name: copy.category },
          ]}
        />

        <Grid container spacing={{ xs: 4, lg: 5 }} alignItems="flex-start">
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={3}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', md: 'center' }}
                spacing={2}
              >
                <Stack direction="row" spacing={1.2} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Typography variant="body2" sx={styles.metaLine}>
                    {copy.category}, {course.subjects.join(' & ')}
                  </Typography>
                  <Chip label={copy.badge} color="success" size="small" />
                </Stack>

                <Stack direction="row" spacing={1}>
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

              <Typography variant="h2" sx={styles.pageTitle}>
                {course.title}
              </Typography>

              <Typography variant="body1" sx={styles.heroDescription}>
                {copy.description}
              </Typography>

              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={{ xs: 2, md: 3 }}
                divider={<Divider orientation="vertical" flexItem sx={styles.verticalDivider} />}
                sx={styles.metaRow}
              >
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <Avatar sx={styles.mentorAvatar}>
                    {course.mentor
                      .split(' ')
                      .slice(0, 2)
                      .map((item) => item[0])
                      .join('')}
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={styles.instructorCaption}>
                      Instructor
                    </Typography>
                    <Typography variant="subtitle2" sx={styles.instructorName}>
                      {course.mentor}
                    </Typography>
                  </Box>
                </Stack>

                <Box>
                  <Typography variant="h6" sx={styles.enrolledCount}>
                    {course.learners.toLocaleString()}
                  </Typography>
                  <Typography variant="caption">Students enrolled</Typography>
                </Box>

                <Stack spacing={0.35}>
                  <Rating readOnly precision={0.5} value={averageRating} size="small" />
                  <Typography variant="caption">
                    {copy.reviews.length} reviews
                  </Typography>
                </Stack>
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
                        {copy.body.map((paragraph) => (
                          <Typography key={paragraph} variant="body1" sx={styles.bodyParagraph}>
                            {paragraph}
                          </Typography>
                        ))}
                      </Stack>

                      <Stack spacing={1.5}>
                        <Typography variant="h4">What you&apos;ll learn</Typography>
                        <Stack component="ul" spacing={1.1} sx={styles.learnList}>
                          {copy.learn.map((item) => (
                            <Typography key={item} component="li" variant="body1" sx={styles.learnListItem}>
                              {item}
                            </Typography>
                          ))}
                        </Stack>
                      </Stack>

                      <Stack spacing={1.5}>
                        <Typography variant="h4">Who is the target audience?</Typography>
                        <Stack component="ul" spacing={1.1} sx={styles.learnList}>
                          {copy.audience.map((item) => (
                            <Typography key={item} component="li" variant="body1" sx={styles.learnListItem}>
                              {item}
                            </Typography>
                          ))}
                        </Stack>
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
                      {copy.faqs.map((item, index) => (
                        <Accordion
                          key={item.question}
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
                      {copy.notices.map((item) => (
                        <Card key={item} sx={styles.moduleCard}>
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
                                Based on {copy.reviews.length} learner reviews
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

          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={3}>
              <Card sx={styles.sidebarCard}>
                <CardContent sx={styles.sidebarCardPadding}>
                  <Stack spacing={2.5}>
                    <Button
                      component={RouterLink}
                      href={paths.dashboard.modules.details(course.nextModuleId)}
                      variant="contained"
                      size="large"
                      sx={styles.startCourseCta}
                    >
                      START COURSE
                    </Button>

                    <Stack spacing={1.6}>
                      <Typography variant="h5">Course details</Typography>
                      <Divider />
                      {detailRows.map((item) => (
                        <SidebarDetailRow key={item.label} {...item} />
                      ))}
                    </Stack>
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
                    <Typography variant="h5">Archive</Typography>
                    <Divider />
                    <TextField select fullWidth defaultValue={ARCHIVE_OPTIONS[0]}>
                      {ARCHIVE_OPTIONS.map((item) => (
                        <MenuItem key={item} value={item}>
                          {item}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                </CardContent>
              </Card>

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
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </DashboardContent>
  );
}

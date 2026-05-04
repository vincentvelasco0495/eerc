import { useMemo } from 'react';
import { useParams } from 'react-router';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import {
  useLmsQuiz,
  useLmsCourse,
  useLmsCourses,
  useLmsQuizzes,
  useResolvedCourseIdFromLookup,
} from 'src/hooks/use-lms';

import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CourseDetailBackArrowSvg } from 'src/components/course-detail/course-detail-back-arrow';

function formatTimeLimitMinutes(minutes) {
  const m = typeof minutes === 'number' && Number.isFinite(minutes) ? Math.max(0, Math.round(minutes)) : 0;
  if (m <= 0) {
    return '—';
  }
  if (m >= 60 && m % 60 === 0) {
    const h = m / 60;
    return `${h} hour${h === 1 ? '' : 's'}`;
  }
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const r = m % 60;
    return `${h} hr ${r} min`;
  }
  return `${m} minutes`;
}

// ----------------------------------------------------------------------

export function CourseQuizStartView() {
  const theme = useTheme();
  const { slug = '', courseId = '', quizId = '' } = useParams();
  const courseLookup = slug || courseId;

  const { isLoading: coursesLoading } = useLmsCourses(1, 500);
  useLmsQuizzes();
  const resolvedCourseId = useResolvedCourseIdFromLookup(courseLookup);
  const course = useLmsCourse(resolvedCourseId);
  const quiz = useLmsQuiz(quizId);

  const courseLinkHref = paths.dashboard.courseDetails(
    typeof course?.slug === 'string' && course.slug.trim() ? course.slug.trim() : courseLookup
  );

  /** `new=1` clears a finished in-browser session so the take view can start a fresh attempt. */
  const takeHref = `${paths.dashboard.courseQuizTake(courseLookup, quizId)}?new=1`;

  const title = typeof quiz?.title === 'string' && quiz.title.trim() ? quiz.title.trim() : 'Quiz';
  const questionCount =
    typeof quiz?.questionCount === 'number' && Number.isFinite(quiz.questionCount)
      ? quiz.questionCount
      : '—';
  const timeLimitLabel = useMemo(
    () => formatTimeLimitMinutes(quiz?.durationMinutes),
    [quiz?.durationMinutes]
  );

  const loading = Boolean(
    courseLookup && (coursesLoading || (resolvedCourseId && !course && !coursesLoading))
  );

  if (!CONFIG.serverUrl?.trim()) {
    return (
      <DashboardContent maxWidth="md">
        <Typography variant="body2">
          Quizzes require the LMS API. Set <code>VITE_SERVER_URL</code> and sign in.
        </Typography>
      </DashboardContent>
    );
  }

  if (loading) {
    return (
      <DashboardContent
        maxWidth={false}
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'min(72dvh, 640px)',
          py: 4,
        }}
      >
        <CircularProgress aria-label="Loading quiz" />
      </DashboardContent>
    );
  }

  if (!quiz) {
    return (
      <DashboardContent maxWidth="md">
        <Button component={RouterLink} href={courseLinkHref} color="inherit" sx={{ mb: 2 }}>
          Back to course
        </Button>
        <Typography variant="body2">This quiz could not be found.</Typography>
      </DashboardContent>
    );
  }

  const isDark = theme.palette.mode === 'dark';
  const iconWrapSx = {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    bgcolor: isDark ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.primary.main, 0.12),
    color: 'primary.main',
  };

  return (
    <DashboardContent
      maxWidth={false}
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'min(72dvh, 640px)',
        px: 3,
        py: 4,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 440,
          textAlign: 'center',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3, alignSelf: 'flex-start' }}>
          <Box
            component={RouterLink}
            href={courseLinkHref}
            aria-label="Back to course"
            sx={{
              display: 'inline-flex',
              color: 'text.primary',
              '&:hover': { opacity: 0.72 },
            }}
          >
            <CourseDetailBackArrowSvg width={28} height={28} />
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            component={RouterLink}
            href={courseLinkHref}
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Back to course
          </Typography>
        </Stack>

        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.2 }}>
          Quiz
        </Typography>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mt: 0.5, mb: 3, color: 'text.primary' }}>
          {title}
        </Typography>

        <Stack spacing={2} sx={{ textAlign: 'left', mb: 4 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={iconWrapSx} aria-hidden>
              <Iconify icon="solar:question-circle-bold-duotone" width={22} />
            </Box>
            <Typography variant="body1" color="text.primary">
              Questions count: <strong>{questionCount}</strong>
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={iconWrapSx} aria-hidden>
              <Iconify icon="solar:clock-circle-bold-duotone" width={22} />
            </Box>
            <Typography variant="body1" color="text.primary">
              Time limit: <strong>{timeLimitLabel}</strong>
            </Typography>
          </Stack>
        </Stack>

        <Button
          component={RouterLink}
          href={takeHref}
          variant="contained"
          size="large"
          fullWidth
          sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}
        >
          Start Quiz
        </Button>
      </Box>
    </DashboardContent>
  );
}

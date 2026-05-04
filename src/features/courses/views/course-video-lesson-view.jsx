import { useParams, useNavigate } from 'react-router';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import {
  useLmsCourse,
  useLmsCourses,
  useLmsQuizzes,
  useLmsModulesByCourse,
  useResolvedCourseIdFromLookup,
} from 'src/hooks/use-lms';

import axios from 'src/lib/axios';
import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CourseDetailBackArrowSvg } from 'src/components/course-detail/course-detail-back-arrow';
import { mapLmsToStyledCourseDetail } from 'src/components/course-detail/map-lms-to-styled-shell';

import { extractYouTubeVideoIdFromHtml } from '../utils/extract-youtube-id-from-html';
import { resolveVideoLessonFromModules } from '../utils/resolve-video-lesson-from-modules';

// ----------------------------------------------------------------------

const VIDEO_CURRICULUM_TYPES = new Set(['video', 'stream', 'zoom']);

/**
 * Learner-facing full-page video lesson: uploaded file from `lesson_materials` (DB `storage_path`
 * streamed via `/api/lesson-materials/:id/file?inline=1`) when present; otherwise YouTube from body HTML.
 */
export function CourseVideoLessonView() {
  const theme = useTheme();
  const { slug = '', courseId = '', lessonId = '' } = useParams();
  const courseLookup = slug || courseId;
  const navigate = useNavigate();

  const { isLoading: coursesLoading } = useLmsCourses(1, 500);
  const resolvedCourseId = useResolvedCourseIdFromLookup(courseLookup);
  const course = useLmsCourse(resolvedCourseId);
  const { modules, isLoading: modulesLoading } = useLmsModulesByCourse(resolvedCourseId);
  const { quizzes } = useLmsQuizzes();

  const quizzesForCourse = useMemo(
    () => (resolvedCourseId ? quizzes.filter((q) => q.courseId === resolvedCourseId) : []),
    [quizzes, resolvedCourseId]
  );

  const lessonPayload = useMemo(
    () => resolveVideoLessonFromModules(lessonId, modules),
    [lessonId, modules]
  );

  const youtubeId = useMemo(
    () => extractYouTubeVideoIdFromHtml(lessonPayload?.bodyHtml ?? ''),
    [lessonPayload?.bodyHtml]
  );

  const fileMaterialId = lessonPayload?.primaryVideoMaterial?.id ?? null;

  const [fileVideoObjectUrl, setFileVideoObjectUrl] = useState(null);
  const [fileVideoError, setFileVideoError] = useState(null);
  const [fileVideoLoading, setFileVideoLoading] = useState(false);

  useEffect(() => {
    if (!fileMaterialId) {
      setFileVideoObjectUrl(null);
      setFileVideoError(null);
      setFileVideoLoading(false);
      return undefined;
    }

    let alive = true;
    let objectUrl = null;

    setFileVideoObjectUrl(null);
    setFileVideoError(null);
    setFileVideoLoading(true);

    axios
      .get(`/api/lesson-materials/${encodeURIComponent(fileMaterialId)}/file`, {
        responseType: 'blob',
        params: { inline: 1 },
      })
      .then((res) => {
        const u = URL.createObjectURL(res.data);
        if (!alive) {
          URL.revokeObjectURL(u);
          return;
        }
        objectUrl = u;
        setFileVideoObjectUrl(u);
      })
      .catch(() => {
        if (alive) {
          setFileVideoError('Could not load the uploaded video file.');
        }
      })
      .finally(() => {
        if (alive) {
          setFileVideoLoading(false);
        }
      });

    return () => {
      alive = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fileMaterialId]);

  const navIds = useMemo(() => {
    if (!course || !lessonId) {
      return { prevId: null, nextId: null };
    }
    const shell = mapLmsToStyledCourseDetail(course, modules, quizzesForCourse);
    const videoLessons = [];
    shell.curriculumModules.forEach((mod) => {
      mod.lessons.forEach((les) => {
        if (VIDEO_CURRICULUM_TYPES.has(les.type)) {
          videoLessons.push(les.id);
        }
      });
    });
    const idx = videoLessons.indexOf(lessonId);
    return {
      prevId: idx > 0 ? videoLessons[idx - 1] : null,
      nextId: idx >= 0 && idx < videoLessons.length - 1 ? videoLessons[idx + 1] : null,
    };
  }, [course, modules, quizzesForCourse, lessonId]);

  const courseLinkHref = paths.dashboard.courseDetails(
    typeof course?.slug === 'string' && course.slug.trim() ? course.slug.trim() : courseLookup
  );

  const toLessonHref = useCallback(
    (id) => (id ? paths.dashboard.courseVideoLesson(courseLookup, id) : null),
    [courseLookup]
  );

  const loading = Boolean(
    courseLookup && (coursesLoading || (resolvedCourseId && modulesLoading))
  );

  if (!courseLookup || !lessonId) {
    return (
      <DashboardContent maxWidth={false}>
        <Typography variant="body2">Missing course or lesson.</Typography>
      </DashboardContent>
    );
  }

  if (!CONFIG.serverUrl?.trim()) {
    return (
      <DashboardContent maxWidth={false}>
        <Typography variant="body2">
          Video lessons require the LMS API. Set <code>VITE_SERVER_URL</code> and sign in.
        </Typography>
      </DashboardContent>
    );
  }

  if (loading) {
    return (
      <DashboardContent maxWidth={false}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  if (courseLookup && !resolvedCourseId) {
    return (
      <DashboardContent maxWidth={false}>
        <Stack spacing={2} sx={{ py: 4 }}>
          <Typography variant="body1">This course is not in the catalog or the link is invalid.</Typography>
          <Button component={RouterLink} href={paths.dashboard.courses.root} variant="contained" color="inherit">
            Browse courses
          </Button>
        </Stack>
      </DashboardContent>
    );
  }

  if (!lessonPayload) {
    return (
      <DashboardContent maxWidth={false}>
        <Stack spacing={2} sx={{ py: 4 }}>
          <Typography variant="body1">This video lesson could not be found for this course.</Typography>
          <Button component={RouterLink} href={courseLinkHref} variant="contained" color="inherit">
            Back to course
          </Button>
        </Stack>
      </DashboardContent>
    );
  }

  const courseTitle =
    typeof course?.title === 'string' && course.title.trim() ? course.title.trim() : 'Course';

  const kindLabel =
    lessonPayload.lessonKind === 'stream'
      ? 'Stream lesson'
      : lessonPayload.lessonKind === 'zoom'
        ? 'Zoom lesson'
        : 'Video lesson';

  return (
    <DashboardContent maxWidth={false} disablePadding sx={{ bgcolor: 'transparent' }}>
      <title>{`${lessonPayload.title} | ${CONFIG.appName}`}</title>
      <Box
        sx={{
          minHeight: 'calc(100vh - 160px)',
          bgcolor: (t) => alpha(t.palette.grey[500], t.palette.mode === 'dark' ? 0.12 : 0.06),
          pb: { xs: 4, md: 6 },
        }}
      >
        <Box
          sx={{
            maxWidth: 920,
            mx: 'auto',
            px: { xs: 2, sm: 3 },
            pt: { xs: 2, md: 3 },
          }}
        >
          <Stack spacing={2.5}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap={2}>
              <Stack spacing={1.25} sx={{ minWidth: 0 }}>
                <Box
                  component={RouterLink}
                  href={courseLinkHref}
                  aria-label="Back to course"
                  sx={(t) => ({
                    alignSelf: 'flex-start',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    m: 0,
                    p: 0,
                    border: 'none',
                    borderRadius: '8px',
                    color: t.palette.mode === 'dark' ? 'text.primary' : 'primary.dark',
                    bgcolor: 'transparent',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor:
                        t.palette.mode === 'dark'
                          ? alpha(t.palette.primary.main, 0.08)
                          : alpha(t.palette.primary.main, 0.06),
                    },
                    '&:focus-visible': {
                      outline: `2px solid ${t.palette.primary.main}`,
                      outlineOffset: '2px',
                    },
                  })}
                >
                  <CourseDetailBackArrowSvg />
                </Box>
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {courseTitle}
                  </Typography>
                  {lessonPayload.moduleTitle ? (
                    <>
                      <Typography variant="caption" color="text.disabled">
                        ·
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {lessonPayload.moduleTitle}
                      </Typography>
                    </>
                  ) : null}
                  <Typography variant="caption" color="text.disabled">
                    ·
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Lesson content
                  </Typography>
                </Stack>
              </Stack>
              <Chip
                icon={<Iconify icon="solar:play-circle-linear" width={16} />}
                label={kindLabel}
                color="primary"
                variant="soft"
                size="small"
                sx={{ fontWeight: 700 }}
              />
            </Stack>

            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: (t) =>
                  t.palette.mode === 'dark'
                    ? `0 0 0 1px ${alpha(t.palette.common.white, 0.06)}`
                    : `0 12px 48px ${alpha(theme.palette.grey[500], 0.12)}`,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  height: 4,
                  background: (t) =>
                    `linear-gradient(90deg, ${t.palette.primary.main} 0%, ${alpha(t.palette.primary.main, 0.45)} 55%, ${t.palette.primary.light} 100%)`,
                }}
              />
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 }, pb: { xs: 2, md: 2.5 } }}>
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: -0.02,
                    fontSize: { xs: '1.65rem', md: '2rem' },
                    lineHeight: 1.25,
                    mb: 0,
                  }}
                >
                  {lessonPayload.title}
                </Typography>
              </CardContent>

              <Divider />

              <CardContent sx={{ p: { xs: 2.5, md: 3.5 }, pt: { xs: 2.5, md: 3 } }}>
                {fileVideoObjectUrl ? (
                  <Box
                    sx={{
                      position: 'relative',
                      width: 1,
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      bgcolor: (t) => (t.palette.mode === 'dark' ? '#000' : '#111'),
                      border: '1px solid',
                      borderColor: 'divider',
                      aspectRatio: '16 / 9',
                      mb: 3,
                    }}
                  >
                    <Box
                      component="video"
                      src={fileVideoObjectUrl}
                      controls
                      playsInline
                      preload="metadata"
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        width: 1,
                        height: 1,
                        objectFit: 'contain',
                        bgcolor: '#000',
                      }}
                    />
                  </Box>
                ) : fileVideoError ? (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      mb: 3,
                      borderColor: 'error.main',
                      bgcolor: (t) => alpha(t.palette.error.main, 0.08),
                    }}
                  >
                    <Typography variant="body2" color="error.main">
                      {fileVideoError}
                    </Typography>
                  </Paper>
                ) : fileVideoLoading && fileMaterialId ? (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      aspectRatio: '16 / 9',
                      mb: 3,
                      borderRadius: 1.5,
                      bgcolor: (t) => alpha(t.palette.grey[500], t.palette.mode === 'dark' ? 0.2 : 0.16),
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <CircularProgress />
                  </Box>
                ) : youtubeId ? (
                  <Box
                    sx={{
                      position: 'relative',
                      width: 1,
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      bgcolor: '#111',
                      border: '1px solid',
                      borderColor: 'divider',
                      aspectRatio: '16 / 9',
                      mb: 3,
                    }}
                  >
                    <Box
                      component="iframe"
                      title={lessonPayload.title}
                      src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        width: 1,
                        height: 1,
                        border: 'none',
                      }}
                    />
                  </Box>
                ) : (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      mb: 3,
                      borderStyle: 'dashed',
                      bgcolor: (t) => alpha(t.palette.grey[500], 0.04),
                      textAlign: 'center',
                    }}
                  >
                    <Iconify icon="solar:videocamera-record-linear" width={40} sx={{ color: 'text.disabled', mb: 1.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      Upload a video file to lesson materials, or add a YouTube link in lesson content.
                    </Typography>
                  </Paper>
                )}

                {lessonPayload.bodyHtml ? (
                  <Box
                    className="video-lesson-body"
                    sx={{
                      color: 'text.primary',
                      fontSize: '1rem',
                      lineHeight: 1.75,
                      maxWidth: 720,
                      '& p': { mb: 2.25, mt: 0 },
                      '& p:last-child': { mb: 0 },
                      '& ul, & ol': { pl: 2.75, mb: 2, '& li': { mb: 0.75 } },
                      '& h1, & h2, & h3': {
                        fontWeight: 700,
                        mt: 2.5,
                        mb: 1.25,
                        lineHeight: 1.35,
                      },
                      '& a': {
                        color: 'primary.main',
                        fontWeight: 600,
                        textDecorationColor: (t) => alpha(t.palette.primary.main, 0.45),
                      },
                      '& blockquote': {
                        my: 2,
                        pl: 2,
                        borderLeft: '4px solid',
                        borderColor: 'primary.main',
                        color: 'text.secondary',
                        fontStyle: 'italic',
                      },
                      '& strong': { color: 'text.primary' },
                    }}
                    dangerouslySetInnerHTML={{ __html: lessonPayload.bodyHtml }}
                  />
                ) : null}
              </CardContent>
            </Card>

            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
              >
                <Button
                  variant="outlined"
                  color="inherit"
                  disabled={!navIds.prevId}
                  onClick={() => navIds.prevId && navigate(toLessonHref(navIds.prevId))}
                  startIcon={<Iconify icon="solar:alt-arrow-left-linear" width={20} />}
                  sx={{
                    minWidth: { sm: 140 },
                    fontWeight: 700,
                    borderColor: 'divider',
                    '&:not(:disabled):hover': { borderColor: 'text.primary' },
                  }}
                >
                  Previous
                </Button>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ order: { xs: -1, sm: 0 } }}>
                  <Iconify icon="solar:route-linear" width={20} sx={{ color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.08 }}>
                    Lesson navigation
                  </Typography>
                </Stack>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!navIds.nextId}
                  onClick={() => navIds.nextId && navigate(toLessonHref(navIds.nextId))}
                  endIcon={<Iconify icon="solar:alt-arrow-right-linear" width={20} />}
                  sx={{ minWidth: { sm: 140 }, fontWeight: 700, boxShadow: 'none' }}
                >
                  Next
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Box>
      </Box>
    </DashboardContent>
  );
}

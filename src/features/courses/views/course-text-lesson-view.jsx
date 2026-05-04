import { useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';

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
import { colors as courseDetailColors } from 'src/components/course-detail/course-detail-tokens';
import { mapLmsToStyledCourseDetail } from 'src/components/course-detail/map-lms-to-styled-shell';

import { resolveTextLessonFromModules } from '../utils/resolve-text-lesson-from-modules';

// ----------------------------------------------------------------------

function formatBytes(n) {
  const v = Number(n);
  if (!Number.isFinite(v) || v < 0) {
    return '—';
  }
  if (v < 1024) {
    return `${Math.round(v)} B`;
  }
  if (v < 1024 * 1024) {
    const kb = v / 1024;
    return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} kb`;
  }
  return `${(v / (1024 * 1024)).toFixed(1)} MB`;
}

function mimeKind(mime) {
  const m = typeof mime === 'string' ? mime.toLowerCase() : '';
  if (m.includes('pdf')) {
    return 'pdf';
  }
  if (m.startsWith('image/')) {
    return 'image';
  }
  return 'file';
}

function fileRowIcon(kind) {
  if (kind === 'pdf') {
    return 'solar:file-text-bold-duotone';
  }
  if (kind === 'image') {
    return 'solar:gallery-bold-duotone';
  }
  return 'solar:document-bold-duotone';
}

/**
 * Learner-facing full-page text lesson (HTML body + downloadable materials from LMS API).
 */
export function CourseTextLessonView() {
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
    () => resolveTextLessonFromModules(lessonId, modules),
    [lessonId, modules]
  );

  const navIds = useMemo(() => {
    if (!course || !lessonId) {
      return { prevId: null, nextId: null };
    }
    const shell = mapLmsToStyledCourseDetail(course, modules, quizzesForCourse);
    const docLessons = [];
    shell.curriculumModules.forEach((mod) => {
      mod.lessons.forEach((les) => {
        if (les.type === 'document') {
          docLessons.push(les.id);
        }
      });
    });
    const idx = docLessons.indexOf(lessonId);
    return {
      prevId: idx > 0 ? docLessons[idx - 1] : null,
      nextId: idx >= 0 && idx < docLessons.length - 1 ? docLessons[idx + 1] : null,
    };
  }, [course, modules, quizzesForCourse, lessonId]);

  const courseLinkHref = paths.dashboard.courseDetails(
    typeof course?.slug === 'string' && course.slug.trim() ? course.slug.trim() : courseLookup
  );

  const toLessonHref = useCallback(
    (id) => (id ? paths.dashboard.courseTextLesson(courseLookup, id) : null),
    [courseLookup]
  );

  const downloadMaterial = useCallback(async (materialPublicId, filename) => {
    const url = `/api/lesson-materials/${encodeURIComponent(materialPublicId)}/file`;
    const res = await axios.get(url, { responseType: 'blob' });
    const blob = res.data;
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename || 'download';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  }, []);

  const downloadAll = useCallback(() => {
    const mats = lessonPayload?.lessonMaterials ?? [];
    void (async () => {
      for (let i = 0; i < mats.length; i += 1) {
        const m = mats[i];
        if (m?.id) {
          await downloadMaterial(m.id, m.name ?? `file-${i + 1}`);
        }
      }
    })();
  }, [lessonPayload?.lessonMaterials, downloadMaterial]);

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
          Text lessons require the LMS API. Set <code>VITE_SERVER_URL</code> and sign in.
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
          <Typography variant="body1">This text lesson could not be found for this course.</Typography>
          <Button component={RouterLink} href={courseLinkHref} variant="contained" color="inherit">
            Back to course
          </Button>
        </Stack>
      </DashboardContent>
    );
  }

  const materials = lessonPayload.lessonMaterials;
  const courseTitle =
    typeof course?.title === 'string' && course.title.trim() ? course.title.trim() : 'Course';

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
                    color: courseDetailColors.headingNavy,
                    bgcolor: 'transparent',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'rgba(30, 58, 138, 0.06)',
                    },
                    '&:focus-visible': {
                      outline: `2px solid ${courseDetailColors.primary}`,
                      outlineOffset: '2px',
                    },
                    ...(t.palette.mode === 'dark'
                      ? {
                          color: 'text.primary',
                          '&:hover': {
                            bgcolor: alpha(t.palette.primary.main, 0.08),
                          },
                        }
                      : {}),
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
                icon={<Iconify icon="solar:document-text-linear" width={16} />}
                label="Text lesson"
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
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
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
                {lessonPayload.bodyHtml ? (
                  <Box
                    className="text-lesson-body"
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
                      '& img': { maxWidth: 1, height: 'auto', borderRadius: 1 },
                    }}
                    dangerouslySetInnerHTML={{ __html: lessonPayload.bodyHtml }}
                  />
                ) : (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      borderStyle: 'dashed',
                      bgcolor: (t) => alpha(t.palette.grey[500], 0.04),
                      textAlign: 'center',
                    }}
                  >
                    <Iconify
                      icon="solar:notes-linear"
                      width={40}
                      sx={{ color: 'text.disabled', mb: 1.5 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      No lesson content has been published yet.
                    </Typography>
                  </Paper>
                )}
              </CardContent>
            </Card>

            {materials.length > 0 ? (
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: (t) =>
                    t.palette.mode === 'dark'
                      ? `0 0 0 1px ${alpha(t.palette.common.white, 0.06)}`
                      : `0 8px 32px ${alpha(theme.palette.grey[500], 0.08)}`,
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2.5 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1.5,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                        color: 'primary.main',
                      }}
                    >
                      <Iconify icon="solar:folder-with-files-bold-duotone" width={24} />
                    </Box>
                    <Box>
                      <Typography variant="h6" component="h2" sx={{ fontWeight: 800, lineHeight: 1.3 }}>
                        Lesson materials
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Files provided with this lesson — download individually or all at once.
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={0}>
                    {materials.map((m) => {
                      const kind = mimeKind(m.mime);
                      return (
                        <Stack
                          key={m.id}
                          direction={{ xs: 'column', sm: 'row' }}
                          alignItems={{ xs: 'stretch', sm: 'center' }}
                          spacing={2}
                          sx={{
                            py: 2,
                            px: { xs: 0, sm: 0.5 },
                            borderRadius: 1,
                            transition: theme.transitions.create(['background-color'], {
                              duration: theme.transitions.duration.shorter,
                            }),
                            '&:hover': {
                              bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
                            },
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
                            <Box
                              sx={{
                                width: 44,
                                height: 44,
                                borderRadius: 1,
                                flexShrink: 0,
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor: 'background.neutral',
                                color: 'text.secondary',
                              }}
                            >
                              <Iconify icon={fileRowIcon(kind)} width={26} />
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="subtitle2" noWrap title={m.name} sx={{ fontWeight: 700 }}>
                                {m.name ?? 'File'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatBytes(m.sizeBytes)}
                              </Typography>
                            </Box>
                          </Stack>
                          <Button
                            variant="soft"
                            color="primary"
                            size="small"
                            startIcon={<Iconify icon="solar:download-minimalistic-bold" width={18} />}
                            onClick={() => downloadMaterial(m.id, m.name)}
                            sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, flexShrink: 0 }}
                          >
                            Download
                          </Button>
                        </Stack>
                      );
                    })}
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1.5}>
                    <Typography variant="body2" color="text.secondary">
                      <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {materials.length}
                      </Box>{' '}
                      {materials.length === 1 ? 'file attached' : 'files attached'}
                    </Typography>
                    <Button
                      variant="text"
                      color="primary"
                      size="small"
                      startIcon={<Iconify icon="solar:archive-down-minimlistic-bold" width={18} />}
                      onClick={() => downloadAll()}
                      sx={{ fontWeight: 700 }}
                    >
                      Download all
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ) : null}

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

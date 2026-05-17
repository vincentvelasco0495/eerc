import styled from 'styled-components';
import { useMemo, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';

import {
  useEnrollment,
  useLmsActions,
  useLmsCourses,
  useLmsQuizzes,
  useLmsPrograms,
  useLmsProgramStats,
  useLmsModulesByCourse,
} from 'src/hooks/use-lms';

import { resolveProgramBannerSrc } from 'src/utils/program-banner';

import { InstructorCourseCard } from 'src/features/instructor-profile/components/instructor-course-card';
import { InstructorProfileTabs } from 'src/features/instructor-profile/components/instructor-profile-tabs';
import { mapLmsCatalogCourseToInstructorCard } from 'src/features/instructor-profile/map-lms-catalog-course-to-instructor-card';

import { ConfirmDialog } from 'src/components/custom-dialog';

import { useAuthContext } from 'src/auth/hooks';

import { SidebarCard } from '../../components/course-detail/SidebarCard';
import { space, colors } from '../../components/course-detail/course-detail-tokens';
import { CourseDetailsCard } from '../../components/course-detail/CourseDetailsCard';
import { CourseDetailBackArrowSvg } from '../../components/course-detail/course-detail-back-arrow';
import { mapLmsToStyledCourseDetail } from '../../components/course-detail/map-lms-to-styled-shell';

const PageBg = styled.div`
  min-height: 100vh;
  background: ${colors.white};
  font-family:
    'Public Sans',
    system-ui,
    -apple-system,
    sans-serif;
`;

const PageInner = styled.div`
  max-width: 1224px;
  margin: 0 auto;
  padding: ${space(3)} ${space(3)} ${space(6)};

  @media (max-width: 900px) {
    padding: ${space(2)};
  }
`;

const PageMain = styled.main`
  width: 100%;
`;

const LocalHeader = styled.header`
  width: 100%;
  margin-bottom: ${space(4)};
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin: 0 0 ${space(2)};
  padding: 0;
  border: none;
  border-radius: 8px;
  color: ${colors.headingNavy};
  background: transparent;
  cursor: pointer;

  &:hover {
    background: rgba(30, 58, 138, 0.06);
  }

  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
  }
`;

const Title = styled.h1`
  margin: 0 0 ${space(1.5)};
  font-size: clamp(1.6rem, 3vw, 2.05rem);
  font-weight: 700;
  line-height: 1.22;
  color: ${colors.headingNavy};
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: ${colors.muted};
`;

/** Narrow sidebar + wide content; mobile: flex column — main (hero) above sidebar. */
const TwoColGrid = styled.div`
  display: grid;
  grid-template-columns: 316px minmax(0, 1fr);
  gap: 28px;
  align-items: start;

  @media (max-width: 900px) {
    display: flex;
    flex-direction: column;
    gap: ${space(3)};
  }
`;

const AsideColumn = styled.aside`
  position: sticky;
  top: ${space(2)};
  display: flex;
  flex-direction: column;
  gap: ${space(2.5)};

  @media (max-width: 900px) {
    position: relative;
    top: auto;
    order: 2;
  }
`;

const MainColumn = styled.section`
  min-width: 0;

  @media (max-width: 900px) {
    order: 1;
  }
`;

const HeroFigure = styled.figure`
  margin: 0;
`;

const HeroImg = styled.img`
  display: block;
  width: 100%;
  border-radius: 12px;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  background: #e8f4fc;
`;

const programHeroBannerFrameSx = {
  position: 'relative',
  width: '100%',
  aspectRatio: '16 / 9',
  borderRadius: '12px',
  overflow: 'hidden',
  bgcolor: 'grey.300',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
};

const EnrollNowBtn = styled.button`
  width: 100%;
  margin-top: ${space(2)};
  padding: 14px ${space(2)};
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: ${colors.white};
  background: ${colors.primary};
  cursor: pointer;
  transition:
    filter 0.15s ease,
    transform 0.15s ease;

  &:hover:not(:disabled) {
    filter: brightness(1.05);
  }

  &:focus-visible {
    outline: 2px solid #1d4ed8;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const EnrolledNotice = styled.p`
  margin: ${space(2)} 0 0;
  padding: 12px ${space(2)};
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.5;
  text-align: center;
  color: ${colors.text};
  background: #e8f4fc;
  border: 1px solid #dbeafe;
`;

const RejectedNotice = styled.p`
  margin: ${space(2)} 0 0;
  padding: 12px ${space(2)};
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.5;
  text-align: center;
  color: #991b1b;
  background: #fef2f2;
  border: 1px solid #fecaca;
`;

const ProgramCoursesGridWrap = styled.section`
  margin-top: ${space(2.5)};
`;

/** Match enrollment to program by `programId`, or legacy `courseId` under this program. */
function matchesProgramEnrollment(item, programId, programCourses) {
  if (!programId || !item) {
    return false;
  }
  if (item.programId === programId) {
    return true;
  }
  if (typeof item.courseId === 'string') {
    const course = programCourses.find((row) => row.id === item.courseId);
    return course?.programId === programId;
  }
  return false;
}

const PROGRAM_COURSE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'In Draft' },
  { value: 'upcoming', label: 'Upcoming' },
];

const PROGRAM_ALIAS_TO_ID = {
  'civil-engineering': 'program-ce',
  'civil_engineering': 'program-ce',
  'civil-engineing': 'program-ce',
  'civil_engineing': 'program-ce',
  civilengineering: 'program-ce',
  ce: 'program-ce',
  'master-plumbing': 'program-plumbing',
  'master_plumbing': 'program-plumbing',
  masterplumbing: 'program-plumbing',
  mpl: 'program-plumbing',
  'materials-engineering': 'program-materials',
  'materials_engineering': 'program-materials',
  materialsengineering: 'program-materials',
  mse: 'program-materials',
};

export default function ProgramCourseDetail() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [enrollConfirmOpen, setEnrollConfirmOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { authenticated, loading: authLoading } = useAuthContext();
  const enrollment = useEnrollment(authenticated && !authLoading);
  const { submitEnrollment } = useLmsActions();
  const requestedProgram = String(searchParams.get('program') ?? '').trim().toLowerCase();
  const { programs, isLoading: programsLoading, error: programsError } = useLmsPrograms();
  const { courses, isLoading: coursesLoading, error: coursesError } = useLmsCourses(1, 500, requestedProgram);
  const { quizzes } = useLmsQuizzes();

  const normalize = (v) =>
    String(v ?? '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const selectedProgram = useMemo(() => {
    const p = programs ?? [];
    if (!requestedProgram) {
      return p[0] ?? null;
    }
    const aliasProgramId = PROGRAM_ALIAS_TO_ID[requestedProgram];
    const normalizedRequested = normalize(requestedProgram);
    return (
      p.find(
        (row) =>
          (aliasProgramId && String(row?.id) === aliasProgramId) ||
          normalize(row?.slug) === normalizedRequested ||
          normalize(row?.code) === requestedProgram ||
          normalize(row?.title) === requestedProgram ||
          normalize(row?.id) === requestedProgram
      ) ?? p[0] ?? null
    );
  }, [programs, requestedProgram]);
  const { stats: programStats } = useLmsProgramStats(selectedProgram?.id ?? null);

  const programCourses = useMemo(() => {
    const source = courses ?? [];
    if (!source.length) {
      return [];
    }
    const requestedAliasProgramId = PROGRAM_ALIAS_TO_ID[requestedProgram];
    const selectedProgramId = selectedProgram?.id ? String(selectedProgram.id) : '';
    const selectedProgramTitle = normalize(selectedProgram?.title);
    const requestedNormalized = normalize(requestedProgram);

    return source.filter((c) => {
      const courseProgramId = c?.programId ? String(c.programId) : '';
      const courseProgramTitle = normalize(c?.programTitle);
      const bySelectedId = Boolean(selectedProgramId && courseProgramId === selectedProgramId);
      const byAliasId = Boolean(requestedAliasProgramId && courseProgramId === requestedAliasProgramId);
      const bySelectedTitle = Boolean(selectedProgramTitle && courseProgramTitle === selectedProgramTitle);
      const byRequestedTitle = Boolean(requestedNormalized && courseProgramTitle === requestedNormalized);
      return bySelectedId || byAliasId || bySelectedTitle || byRequestedTitle;
    });
  }, [courses, requestedProgram, selectedProgram]);
  const programCourseCards = useMemo(
    () => programCourses.map((course) => mapLmsCatalogCourseToInstructorCard(course)),
    [programCourses]
  );
  const visibleProgramCourseCards = useMemo(() => {
    if (selectedFilter === 'all') {
      return programCourseCards;
    }
    if (selectedFilter === 'upcoming') {
      return [];
    }
    return programCourseCards.filter((course) => course.status === selectedFilter);
  }, [programCourseCards, selectedFilter]);

  const selectedCourse = programCourses[0] ?? null;
  const { modules } = useLmsModulesByCourse(selectedCourse?.id ?? null);
  const quizzesForCourse = useMemo(
    () => (selectedCourse?.id ? (quizzes ?? []).filter((q) => q.courseId === selectedCourse.id) : []),
    [quizzes, selectedCourse?.id]
  );

  const applyLessonLocks = authenticated && !authLoading;

  const shell = useMemo(
    () =>
      selectedCourse
        ? mapLmsToStyledCourseDetail(selectedCourse, modules ?? [], quizzesForCourse, [], [], null, {
            applyLessonLocks,
          })
        : null,
    [selectedCourse, modules, quizzesForCourse, applyLessonLocks]
  );

  const programTitle = selectedProgram?.title || shell?.data?.title || 'Program';
  const programDescription = selectedProgram?.description || shell?.data?.shortDescription || '';
  const programBannerSrc = resolveProgramBannerSrc(selectedProgram?.bannerPath);

  const programEnrollment = useMemo(() => {
    if (!selectedProgram?.id) {
      return null;
    }
    return (
      enrollment.find((item) => matchesProgramEnrollment(item, selectedProgram.id, programCourses)) ??
      null
    );
  }, [enrollment, programCourses, selectedProgram?.id]);

  const isEnrolledInProgram = Boolean(programEnrollment);
  const isRejectedEnrollment = programEnrollment?.status === 'rejected';
  const isActiveEnrollment = isEnrolledInProgram && !isRejectedEnrollment;

  const handleEnrollConfirm = useCallback(() => {
    setEnrollConfirmOpen(false);
    if (selectedProgram?.id && (!isEnrolledInProgram || isRejectedEnrollment)) {
      submitEnrollment(selectedProgram.id);
    }
  }, [isEnrolledInProgram, isRejectedEnrollment, selectedProgram?.id, submitEnrollment]);

  const enrollmentStatusLabel =
    programEnrollment?.status === 'approved'
      ? 'Approved'
      : programEnrollment?.status === 'rejected'
        ? 'Not approved'
        : 'Pending review';

  const showEnrollNow = authenticated && !authLoading;

  if (programsLoading || coursesLoading) {
    return (
      <PageBg>
        <PageInner>
          <PageMain>
            <h2>Loading program courses...</h2>
          </PageMain>
        </PageInner>
      </PageBg>
    );
  }

  if (programsError || coursesError) {
    const message = coursesError?.message || programsError?.message || 'Unable to load program courses.';
    return (
      <PageBg>
        <PageInner>
          <PageMain>
            <h2>Unable to load courses right now.</h2>
            <p>{message}</p>
          </PageMain>
        </PageInner>
      </PageBg>
    );
  }

  if (!selectedProgram) {
    return (
      <PageBg>
        <PageInner>
          <PageMain>
            <h2>Program not found.</h2>
          </PageMain>
        </PageInner>
      </PageBg>
    );
  }

  const programDetailsRows = [
    {
      key: 'program_courses',
      icon: 'clipboard',
      label: 'Courses',
      value: String(programStats?.totalCourses ?? programCourses.length ?? 0),
    },
    {
      key: 'program_duration',
      icon: 'clock',
      label: 'Duration',
      value: `${String(programStats?.totalDurationHours ?? 0)} hours`,
    },
    {
      key: 'program_lectures',
      icon: 'book',
      label: 'Lectures',
      value: String(programStats?.totalLectures ?? 0),
    },
    {
      key: 'program_videos',
      icon: 'play',
      label: 'Video',
      value: String(programStats?.totalVideos ?? 0),
    },
    {
      key: 'program_quizzes',
      icon: 'check',
      label: 'Quizzes',
      value: String(programStats?.totalQuizzes ?? 0),
    },
  ];

  return (
    <>
    <PageBg>
      <PageInner>
        <PageMain>
          <LocalHeader>
            <BackButton
              type="button"
              aria-label="Go back"
              onClick={() => {
                if (window.history.state && window.history.state.idx > 0) {
                  navigate(-1);
                } else {
                  navigate('/courses', { replace: true });
                }
              }}
            >
              <CourseDetailBackArrowSvg />
            </BackButton>
            <Title>{programTitle}</Title>
            {programDescription ? <Subtitle>{programDescription}</Subtitle> : null}
          </LocalHeader>
          <TwoColGrid>
          <AsideColumn aria-label="Course summary sidebar">
            <SidebarCard $variant="muted">
              <CourseDetailsCard rows={programDetailsRows} heading="Program details" />
              {showEnrollNow ? (
                isRejectedEnrollment ? (
                  <>
                    <RejectedNotice>
                      Your enrollment application for this program was{' '}
                      <strong>not approved</strong>.
                    </RejectedNotice>
                    <EnrollNowBtn
                      type="button"
                      onClick={() => setEnrollConfirmOpen(true)}
                      disabled={!selectedProgram?.id}
                    >
                      Enroll again
                    </EnrollNowBtn>
                  </>
                ) : isActiveEnrollment ? (
                  <EnrolledNotice>
                    You already have an enrollment application for this program (
                    <strong>{enrollmentStatusLabel}</strong>).
                  </EnrolledNotice>
                ) : (
                  <EnrollNowBtn
                    type="button"
                    onClick={() => setEnrollConfirmOpen(true)}
                    disabled={!selectedProgram?.id}
                  >
                    Enroll Now
                  </EnrollNowBtn>
                )
              ) : null}
            </SidebarCard>
          </AsideColumn>

          <MainColumn aria-label="Lesson content">
            {programBannerSrc ? (
              <HeroFigure role="presentation">
                <HeroImg src={programBannerSrc} alt="" />
              </HeroFigure>
            ) : (
              <HeroFigure role="presentation">
                <Box sx={programHeroBannerFrameSx}>
                  <Skeleton
                    variant="rectangular"
                    animation="wave"
                    aria-hidden
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      width: 1,
                      height: 1,
                      transform: 'none',
                    }}
                  />
                </Box>
              </HeroFigure>
            )}
            <ProgramCoursesGridWrap>
              <InstructorProfileTabs
                value={selectedFilter}
                tabs={PROGRAM_COURSE_FILTERS}
                onChange={setSelectedFilter}
              />
              <Grid container spacing={{ xs: 2, sm: 2, md: 2.5 }} sx={{ mt: 0.25 }}>
                {visibleProgramCourseCards.map((course) => (
                  <Grid key={course.id} size={{ xs: 12, sm: 6, lg: 6, xl: 6 }}>
                    <InstructorCourseCard course={course} showActions={false} />
                  </Grid>
                ))}
              </Grid>
            </ProgramCoursesGridWrap>
          </MainColumn>
        </TwoColGrid>
        </PageMain>
      </PageInner>
    </PageBg>

    <ConfirmDialog
      open={enrollConfirmOpen}
      onClose={() => setEnrollConfirmOpen(false)}
      title={isRejectedEnrollment ? 'Enroll again' : 'Enroll in program'}
      content={
        <>
          {isRejectedEnrollment ? (
            <>Submit a new enrollment application for </>
          ) : (
            <>Submit an enrollment application for </>
          )}
          <strong>{programTitle}</strong>? You can review approval status after submitting.
        </>
      }
      action={
        <Button variant="contained" color="primary" onClick={handleEnrollConfirm}>
          {isRejectedEnrollment ? 'Confirm re-enrollment' : 'Confirm enrollment'}
        </Button>
      }
    />
    </>
  );
}

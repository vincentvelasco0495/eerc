import styled from 'styled-components';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import Grid from '@mui/material/Grid';

import { useLmsCourses, useLmsQuizzes, useLmsPrograms, useLmsProgramStats, useLmsModulesByCourse } from 'src/hooks/use-lms';

import { CONFIG } from 'src/global-config';
import { InstructorCourseCard } from 'src/features/instructor-profile/components/instructor-course-card';
import { InstructorProfileTabs } from 'src/features/instructor-profile/components/instructor-profile-tabs';
import { mapLmsCatalogCourseToInstructorCard } from 'src/features/instructor-profile/map-lms-catalog-course-to-instructor-card';

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

const ProgramCoursesGridWrap = styled.section`
  margin-top: ${space(2.5)};
`;

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

const resolveBannerSrc = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('/')) return `${CONFIG.serverUrl}${raw}`;
  return `${CONFIG.serverUrl}/storage/${raw}`;
};

export default function ProgramCourseDetail() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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

  const shell = useMemo(
    () =>
      selectedCourse
        ? mapLmsToStyledCourseDetail(selectedCourse, modules ?? [], quizzesForCourse)
        : null,
    [selectedCourse, modules, quizzesForCourse]
  );

  const programTitle = selectedProgram?.title || shell?.data?.title || 'Program';
  const programDescription = selectedProgram?.description || shell?.data?.shortDescription || '';
  const programBannerUrl =
    resolveBannerSrc(selectedProgram?.bannerPath) || shell?.heroImageUrl || '';

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
            </SidebarCard>
          </AsideColumn>

          <MainColumn aria-label="Lesson content">
            {programBannerUrl ? (
              <HeroFigure role="presentation">
                <HeroImg src={programBannerUrl} alt={`${programTitle} banner`} />
              </HeroFigure>
            ) : null}
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
  );
}

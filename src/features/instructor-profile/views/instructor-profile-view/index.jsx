import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useLmsCourses, useLmsAnalytics } from 'src/hooks/use-lms';

import { ServerListPagination } from 'src/components/server-pagination';

import { styles } from './styles';
import { InstructorCourseCard } from '../../components/instructor-course-card';
import { InstructorProfileTabs } from '../../components/instructor-profile-tabs';
import { InstructorWorkspaceShell } from '../../components/instructor-workspace-shell';
import { InstructorProfileToolbar } from '../../components/instructor-profile-toolbar';
import { InstructorProfileStatCard } from '../../components/instructor-profile-stat-card';
import { mapLmsCatalogCourseToInstructorCard } from '../../map-lms-catalog-course-to-instructor-card';
import { instructorCourseFilters, buildInstructorAnalyticsStats } from '../../instructor-profile-data';

const ITEMS_PER_PAGE = 6;

export function InstructorProfileView() {
  const { analytics, isLoading: analyticsLoading } = useLmsAnalytics();
  const [selectedFilter, setSelectedFilter] = useState(instructorCourseFilters[0].value);
  const [page, setPage] = useState(1);

  const {
    courses: apiCourses,
    meta: coursesMeta,
    isLoading,
    error,
    mutate: mutateCourses,
  } = useLmsCourses(page, ITEMS_PER_PAGE, '', selectedFilter);

  const analyticsStats = useMemo(
    () => buildInstructorAnalyticsStats(analytics?.instructorSummary),
    [analytics?.instructorSummary]
  );

  const [localCoursePatches, setLocalCoursePatches] = useState({});

  const courses = useMemo(() => {
    const mapped = apiCourses.map((c) => mapLmsCatalogCourseToInstructorCard(c));
    if (Object.keys(localCoursePatches).length === 0) {
      return mapped;
    }
    return mapped.map((course) => {
      const patch = localCoursePatches[course.id];
      return patch ? { ...course, ...patch } : course;
    });
  }, [apiCourses, localCoursePatches]);

  useEffect(() => {
    setLocalCoursePatches({});
  }, [apiCourses, selectedFilter, page]);

  const handleCourseUpdate = useCallback((courseId, updater) => {
    setLocalCoursePatches((prev) => {
      const fromApi = apiCourses.find((c) => c.id === courseId);
      const base = fromApi ? mapLmsCatalogCourseToInstructorCard(fromApi) : null;
      const current = prev[courseId] ?? base;
      if (!current) {
        return prev;
      }
      const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
      return { ...prev, [courseId]: next };
    });
  }, [apiCourses]);

  const currentPage = coursesMeta?.page ?? page;
  const perPage = coursesMeta?.limit ?? ITEMS_PER_PAGE;
  const lastPage = Math.max(1, coursesMeta?.lastPage ?? 1);
  const totalCourses = coursesMeta?.total ?? 0;
  const rangeFrom = totalCourses === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const rangeTo = totalCourses === 0 ? 0 : Math.min(currentPage * perPage, totalCourses);

  const listLoading = isLoading && courses.length === 0;

  const goToPage = useCallback((nextPage) => {
    setPage(nextPage);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [selectedFilter]);

  useEffect(() => {
    if (coursesMeta?.lastPage && page > coursesMeta.lastPage) {
      setPage(coursesMeta.lastPage);
    }
  }, [page, coursesMeta?.lastPage]);

  return (
    <InstructorWorkspaceShell>
      <Stack spacing={3}>
        <Stack spacing={0.75}>
          <Typography variant="h3" sx={styles.heading}>
            Analytics
          </Typography>
          <Typography variant="body2" sx={styles.subtitle}>
            Track revenue, course growth, student activity, and publishing status from a single
            instructor workspace.
          </Typography>
        </Stack>

        <InstructorProfileToolbar />

        <Grid container spacing={{ xs: 2, sm: 2, md: 2.5 }}>
          {analyticsStats.map((item) => (
            <Grid
              key={item.id}
              size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 4 }}
              sx={styles.statGrid}
            >
              <InstructorProfileStatCard item={item} loading={analyticsLoading} />
            </Grid>
          ))}
        </Grid>

        <InstructorProfileTabs
          value={selectedFilter}
          tabs={instructorCourseFilters}
          onChange={setSelectedFilter}
        />

        {error ? (
          <Alert severity="error">
            {error?.message ?? 'Could not load courses. Check your connection and API configuration.'}
          </Alert>
        ) : null}

        {listLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {courses.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                {totalCourses === 0 && selectedFilter === 'all'
                  ? 'No courses are available yet.'
                  : 'No courses match this filter.'}
              </Typography>
            ) : (
              <Grid container spacing={{ xs: 2, sm: 2, md: 2.5 }}>
                {courses.map((course) => (
                  <Grid key={course.id} size={{ xs: 12, sm: 6, lg: 4 }} sx={styles.courseGrid}>
                    <InstructorCourseCard
                      course={course}
                      onCourseUpdate={handleCourseUpdate}
                      onRemoteCoursesInvalidate={mutateCourses}
                    />
                  </Grid>
                ))}
              </Grid>
            )}

            {totalCourses > 0 ? (
              <ServerListPagination
                page={currentPage}
                lastPage={lastPage}
                total={totalCourses}
                from={rangeFrom}
                to={rangeTo}
                onPageChange={goToPage}
                disabled={isLoading}
              />
            ) : null}
          </>
        )}
      </Stack>
    </InstructorWorkspaceShell>
  );
}

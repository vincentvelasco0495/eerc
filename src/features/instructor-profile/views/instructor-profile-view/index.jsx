import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useLmsCourses } from 'src/hooks/use-lms';

import { styles } from './styles';
import { InstructorCourseCard } from '../../components/instructor-course-card';
import { InstructorProfileTabs } from '../../components/instructor-profile-tabs';
import { InstructorWorkspaceShell } from '../../components/instructor-workspace-shell';
import { InstructorProfileToolbar } from '../../components/instructor-profile-toolbar';
import { InstructorProfileStatCard } from '../../components/instructor-profile-stat-card';
import { mapLmsCatalogCourseToInstructorCard } from '../../map-lms-catalog-course-to-instructor-card';
import {
  instructorCourseFilters,
  instructorAnalyticsStats,
  instructorReportingPeriods,
} from '../../instructor-profile-data';

const ITEMS_PER_PAGE = 6;
const COURSES_PAGE_SIZE = 100;

export function InstructorProfileView() {
  const { courses: apiCourses, isLoading, error } = useLmsCourses(1, COURSES_PAGE_SIZE);

  const mappedFromApi = useMemo(
    () => apiCourses.map((c) => mapLmsCatalogCourseToInstructorCard(c)),
    [apiCourses]
  );

  const [courses, setCourses] = useState([]);

  useEffect(() => {
    setCourses(mappedFromApi.map((course) => ({ ...course })));
  }, [mappedFromApi]);

  const [selectedPeriod, setSelectedPeriod] = useState(instructorReportingPeriods[0]);
  const [selectedFilter, setSelectedFilter] = useState(instructorCourseFilters[0].value);
  const [page, setPage] = useState(1);

  const handleCourseUpdate = useCallback((courseId, updater) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        return typeof updater === 'function' ? updater(c) : { ...c, ...updater };
      })
    );
  }, []);

  const filteredCourses = useMemo(() => {
    if (selectedFilter === 'all') {
      return courses;
    }

    return courses.filter((course) => course.status === selectedFilter);
  }, [courses, selectedFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / ITEMS_PER_PAGE));
  const visibleCourses = filteredCourses.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const listLoading = isLoading && apiCourses.length === 0;

  useEffect(() => {
    setPage(1);
  }, [selectedFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

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

        <InstructorProfileToolbar
          period={selectedPeriod}
          periods={instructorReportingPeriods}
          onPeriodChange={setSelectedPeriod}
        />

        <Grid container spacing={{ xs: 2, sm: 2, md: 2.5 }}>
          {instructorAnalyticsStats.map((item) => (
            <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4, xl: 3 }} sx={styles.statGrid}>
              <InstructorProfileStatCard item={item} />
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
            {filteredCourses.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                {courses.length === 0
                  ? 'No courses are available yet.'
                  : 'No courses match this filter.'}
              </Typography>
            ) : (
              <Grid container spacing={{ xs: 2, sm: 2, md: 2.5 }}>
                {visibleCourses.map((course) => (
                  <Grid key={course.id} size={{ xs: 12, sm: 6, lg: 4 }} sx={styles.courseGrid}>
                    <InstructorCourseCard course={course} onCourseUpdate={handleCourseUpdate} />
                  </Grid>
                ))}
              </Grid>
            )}

            {filteredCourses.length > ITEMS_PER_PAGE ? (
              <Pagination
                page={page}
                count={totalPages}
                shape="rounded"
                color="primary"
                size="small"
                onChange={(_, value) => setPage(value)}
                sx={styles.pagination}
              />
            ) : null}
          </>
        )}
      </Stack>
    </InstructorWorkspaceShell>
  );
}

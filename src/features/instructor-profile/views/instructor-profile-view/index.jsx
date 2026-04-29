import { useMemo, useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';

import { styles } from './styles';
import { InstructorCourseCard } from '../../components/instructor-course-card';
import { InstructorProfileTabs } from '../../components/instructor-profile-tabs';
import { InstructorWorkspaceShell } from '../../components/instructor-workspace-shell';
import { InstructorProfileToolbar } from '../../components/instructor-profile-toolbar';
import { InstructorProfileStatCard } from '../../components/instructor-profile-stat-card';
import {
  instructorCourses,
  instructorCourseFilters,
  instructorAnalyticsStats,
  instructorReportingPeriods,
} from '../../instructor-profile-data';

const ITEMS_PER_PAGE = 6;

export function InstructorProfileView() {
  const [selectedPeriod, setSelectedPeriod] = useState(instructorReportingPeriods[0]);
  const [selectedFilter, setSelectedFilter] = useState(instructorCourseFilters[0].value);
  const [page, setPage] = useState(1);

  const filteredCourses = useMemo(() => {
    if (selectedFilter === 'all') {
      return instructorCourses;
    }

    return instructorCourses.filter((course) => course.status === selectedFilter);
  }, [selectedFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / ITEMS_PER_PAGE));
  const visibleCourses = filteredCourses.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

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

        <Grid container spacing={2}>
          {instructorAnalyticsStats.map((item) => (
            <Grid key={item.id} size={{ xs: 12, sm: 6, xl: 3 }} sx={styles.statGrid}>
              <InstructorProfileStatCard item={item} />
            </Grid>
          ))}
        </Grid>

        <InstructorProfileTabs
          value={selectedFilter}
          tabs={instructorCourseFilters}
          onChange={setSelectedFilter}
        />

        <Grid container spacing={2.5}>
          {visibleCourses.map((course) => (
            <Grid key={course.id} size={{ xs: 12, md: 6, xl: 4 }} sx={styles.courseGrid}>
              <InstructorCourseCard course={course} />
            </Grid>
          ))}
        </Grid>

        <Pagination
          page={page}
          count={totalPages}
          shape="rounded"
          color="primary"
          onChange={(_, value) => setPage(value)}
          sx={styles.pagination}
        />
      </Stack>
    </InstructorWorkspaceShell>
  );
}

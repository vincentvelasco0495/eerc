import { useMemo, useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';

import { useEnrollment, useLmsCourses, useLmsPrograms } from 'src/hooks/use-lms';

import { styles } from '../student-profile-view/styles';
import { buildAvailableProgramCards } from '../../student-profile-data';
import { StudentWorkspaceShell } from '../../components/student-workspace-shell';
import { StudentProfileCourseTabs } from '../../components/student-profile-course-tabs';
import { StudentProfileCourseCard } from '../../components/student-profile-course-card';

const ITEMS_PER_PAGE = 6;

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'failed', label: 'Failed' },
];

export function StudentAvailableProgramsView() {
  const enrollments = useEnrollment();
  const { courses } = useLmsCourses(1, 200);
  const { programs } = useLmsPrograms();

  const [filterValue, setFilterValue] = useState('all');
  const [page, setPage] = useState(1);

  const programItems = useMemo(
    () => buildAvailableProgramCards(programs, courses, enrollments),
    [courses, enrollments, programs]
  );

  const tabCounts = useMemo(
    () => ({
      all: programItems.length,
      completed: programItems.filter((item) => item.status === 'completed').length,
      'in-progress': programItems.filter((item) => item.status === 'in-progress').length,
      failed: programItems.filter((item) => item.status === 'failed').length,
    }),
    [programItems]
  );

  const tabs = useMemo(
    () =>
      FILTER_OPTIONS.map((option) => ({
        ...option,
        count: tabCounts[option.value] ?? 0,
      })),
    [tabCounts]
  );

  const filteredPrograms = useMemo(() => {
    if (filterValue === 'all') {
      return programItems;
    }

    return programItems.filter((item) => item.status === filterValue);
  }, [programItems, filterValue]);

  const totalPages = Math.max(1, Math.ceil(filteredPrograms.length / ITEMS_PER_PAGE));
  const visiblePrograms = filteredPrograms.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [filterValue]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <StudentWorkspaceShell>
      <Stack spacing={3}>
        <StudentProfileCourseTabs
          value={filterValue}
          tabs={tabs}
          onChange={setFilterValue}
          heading="Available programs"
        />

        <Grid container spacing={{ xs: 2, sm: 2, md: 2.5 }}>
          {visiblePrograms.map((program) => (
            <Grid key={program.id} size={{ xs: 12, sm: 6, lg: 4 }} sx={styles.courseGrid}>
              <StudentProfileCourseCard course={program} />
            </Grid>
          ))}
        </Grid>

        {visiblePrograms.length === 0 ? (
          <Stack spacing={0.5} sx={{ py: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No programs are available right now.
            </Typography>
          </Stack>
        ) : null}

        <Pagination
          page={page}
          count={totalPages}
          shape="rounded"
          color="primary"
          size="small"
          onChange={(_, value) => setPage(value)}
          sx={styles.pagination}
        />
      </Stack>
    </StudentWorkspaceShell>
  );
}

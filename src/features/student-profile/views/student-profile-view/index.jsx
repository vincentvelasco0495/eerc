import { useMemo, useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';

import { useLmsCourses, useLmsPrograms } from 'src/hooks/use-lms';

import { styles } from './styles';
import { buildStudentProfileCourses } from '../../student-profile-data';
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

export function StudentProfileView() {
  const courses = useLmsCourses();
  const programs = useLmsPrograms();

  const [filterValue, setFilterValue] = useState('all');
  const [page, setPage] = useState(1);

  const courseItems = useMemo(
    () => buildStudentProfileCourses(courses, programs),
    [courses, programs]
  );

  const tabCounts = useMemo(
    () => ({
      all: courseItems.length,
      completed: courseItems.filter((item) => item.status === 'completed').length,
      'in-progress': courseItems.filter((item) => item.status === 'in-progress').length,
      failed: courseItems.filter((item) => item.status === 'failed').length,
    }),
    [courseItems]
  );

  const tabs = useMemo(
    () =>
      FILTER_OPTIONS.map((option) => ({
        ...option,
        count: tabCounts[option.value] ?? 0,
      })),
    [tabCounts]
  );

  const filteredCourses = useMemo(() => {
    if (filterValue === 'all') {
      return courseItems;
    }

    return courseItems.filter((item) => item.status === filterValue);
  }, [courseItems, filterValue]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / ITEMS_PER_PAGE));
  const visibleCourses = filteredCourses.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

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
        <StudentProfileCourseTabs value={filterValue} tabs={tabs} onChange={setFilterValue} />

        <Grid container spacing={2.5}>
          {visibleCourses.map((course) => (
            <Grid key={course.id} size={{ xs: 12, md: 6, xl: 4 }} sx={styles.courseGrid}>
              <StudentProfileCourseCard course={course} />
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
    </StudentWorkspaceShell>
  );
}

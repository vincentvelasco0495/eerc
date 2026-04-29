import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { InstructorWorkspaceShell } from 'src/features/instructor-profile/components/instructor-workspace-shell';

import { toast } from 'src/components/snackbar';

import { styles } from './styles';
import { InstructorAssignmentsTable } from '../../components/instructor-assignments-table';
import { InstructorAssignmentsToolbar } from '../../components/instructor-assignments-toolbar';
import {
  instructorAssignmentSummaries,
  instructorAssignmentCourseOptions,
  instructorAssignmentStatusOptions,
} from '../../instructor-assignments-data';

function descendingComparator(a, b, orderByKey) {
  if (b[orderByKey] < a[orderByKey]) return -1;
  if (b[orderByKey] > a[orderByKey]) return 1;
  return 0;
}

function getComparator(order, orderByKey) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderByKey)
    : (a, b) => -descendingComparator(a, b, orderByKey);
}

export function InstructorAssignmentsView() {
  const [query, setQuery] = useState('');
  const [course, setCourse] = useState('all');
  const [status, setStatus] = useState('all');
  const [orderBy, setOrderBy] = useState('total');
  const [order, setOrder] = useState('desc');

  const handleRequestSort = useCallback(
    (property) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
    },
    [order, orderBy]
  );

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();

    return instructorAssignmentSummaries.filter((row) => {
      const matchesQuery =
        !q ||
        row.title.toLowerCase().includes(q) ||
        row.course.toLowerCase().includes(q);

      const matchesCourse = course === 'all' || row.courseId === course;

      const matchesStatus =
        status === 'all' ||
        (status === 'pending' && row.pending > 0) ||
        (status === 'issues' && row.nonPassed > 0);

      return matchesQuery && matchesCourse && matchesStatus;
    });
  }, [query, course, status]);

  const sortedRows = useMemo(
    () => [...filteredRows].sort(getComparator(order, orderBy)),
    [filteredRows, order, orderBy]
  );

  const handleViewAssignment = useCallback((row) => {
    toast.info(`Open assignment details (demo): ${row.title}`);
  }, []);

  return (
    <InstructorWorkspaceShell>
      <Stack spacing={3}>
        <InstructorAssignmentsToolbar
          title="Student Assignments"
          query={query}
          course={course}
          status={status}
          courseOptions={instructorAssignmentCourseOptions}
          statusOptions={instructorAssignmentStatusOptions}
          onQueryChange={setQuery}
          onCourseChange={setCourse}
          onStatusChange={setStatus}
        />

        {sortedRows.length ? (
          <InstructorAssignmentsTable
            rows={sortedRows}
            orderBy={orderBy}
            order={order}
            onRequestSort={handleRequestSort}
            onViewAssignment={handleViewAssignment}
          />
        ) : (
          <Box sx={styles.emptyState}>
            <Typography variant="body2" sx={styles.emptyText}>
              No assignments matched your filters. Try another course, status, or search.
            </Typography>
          </Box>
        )}
      </Stack>
    </InstructorWorkspaceShell>
  );
}

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { StudentWorkspaceShell } from 'src/features/student-profile/components/student-workspace-shell';
import { studentAssignments, studentAssignmentStatuses } from 'src/features/student-profile/student-profile-data';

import { styles } from './styles';
import { StudentAssignmentList } from '../../components/student-assignment-list';
import { StudentAssignmentsToolbar } from '../../components/student-assignments-toolbar';

const PAGE_SIZE_OPTIONS = [10, 20, 30];

export function StudentAssignmentsView() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const filteredAssignments = useMemo(
    () =>
      studentAssignments.filter((assignment) => {
        const matchesQuery =
          !query ||
          assignment.title.toLowerCase().includes(query.toLowerCase()) ||
          assignment.course.toLowerCase().includes(query.toLowerCase()) ||
          assignment.teacher.toLowerCase().includes(query.toLowerCase());

        const matchesStatus = status === 'All' || assignment.status === status;

        return matchesQuery && matchesStatus;
      }),
    [query, status]
  );

  const visibleAssignments = filteredAssignments.slice(0, pageSize);

  return (
    <StudentWorkspaceShell>
      <Stack spacing={3.25}>
        <StudentAssignmentsToolbar
          title="Assignments"
          query={query}
          status={status}
          statuses={studentAssignmentStatuses}
          onQueryChange={setQuery}
          onStatusChange={setStatus}
        />

        {visibleAssignments.length ? (
          <StudentAssignmentList assignments={visibleAssignments} />
        ) : (
          <Box sx={styles.emptyState}>
            <Typography variant="body2" sx={styles.emptyText}>
              No assignments matched your current search and status filter.
            </Typography>
          </Box>
        )}

        <Box sx={styles.pageSizeWrap}>
          <TextField
            select
            fullWidth
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option} per page
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Stack>
    </StudentWorkspaceShell>
  );
}

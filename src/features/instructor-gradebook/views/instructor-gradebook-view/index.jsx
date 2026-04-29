import { useMemo, useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { InstructorWorkspaceShell } from 'src/features/instructor-profile/components/instructor-workspace-shell';

import { styles } from './styles';
import { GradebookTable } from '../../components/gradebook-table';
import { GradebookSummaryGrid } from '../../components/gradebook-summary-grid';
import { GradebookCourseSelect } from '../../components/gradebook-course-select';
import { GradebookPaginationBar } from '../../components/gradebook-pagination-bar';
import {
  getGradebookStats,
  getGradebookStudents,
  gradebookCourseOptions,
  gradebookPageSizeOptions,
} from '../../instructor-gradebook-data';

export function InstructorGradebookView() {
  const [courseId, setCourseId] = useState(gradebookCourseOptions[0].id);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(gradebookPageSizeOptions[0]);

  const allStudents = useMemo(() => getGradebookStudents(courseId), [courseId]);
  const stats = useMemo(() => getGradebookStats(courseId), [courseId]);

  const pageCount = Math.max(1, Math.ceil(allStudents.length / pageSize));
  const visibleRows = allStudents.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [courseId, pageSize]);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  return (
    <InstructorWorkspaceShell>
      <Stack spacing={3}>
        <Typography variant="h4" sx={styles.title}>
          The Gradebook
        </Typography>

        <GradebookCourseSelect
          value={courseId}
          onChange={setCourseId}
          options={gradebookCourseOptions}
        />

        <GradebookSummaryGrid stats={stats} />

        <GradebookTable rows={visibleRows} />

        <GradebookPaginationBar
          page={page}
          pageCount={pageCount}
          onPageChange={setPage}
          pageSize={pageSize}
          pageSizeOptions={gradebookPageSizeOptions}
          onPageSizeChange={setPageSize}
        />
      </Stack>
    </InstructorWorkspaceShell>
  );
}

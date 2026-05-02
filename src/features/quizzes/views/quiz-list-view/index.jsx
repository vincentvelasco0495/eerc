import { useMemo, useState } from 'react';

import Stack from '@mui/material/Stack';

import { useLmsCourses, useLmsQuizzes, useLmsQuizResults } from 'src/hooks/use-lms';

import { StudentWorkspaceShell } from 'src/features/student-profile/components/student-workspace-shell';

import { styles } from './styles';
import { buildStudentQuizGroups } from '../../student-enrolled-quiz-data';
import { EnrolledQuizToolbar } from '../../components/enrolled-quiz-toolbar';
import { EnrolledQuizCourseGroup } from '../../components/enrolled-quiz-course-group';

export function QuizListView() {
  const [query, setQuery] = useState('');
  const { courses } = useLmsCourses(1, 200);
  const { quizzes } = useLmsQuizzes();
  const { results } = useLmsQuizResults();

  const groups = useMemo(() => buildStudentQuizGroups(courses, quizzes, results), [courses, quizzes, results]);

  const filteredGroups = useMemo(() => {
    if (!query) {
      return groups;
    }

    const normalizedQuery = query.toLowerCase();

    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.title.toLowerCase().includes(normalizedQuery)),
      }))
      .filter(
        (group) =>
          group.courseTitle.toLowerCase().includes(normalizedQuery) || group.items.length > 0
      );
  }, [groups, query]);

  return (
    <StudentWorkspaceShell>
      <Stack spacing={3} sx={styles.shell}>
        <EnrolledQuizToolbar query={query} onQueryChange={setQuery} />

        <Stack spacing={2.5}>
          {filteredGroups.map((group) => (
            <EnrolledQuizCourseGroup key={group.courseId} group={group} />
          ))}
        </Stack>
      </Stack>
    </StudentWorkspaceShell>
  );
}

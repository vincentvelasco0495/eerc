import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import {
  useLmsCourse,
  useLmsCourses,
  useLmsQuizzes,
  useLmsModulesByCourse,
  useResolvedCourseIdFromLookup,
} from 'src/hooks/use-lms';

import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';

import { CourseDetailLayout } from 'src/components/course-detail/CourseDetailLayout';
import { mapLmsToStyledCourseDetail } from 'src/components/course-detail/map-lms-to-styled-shell';

// ----------------------------------------------------------------------

export function LmsStyledCourseDetailView({ courseLookup }) {
  const courseId = useResolvedCourseIdFromLookup(courseLookup ?? '');
  const course = useLmsCourse(courseId);
  const { courses, isLoading: coursesLoading } = useLmsCourses(1, 500);
  const { modules } = useLmsModulesByCourse(courseId);
  const { quizzes } = useLmsQuizzes();

  const quizzesForCourse = useMemo(
    () => quizzes.filter((q) => q.courseId === courseId),
    [quizzes, courseId]
  );

  const shell = useMemo(() => {
    if (!course) {
      return null;
    }

    return mapLmsToStyledCourseDetail(course, modules, quizzesForCourse);
  }, [course, courses, modules, quizzesForCourse]);

  if (!courseLookup) {
    return (
      <DashboardContent maxWidth={false}>
        <Typography variant="body2">Course not specified.</Typography>
      </DashboardContent>
    );
  }

  if (!courseId && !coursesLoading) {
    return (
      <DashboardContent maxWidth={false}>
        <>
          <title>{`Course not found — ${CONFIG.appName}`}</title>
          <Typography variant="body2">This course is not in the LMS catalog.</Typography>
        </>
      </DashboardContent>
    );
  }

  if ((coursesLoading && !course) || !shell) {
    return (
      <DashboardContent maxWidth={false}>
        <>
          <title>{`Loading… — ${CONFIG.appName}`}</title>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        </>
      </DashboardContent>
    );
  }

  return (
    <>
      <title>{`${shell.data.title} | ${CONFIG.appName}`}</title>

      <CourseDetailLayout
        data={shell.data}
        heroImageUrl={shell.heroImageUrl}
        completion={shell.completion}
        detailRows={shell.detailRows}
        curriculumModules={shell.curriculumModules}
        noticeContent={shell.noticeContent}
        faqItems={shell.faqItems}
        continueHref={shell.continueHref}
        courseLookup={shell.courseLookup}
        wrapMinHeightPage={false}
      />
    </>
  );
}

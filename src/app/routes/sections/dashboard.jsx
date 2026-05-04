import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { AuthGuard } from 'src/auth/guard';

const CourseListPage = lazy(() => import('src/pages/course/list'));
const CourseDetailsPage = lazy(() => import('src/pages/course/details'));
const CourseTextLessonPage = lazy(() => import('src/pages/course/text-lesson'));
const CourseVideoLessonPage = lazy(() => import('src/pages/course/video-lesson'));
const CourseQuizStartPage = lazy(() => import('src/pages/course/quiz-start.jsx'));
const CourseQuizTakePage = lazy(() => import('src/pages/course/quiz'));
const ModuleDetailsPage = lazy(() => import('src/pages/module/details'));
const QuizListPage = lazy(() => import('src/pages/quiz/list'));
const QuizDetailsPage = lazy(() => import('src/pages/quiz/details'));
const QuizHistoryPage = lazy(() => import('src/pages/quiz/history'));
const AnalyticsPage = lazy(() => import('src/pages/analytics'));
const LeaderboardPage = lazy(() => import('src/pages/leaderboard'));
const EnrollmentPage = lazy(() => import('src/pages/dashboard/enrollment'));
const AdminPage = lazy(() => import('src/pages/dashboard/admin'));
const AssignmentsPage = lazy(() => import('src/pages/dashboard/assignments'));
const InstructorProfilePage = lazy(() => import('src/pages/dashboard/instructor-profile'));
const InstructorAnnouncementPage = lazy(() => import('src/pages/dashboard/instructor-announcement'));
const InstructorSettingsPage = lazy(() => import('src/pages/dashboard/instructor-settings'));
const InstructorGradebookPage = lazy(() => import('src/pages/dashboard/instructor-gradebook'));
const InstructorCourseCurriculumPage = lazy(() =>
  import('src/pages/dashboard/instructor-course-curriculum')
);
const InstructorCourseEditPage = lazy(() => import('src/pages/dashboard/instructor-course-edit'));
const InstructorAssignmentsPage = lazy(() => import('src/pages/dashboard/instructor-assignments'));
const SettingsPage = lazy(() => import('src/pages/dashboard/settings'));
const StudentProfilePage = lazy(() => import('src/pages/dashboard/student-profile'));

function SuspenseOutlet() {
  const pathname = usePathname();

  return (
    <Suspense key={pathname} fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}

const dashboardLayout = () => (
  <DashboardLayout>
    <SuspenseOutlet />
  </DashboardLayout>
);

/** Maps old `/dashboard/...` bookmarks to flattened LMS URLs. */
function LegacyDashboardRedirect() {
  const { pathname, search, hash } = useLocation();

  if (pathname === '/dashboard' || pathname === '/dashboard/') {
    return <Navigate to={`${paths.dashboard.root}${search}${hash}`} replace />;
  }

  if (pathname.startsWith('/dashboard/')) {
    const target = pathname.slice('/dashboard'.length) + search + hash;
    return <Navigate to={target} replace />;
  }

  return <Navigate to={paths.dashboard.root} replace />;
}

const dashboardLayoutElement = CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>;

export const dashboardRoutes = [
  {
    element: dashboardLayoutElement,
    children: [
      { path: 'courses', element: <CourseListPage /> },
      { path: 'course-details/:slug/text-lesson/:lessonId', element: <CourseTextLessonPage /> },
      { path: 'courses/:courseId/text-lesson/:lessonId', element: <CourseTextLessonPage /> },
      { path: 'course-details/:slug/video-lesson/:lessonId', element: <CourseVideoLessonPage /> },
      { path: 'courses/:courseId/video-lesson/:lessonId', element: <CourseVideoLessonPage /> },
      { path: 'course-details/:slug/quiz/:quizId/take', element: <CourseQuizTakePage /> },
      { path: 'courses/:courseId/quiz/:quizId/take', element: <CourseQuizTakePage /> },
      { path: 'course-details/:slug/quiz/:quizId', element: <CourseQuizStartPage /> },
      { path: 'courses/:courseId/quiz/:quizId', element: <CourseQuizStartPage /> },
      { path: 'course-details/:slug', element: <CourseDetailsPage /> },
      { path: 'courses/:courseId', element: <CourseDetailsPage /> },
      { path: 'modules/:moduleId', element: <ModuleDetailsPage /> },
      { path: 'quizzes', element: <QuizListPage /> },
      { path: 'quizzes/history', element: <QuizHistoryPage /> },
      { path: 'quizzes/:quizId', element: <QuizDetailsPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'leaderboard', element: <LeaderboardPage /> },
      { path: 'instructor-profile', element: <InstructorProfilePage /> },
      { path: 'instructor-announcement', element: <InstructorAnnouncementPage /> },
      { path: 'instructor-settings', element: <InstructorSettingsPage /> },
      { path: 'instructor-gradebook', element: <InstructorGradebookPage /> },
      { path: 'instructor-course-curriculum', element: <InstructorCourseCurriculumPage /> },
      { path: 'instructor-course/:courseLookup/edit', element: <InstructorCourseEditPage /> },
      { path: 'instructor-assignments', element: <InstructorAssignmentsPage /> },
      { path: 'assignments', element: <AssignmentsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'student-profile', element: <StudentProfilePage /> },
      { path: 'enrollment', element: <EnrollmentPage /> },
      { path: 'admin', element: <AdminPage /> },
      {
        path: 'course',
        element: <Navigate to={paths.dashboard.courses.root} replace />,
      },
      {
        path: 'analytics/legacy',
        element: <Navigate to={paths.dashboard.analyticsHub} replace />,
      },
    ],
  },
  {
    path: 'dashboard',
    children: [
      { index: true, element: <LegacyDashboardRedirect /> },
      { path: '*', element: <LegacyDashboardRedirect /> },
    ],
  },
];
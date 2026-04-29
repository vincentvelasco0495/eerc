import { lazy, Suspense } from 'react';
import { Outlet, Navigate } from 'react-router';

import { usePathname } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { AuthGuard } from 'src/auth/guard';

const DashboardHomePage = lazy(() => import('src/pages/dashboard'));
const CourseListPage = lazy(() => import('src/pages/course/list'));
const CourseDetailsPage = lazy(() => import('src/pages/course/details'));
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

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      { index: true, element: <DashboardHomePage /> },
      { path: 'courses', element: <CourseListPage /> },
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
      { path: 'instructor-assignments', element: <InstructorAssignmentsPage /> },
      { path: 'assignments', element: <AssignmentsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'student-profile', element: <StudentProfilePage /> },
      { path: 'enrollment', element: <EnrollmentPage /> },
      { path: 'admin', element: <AdminPage /> },
      { path: 'course', element: <Navigate to="/dashboard/courses" replace /> },
      { path: 'analytics/legacy', element: <Navigate to="/dashboard/analytics" replace /> },
    ],
  },
];

import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { AuthGuard, PermissionGuard } from 'src/auth/guard';

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
const FeedbackInboxPage = lazy(() => import('src/pages/dashboard/feedback'));
const InstructorSettingsPage = lazy(() => import('src/pages/dashboard/instructor-settings'));
const InstructorGradebookPage = lazy(() => import('src/pages/dashboard/instructor-gradebook'));
const InstructorCourseCurriculumPage = lazy(() =>
  import('src/pages/dashboard/instructor-course-curriculum')
);
const InstructorCourseEditPage = lazy(() => import('src/pages/dashboard/instructor-course-edit'));
const InstructorAssignmentsPage = lazy(() => import('src/pages/dashboard/instructor-assignments'));
const ProgramsPage = lazy(() => import('src/pages/dashboard/programs'));
const InstructorsPage = lazy(() => import('src/pages/dashboard/instructors'));
const StudentsPage = lazy(() => import('src/pages/dashboard/students'));
const SettingsPage = lazy(() => import('src/pages/dashboard/settings'));
const ContentManagementHomepageV2Page = lazy(
  () => import('src/pages/dashboard/content-management/homepage-v2')
);
const ContentManagementAboutUsPage = lazy(
  () => import('src/pages/dashboard/content-management/about-us')
);
const ContentManagementContactUsPage = lazy(
  () => import('src/pages/dashboard/content-management/contact-us')
);
const EnrolledCoursesPage = lazy(() => import('src/pages/dashboard/enrolled-courses/index.jsx'));
const AvailableProgramsPage = lazy(() => import('src/pages/dashboard/available-programs/index.jsx'));

function SuspenseOutlet() {
  const pathname = usePathname();

  return (
    <Suspense key={pathname} fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}

function withPermissionGuard(Page) {
  return function PermissionProtectedPage() {
    return (
      <PermissionGuard>
        <Page />
      </PermissionGuard>
    );
  };
}

const AdminDashboardPage = withPermissionGuard(InstructorProfilePage);
const InstructorHomePage = withPermissionGuard(InstructorProfilePage);
const ProtectedCourseCurriculumPage = withPermissionGuard(InstructorCourseCurriculumPage);
const ProtectedCourseEditPage = withPermissionGuard(InstructorCourseEditPage);


const dashboardLayout = () => (
  <DashboardLayout>
    <SuspenseOutlet />
  </DashboardLayout>
);

/** Maps old `/dashboard/...` bookmarks to flattened LMS URLs (not `/dashboard` itself). */
function LegacyDashboardSubpathRedirect() {
  const { pathname, search, hash } = useLocation();
  const rest = pathname.slice('/dashboard'.length);

  if (!rest || rest === '/') {
    return <Navigate to={paths.dashboard.home} replace />;
  }

  return <Navigate to={`${rest}${search}${hash}`} replace />;
}

/** Preserves query strings (e.g. `?new=1`) when redirecting legacy curriculum URLs. */
function LegacyInstructorCourseCurriculumRedirect() {
  const { pathname, search, hash } = useLocation();
  const target = pathname.replace(/^\/instructor-course-curriculum/, paths.dashboard.courseCurriculum);
  return <Navigate to={`${target}${search}${hash}`} replace />;
}

/** Redirects `/instructor-course/:slug/edit` → `/course-curriculum/:slug/edit`. */
function LegacyInstructorCourseEditRedirect() {
  const { pathname, search, hash } = useLocation();
  const target = pathname.replace(/^\/instructor-course\//, '/course-curriculum/');
  return <Navigate to={`${target}${search}${hash}`} replace />;
}

/** Redirects `/instructor-announcement` → `/announcement` (preserves query string). */
function LegacyInstructorAnnouncementRedirect() {
  const { search, hash } = useLocation();
  return <Navigate to={`${paths.dashboard.announcement}${search}${hash}`} replace />;
}

/** Redirects `/instructor-settings` → `/setting-profile` (preserves query string). */
function LegacyInstructorSettingsRedirect() {
  const { search, hash } = useLocation();
  return <Navigate to={`${paths.dashboard.settingProfile}${search}${hash}`} replace />;
}

/** Redirects `/programs` → `/setting-program` (preserves query string). */
function LegacyProgramsRedirect() {
  const { search, hash } = useLocation();
  return <Navigate to={`${paths.dashboard.settingProgram}${search}${hash}`} replace />;
}

/** Redirects `/instructors` → `/setting-instructor` (preserves query string). */
function LegacyInstructorsRedirect() {
  const { search, hash } = useLocation();
  return <Navigate to={`${paths.dashboard.settingInstructor}${search}${hash}`} replace />;
}

/** Redirects `/students` → `/setting-student` (preserves query string). */
function LegacyStudentsRedirect() {
  const { search, hash } = useLocation();
  return <Navigate to={`${paths.dashboard.settingStudent}${search}${hash}`} replace />;
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
      { path: 'dashboard', element: <AdminDashboardPage /> },
      { path: 'instructor-home', element: <InstructorHomePage /> },
      { path: 'dashboard/*', element: <LegacyDashboardSubpathRedirect /> },
      {
        path: 'instructor-profile',
        element: <Navigate to={paths.dashboard.instructorHome} replace />,
      },
      {
        path: 'instructor-profile/*',
        element: <Navigate to={paths.dashboard.instructorHome} replace />,
      },
      { path: 'announcement', element: <InstructorAnnouncementPage /> },
      { path: 'feedback', element: <FeedbackInboxPage /> },
      { path: 'instructor-announcement', element: <LegacyInstructorAnnouncementRedirect /> },
      { path: 'instructor-announcement/*', element: <LegacyInstructorAnnouncementRedirect /> },
      { path: 'setting-profile', element: <InstructorSettingsPage /> },
      { path: 'instructor-settings', element: <LegacyInstructorSettingsRedirect /> },
      { path: 'instructor-settings/*', element: <LegacyInstructorSettingsRedirect /> },
      { path: 'gradebook', element: <InstructorGradebookPage /> },
      {
        path: 'instructor-gradebook',
        element: <Navigate to={paths.dashboard.gradebook} replace />,
      },
      { path: 'course-curriculum/:courseLookup/edit', element: <ProtectedCourseEditPage /> },
      { path: 'course-curriculum', element: <ProtectedCourseCurriculumPage /> },
      { path: 'instructor-course-curriculum', element: <LegacyInstructorCourseCurriculumRedirect /> },
      { path: 'instructor-course-curriculum/*', element: <LegacyInstructorCourseCurriculumRedirect /> },
      { path: 'instructor-course/:courseLookup/edit', element: <LegacyInstructorCourseEditRedirect /> },
      { path: 'assignment', element: <InstructorAssignmentsPage /> },
      {
        path: 'instructor-assignments',
        element: <Navigate to={paths.dashboard.assignment} replace />,
      },
      { path: 'setting-program', element: <ProgramsPage /> },
      { path: 'programs', element: <LegacyProgramsRedirect /> },
      { path: 'programs/*', element: <LegacyProgramsRedirect /> },
      { path: 'setting-instructor', element: <InstructorsPage /> },
      { path: 'instructors', element: <LegacyInstructorsRedirect /> },
      { path: 'instructors/*', element: <LegacyInstructorsRedirect /> },
      { path: 'setting-student', element: <StudentsPage /> },
      { path: 'students', element: <LegacyStudentsRedirect /> },
      { path: 'students/*', element: <LegacyStudentsRedirect /> },
      { path: 'assignments', element: <AssignmentsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'enrolled-courses', element: <EnrolledCoursesPage /> },
      {
        path: 'student-profile',
        element: <Navigate to={paths.dashboard.enrolledCourses} replace />,
      },
      { path: 'available-programs', element: <AvailableProgramsPage /> },
      { path: 'enrollment', element: <EnrollmentPage /> },
      { path: 'content-management/homepage', element: <ContentManagementHomepageV2Page /> },
      { path: 'content-management/homepage-v2', element: <ContentManagementHomepageV2Page /> },
      { path: 'content-management/about-us', element: <ContentManagementAboutUsPage /> },
      { path: 'content-management/contact-us', element: <ContentManagementContactUsPage /> },
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
];
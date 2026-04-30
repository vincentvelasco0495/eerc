import { kebabCase } from 'es-toolkit';

import { _id, _postTitles } from 'src/_mock/assets';

// ----------------------------------------------------------------------

const MOCK_ID = _id[1];
const MOCK_TITLE = _postTitles[2];

const ROOTS = {
  AUTH: '/auth',
  AUTH_DEMO: '/auth-demo',
};

/** Default authenticated landing (matches previous `/dashboard` index redirect). */
const LMS_HOME = '/student-profile';

/**
 * First URL segment for routes rendered inside `DashboardLayout`.
 * Used to distinguish LMS shell from marketing routes at the same path depth.
 */
const DASHBOARD_LAYOUT_FIRST_SEGMENTS = new Set([
  'courses',
  'modules',
  'quizzes',
  'analytics',
  'leaderboard',
  'instructor-profile',
  'instructor-announcement',
  'instructor-settings',
  'instructor-gradebook',
  'instructor-course-curriculum',
  'instructor-assignments',
  'assignments',
  'settings',
  'student-profile',
  'enrollment',
  'admin',
]);

export function isDashboardLayoutPath(pathname) {
  const seg = pathname?.split('/').filter(Boolean)[0];
  return !!seg && DASHBOARD_LAYOUT_FIRST_SEGMENTS.has(seg);
}

// ----------------------------------------------------------------------

export const paths = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  pricing: '/pricing',
  payment: '/payment',
  about: '/about-us',
  contact: '/contact-us',
  faqs: '/faqs',
  /** Styled-components learner course-detail reference (`src/pages/course-detail/CourseDetail.jsx`). */
  courseDetailDemo: '/course-detail',
  page403: '/error/403',
  page404: '/error/404',
  page500: '/error/500',
  components: '/components',
  docs: 'https://docs.minimals.cc/',
  changelog: 'https://docs.minimals.cc/changelog/',
  zoneStore: 'https://mui.com/store/items/zone-landing-page/',
  minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
  freeUI: 'https://mui.com/store/items/minimal-dashboard-free/',
  figmaUrl: 'https://www.figma.com/design/WadcoP3CSejUDj7YZc87xj/%5BPreview%5D-Minimal-Web.v7.3.0',
  product: {
    root: `/product`,
    checkout: `/product/checkout`,
    details: (id) => `/product/${id}`,
    demo: { details: `/product/${MOCK_ID}` },
  },
  post: {
    root: `/post`,
    details: (title) => `/post/${kebabCase(title)}`,
    demo: { details: `/post/${kebabCase(MOCK_TITLE)}` },
  },
  // AUTH
  auth: {
    amplify: {
      signIn: `${ROOTS.AUTH}/amplify/sign-in`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      signUp: `${ROOTS.AUTH}/amplify/sign-up`,
      updatePassword: `${ROOTS.AUTH}/amplify/update-password`,
      resetPassword: `${ROOTS.AUTH}/amplify/reset-password`,
    },
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
    },
    firebase: {
      signIn: `${ROOTS.AUTH}/firebase/sign-in`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      signUp: `${ROOTS.AUTH}/firebase/sign-up`,
      resetPassword: `${ROOTS.AUTH}/firebase/reset-password`,
    },
    auth0: { signIn: `${ROOTS.AUTH}/auth0/sign-in` },
    supabase: {
      signIn: `${ROOTS.AUTH}/supabase/sign-in`,
      verify: `${ROOTS.AUTH}/supabase/verify`,
      signUp: `${ROOTS.AUTH}/supabase/sign-up`,
      updatePassword: `${ROOTS.AUTH}/supabase/update-password`,
      resetPassword: `${ROOTS.AUTH}/supabase/reset-password`,
    },
  },
  authDemo: {
    split: {
      signIn: `${ROOTS.AUTH_DEMO}/split/sign-in`,
      signUp: `${ROOTS.AUTH_DEMO}/split/sign-up`,
      resetPassword: `${ROOTS.AUTH_DEMO}/split/reset-password`,
      updatePassword: `${ROOTS.AUTH_DEMO}/split/update-password`,
      verify: `${ROOTS.AUTH_DEMO}/split/verify`,
    },
    centered: {
      signIn: `${ROOTS.AUTH_DEMO}/centered/sign-in`,
      signUp: `${ROOTS.AUTH_DEMO}/centered/sign-up`,
      resetPassword: `${ROOTS.AUTH_DEMO}/centered/reset-password`,
      updatePassword: `${ROOTS.AUTH_DEMO}/centered/update-password`,
      verify: `${ROOTS.AUTH_DEMO}/centered/verify`,
    },
  },
  // DASHBOARD (LMS routes — no `/dashboard` prefix)
  dashboard: {
    root: LMS_HOME,
    overview: LMS_HOME,
    courses: {
      root: `/courses`,
      details: (courseId) => `/courses/${courseId}`,
    },
    modules: {
      details: (moduleId) => `/modules/${moduleId}`,
    },
    quizzes: {
      root: `/quizzes`,
      details: (quizId) => `/quizzes/${quizId}`,
      history: `/quizzes/history`,
    },
    instructorProfile: `/instructor-profile`,
    instructorSettings: `/instructor-settings`,
    instructorGradebook: `/instructor-gradebook`,
    instructorAnnouncement: `/instructor-announcement`,
    instructorCourseCurriculum: `/instructor-course-curriculum`,
    instructorAssignments: `/instructor-assignments`,
    studentAssignments: `/assignments`,
    studentProfile: `/student-profile`,
    studentSettings: `/settings`,
    analyticsHub: `/analytics`,
    leaderboard: `/leaderboard`,
    enrollment: `/enrollment`,
    admin: `/admin`,
    mail: `/mail`,
    chat: `/chat`,
    blank: `/blank`,
    kanban: `/kanban`,
    calendar: `/calendar`,
    fileManager: `/file-manager`,
    permission: `/permission`,
    general: {
      app: `/app`,
      ecommerce: `/ecommerce`,
      analytics: `/analytics`,
      banking: `/banking`,
      booking: `/booking`,
      file: `/file`,
      course: `/course`,
    },
    user: {
      root: `/user`,
      new: `/user/new`,
      list: `/user/list`,
      cards: `/user/cards`,
      profile: `/user/profile`,
      account: `/user/account`,
      edit: (id) => `/user/${id}/edit`,
      demo: { edit: `/user/${MOCK_ID}/edit` },
    },
    product: {
      root: `/product`,
      new: `/product/new`,
      details: (id) => `/product/${id}`,
      edit: (id) => `/product/${id}/edit`,
      demo: {
        details: `/product/${MOCK_ID}`,
        edit: `/product/${MOCK_ID}/edit`,
      },
    },
    invoice: {
      root: `/invoice`,
      new: `/invoice/new`,
      details: (id) => `/invoice/${id}`,
      edit: (id) => `/invoice/${id}/edit`,
      demo: {
        details: `/invoice/${MOCK_ID}`,
        edit: `/invoice/${MOCK_ID}/edit`,
      },
    },
    post: {
      root: `/post`,
      new: `/post/new`,
      details: (title) => `/post/${kebabCase(title)}`,
      edit: (title) => `/post/${kebabCase(title)}/edit`,
      demo: {
        details: `/post/${kebabCase(MOCK_TITLE)}`,
        edit: `/post/${kebabCase(MOCK_TITLE)}/edit`,
      },
    },
    order: {
      root: `/order`,
      details: (id) => `/order/${id}`,
      demo: { details: `/order/${MOCK_ID}` },
    },
    job: {
      root: `/job`,
      new: `/job/new`,
      details: (id) => `/job/${id}`,
      edit: (id) => `/job/${id}/edit`,
      demo: {
        details: `/job/${MOCK_ID}`,
        edit: `/job/${MOCK_ID}/edit`,
      },
    },
    tour: {
      root: `/tour`,
      new: `/tour/new`,
      details: (id) => `/tour/${id}`,
      edit: (id) => `/tour/${id}/edit`,
      demo: {
        details: `/tour/${MOCK_ID}`,
        edit: `/tour/${MOCK_ID}/edit`,
      },
    },
  },
};

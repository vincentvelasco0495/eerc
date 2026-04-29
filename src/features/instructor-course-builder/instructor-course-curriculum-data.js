/** Mock course + modules for the curriculum builder (UI prototype). */

export const curriculumBuilderCourse = {
  title: 'How to Design Components Right',
};

export const curriculumCourseTabs = [
  { value: 'curriculum', label: 'Curriculum' },
  { value: 'drip', label: 'Drip' },
  { value: 'settings', label: 'Settings' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'faq', label: 'FAQ' },
  { value: 'notice', label: 'Notice' },
];

/** Icon + color per lesson type (curriculum list rows). */
export const curriculumLessonTypeVisual = {
  document: {
    shape: 'rounded',
    bg: '#43a047',
    icon: 'solar:document-text-bold',
    iconW: 15,
  },
  video: {
    shape: 'circle',
    bg: '#f97316',
    icon: 'mdi:play',
    iconW: 14,
  },
  quiz: {
    shape: 'circle',
    bg: '#f97316',
    icon: 'mingcute:question-fill',
    iconW: 15,
  },
  live: {
    shape: 'rounded',
    bg: '#9333ea',
    icon: 'solar:radio-bold',
    iconW: 16,
  },
  stream: {
    shape: 'rounded',
    bg: '#0284c7',
    icon: 'solar:monitor-bold',
    iconW: 16,
  },
  zoom: {
    shape: 'circle',
    bg: '#2563eb',
    icon: 'solar:videocamera-record-bold',
    iconW: 15,
  },
  assignment: {
    shape: 'rounded',
    bg: '#475569',
    icon: 'solar:bill-list-bold-duotone',
    iconW: 15,
  },
};

/** Groups + options for the “Select lesson type” modal (Add lesson). */
export const curriculumLessonTypePickerGroups = [
  {
    id: 'learning',
    label: 'Learning content',
    options: [
      { type: 'document', label: 'Text lesson', icon: 'solar:file-text-bold' },
      { type: 'video', label: 'Video lesson', icon: 'solar:video-frame-play-horizontal-bold' },
      { type: 'stream', label: 'Stream lesson', icon: 'solar:monitor-bold' },
      { type: 'zoom', label: 'Zoom lesson', icon: 'solar:videocamera-record-bold' },
    ],
  },
  {
    id: 'exam',
    label: 'Exam students',
    options: [
      { type: 'quiz', label: 'Quiz', icon: 'solar:file-check-bold-duotone' },
      { type: 'assignment', label: 'Assignment', icon: 'solar:bill-list-bold-duotone' },
    ],
  },
];

/** Default row title when a lesson of this type is added (demo). */
export const curriculumNewLessonTitleByType = {
  document: 'New text lesson',
  video: 'New video lesson',
  stream: 'New stream lesson',
  zoom: 'New Zoom lesson',
  quiz: 'New quiz',
  assignment: 'New assignment',
};

/** Lesson types: document (green tile), video/quiz (orange circle), live (purple tile). */
export const curriculumBuilderModules = [
  {
    id: 'module-starting',
    title: 'Starting Course',
    lessons: [
      { id: 'lesson-layout', title: 'Layout is King', type: 'document' },
      { id: 'lesson-type', title: 'How to Use Typography B...', type: 'video' },
      { id: 'lesson-mid-quiz', title: 'Middle Quiz', type: 'quiz' },
    ],
  },
  {
    id: 'module-after-intro',
    title: 'After Intro',
    lessons: [
      { id: 'lesson-color', title: 'The Art of Color', type: 'video' },
      { id: 'lesson-photos', title: 'How to Use Photos to Cre...', type: 'live' },
      { id: 'lesson-final', title: 'Final quiz', type: 'quiz' },
    ],
  },
];

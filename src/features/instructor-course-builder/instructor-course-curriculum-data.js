/** Mock course + modules for the curriculum builder (UI prototype). */

export const curriculumBuilderCourse = {
  title: 'How to Design Components Right',
  /** Prefix shown above the editable slug in Course → Settings. */
  baseUrlSlugPrefix: 'https://lms.example.com/courses',
  defaultSlug: 'how-to-design-components-right',
  defaultLevel: 'advanced',
};


/** Featured image for Course settings prototype (rights via Unsplash License). */
export const curriculumCourseCoverImageUrl =
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=85&w=1680&auto=format&fit=crop';

/** Initial rich-text blobs for Course → Settings tabs (editable in builder). */
export const courseMainDescriptionSeedHtml = `<p>Use this canvas to summarize what students will accomplish. Cover outcomes, prerequisites, tooling, and how feedback works between design and engineering. Clear description copy reduces support churn and aligns expectations.</p><p>For larger teams, add your design system links, versioning policy, and how you review merges before production rollout.</p>`;

export const courseWhatYouLearnSeedHtml = `<ul><li>Set up repeatable component inventories and naming conventions</li><li>Document props, states, and accessibility expectations</li><li>Align handoff checkpoints with QA and frontend delivery</li><li>Use critique cadences that unblock decisions fast</li></ul>`;

export const coursePreviewDescriptionSeedText = `This short preview surfaces in catalogs and teaser emails. Mention how long the cohort runs and what prerequisites apply.`;

/** Course → Notice tab: editable announcement / policy copy (TinyMCE-style editor shell). */
export const courseNoticeSeedHtml = `<h3>Productivity Hacks to Get More Done</h3><ol><li><strong>Facebook News Feed Eradicator</strong> — Cut feed noise without losing messenger access so you reclaim focus blocks.</li><li><strong>Hide My Inbox</strong> — Defer inbound mail until designated review windows instead of reacting all day.</li><li><strong>Habitica</strong> — Turn habits and todos into quests with streaks teammates can see.</li></ol>`;
export const curriculumCourseTabs = [
  { value: 'curriculum', label: 'Curriculum' },
  { value: 'settings', label: 'Settings' },
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

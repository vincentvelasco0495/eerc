/** Static mock data for the course detail reference page (no API). */

export const courseDetailMock = {
  category: 'Environmental Sciences',
  title: 'How to Design Components Right',
  instructor: {
    name: 'Demo Instructor',
    avatarUrl: 'https://i.pravatar.cc/120?img=12',
  },
  /** Stars use `value` (0–5). Score label + review line match reference layout next to stars. */
  rating: {
    value: 4,
    max: 5,
    scoreLabel: '3',
    reviewLine: '1 review',
    summary: '3 (1 review)',
  },
  shortDescription: `Effective component design aligns layout, typography, and affordances so learners can scan instructional content faster. Start with grids, constrain density, then stress-test breakpoints before handoff.`,
  heroImageUrl:
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=85&w=1680&auto=format&fit=crop',

  completion: {
    label: 'Course complete',
    scorePercent: 100,
    primaryCta: 'CONTINUE',
  },

  details: [
    { key: 'duration', label: 'Duration', value: '9 hours', icon: 'clock' },
    { key: 'lectures', label: 'Lectures', value: '4', icon: 'book' },
    { key: 'video', label: 'Video', value: '5 hours', icon: 'play' },
    { key: 'quizzes', label: 'Quizzes', value: '2', icon: 'check' },
    { key: 'level', label: 'Level', value: 'Advanced', icon: 'level' },
  ],

  paragraphs: [
    `UX-heavy pages fail when fundamentals slip: grids drift, typography loses contrast, and call-to-actions compete with primary learning tasks. Strong component thinking keeps surfaces calm so instructions, media, and navigation stay legible.`,
    `This sprint walks modular regions, responsive breakpoints, critique loops, and handoff checkpoints so instructional UI ships with fewer surprises.`,
  ],

  learningOutcomes: [
    'Build responsive shells that degrade predictably on small screens.',
    'Pair typography scale with instructional density.',
    'Name components and states consistently for engineering handoffs.',
    'Run critiques that unblock implementation decisions quickly.',
    'Tune catalog-ready cards with thumbnails, badges, and price clarity.',
  ],

  audience: [
    'Product designers shaping LMS or academy experiences.',
    'Frontend engineers iterating on curriculum shells.',
    'Instructional designers who own layout fidelity with dev teams.',
    'Organizations standardizing dashboards and enrollment flows.',
  ],
};

/**
 * Curriculum tab — collapsible modules + typed lesson rows (static demo).
 *
 * lesson.type: document | video | quiz | stream
 */
export const curriculumModulesMock = [
  {
    id: 'module-start',
    title: 'Starting Course',
    defaultOpen: true,
    lessons: [
      {
        id: 'les-lk',
        order: 1,
        type: 'document',
        title: 'Layout is King',
        meta: '6 min',
        expandable: true,
      },
      {
        id: 'les-typo',
        order: 2,
        type: 'document',
        title: 'Typography',
        meta: '5 min',
        expandable: true,
      },
      {
        id: 'les-responsive',
        order: 3,
        type: 'document',
        title: 'Responsive Design',
        meta: '8 min',
        expandable: true,
      },
      {
        id: 'les-grids',
        order: 4,
        type: 'document',
        title: 'Grids and Spacing',
        meta: '7 min',
        expandable: true,
      },
      {
        id: 'les-media',
        order: 5,
        type: 'document',
        title: 'Media & Embeds',
        meta: '6 min',
        expandable: true,
      },
      {
        id: 'les-nav',
        order: 6,
        type: 'document',
        title: 'Navigation Patterns',
        meta: '9 min',
        expandable: true,
      },
      {
        id: 'les-quiz-intro',
        order: 7,
        type: 'quiz',
        title: 'After Intro Quiz',
        meta: '7 questions',
        expandable: false,
      },
      {
        id: 'les-stream',
        order: 8,
        type: 'stream',
        title: 'Stream lesson',
        meta: 'Stream lesson',
        expandable: false,
      },
      {
        id: 'les-video',
        order: 9,
        type: 'video',
        title: 'Video lesson',
        meta: '12 min',
        expandable: true,
      },
    ],
  },
  {
    id: 'module-after',
    title: 'After Intro',
    defaultOpen: true,
    lessons: [
      {
        id: 'les-tokens',
        order: 1,
        type: 'document',
        title: 'Design tokens deep dive',
        meta: '10 min',
        expandable: true,
      },
      {
        id: 'les-walk',
        order: 2,
        type: 'video',
        title: 'Walkthrough recordings',
        meta: '15 min',
        expandable: true,
      },
      {
        id: 'les-check',
        order: 3,
        type: 'quiz',
        title: 'Module check-in',
        meta: '5 questions',
        expandable: false,
      },
    ],
  },
];

/** Horizontal list in sidebar — badges per reference (HOT, SPECIAL, NEW). */
export const popularCoursesMock = [
  {
    id: '1',
    title: 'Responsive Layout Systems',
    badge: 'HOT',
    badgeTone: 'hot',
    imageUrl:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=85&w=400&auto=format&fit=crop',
    priceLabel: 'Free',
    instructor: 'Alex Rivera',
    rating: 4.5,
  },
  {
    id: '2',
    title: 'Typography for Interfaces',
    badge: 'SPECIAL',
    badgeTone: 'special',
    imageUrl:
      'https://images.unsplash.com/photo-1573164713714-d95e436abf75?q=85&w=400&auto=format&fit=crop',
    priceLabel: '$29.99',
    priceStrike: '$49.99',
    instructor: 'Mina Santos',
    rating: 4.8,
  },
  {
    id: '3',
    title: 'Accessibility Foundations',
    badge: 'NEW',
    badgeTone: 'new',
    imageUrl:
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=85&w=400&auto=format&fit=crop',
    priceLabel: 'Free',
    instructor: 'Jamie Chen',
    rating: 4.2,
  },
];

/** Related strip — 3-column grid; mix of free and sale. */
export const relatedCoursesMock = [
  {
    id: 'r1',
    title: 'Design Systems in Practice',
    badge: 'SPECIAL',
    badgeTone: 'special',
    imageUrl:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=85&w=600&auto=format&fit=crop',
    priceLabel: '$29.99',
    priceStrike: '$49.99',
    instructor: 'Demo Instructor',
    rating: 4.9,
  },
  {
    id: 'r2',
    title: 'Critique Workshops',
    badge: 'HOT',
    badgeTone: 'hot',
    imageUrl:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=85&w=600&auto=format&fit=crop',
    priceLabel: 'Free',
    instructor: 'Demo Instructor',
    rating: 4.4,
  },
  {
    id: 'r3',
    title: 'Interface Prototyping',
    badge: 'HOT',
    badgeTone: 'hot',
    imageUrl:
      'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=85&w=600&auto=format&fit=crop',
    priceLabel: 'Free',
    instructor: 'Demo Instructor',
    rating: 4.7,
  },
];

/** Notice tab — productivity list + related strip uses `noticeRelatedCoursesMock`. */
export const noticeContentMock = {
  heading: 'Productivity Hacks to Get More Done',
  items: [
    {
      id: 'notice-fb',
      titleBold: 'Facebook News Feed Eradicator',
      linkLabel: 'free chrome extension',
      href: '#',
      body: ' Stay focused by removing your Facebook newsfeed and replacing it with an inspirational quote. Disable the tool anytime you want to see what friends are up to!',
    },
    {
      id: 'notice-inbox',
      titleBold: 'Hide My Inbox',
      linkLabel: 'free chrome extension for Gmail',
      href: '#',
      body: " Stay focused by hiding your inbox. Click 'show your inbox' at a scheduled time and batch processs everything one go.",
    },
    {
      id: 'notice-habitica',
      titleBold: 'Habitica',
      linkLabel: 'free mobile + web app',
      href: '#',
      body: ' Gamify your to do list. Treat your life like a game and earn gold goins for getting stuff done!',
    },
  ],
};

/** Related courses row shown under Notice tab (badges / prices per reference). */
export const noticeRelatedCoursesMock = [
  {
    id: 'nr1',
    title: 'Design Systems in Practice',
    badge: 'SPECIAL',
    badgeTone: 'special',
    imageUrl:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=85&w=600&auto=format&fit=crop',
    priceLabel: 'Free',
    instructor: 'Demo Instructor',
    rating: 4,
  },
  {
    id: 'nr2',
    title: 'Critique Workshops',
    badge: 'HOT',
    badgeTone: 'hot',
    imageUrl:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=85&w=600&auto=format&fit=crop',
    priceLabel: 'Free',
    instructor: 'Demo Instructor',
    rating: 5,
  },
  {
    id: 'nr3',
    title: 'Interface Prototyping',
    badge: 'SPECIAL',
    badgeTone: 'special',
    imageUrl:
      'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=85&w=600&auto=format&fit=crop',
    priceLabel: '$29.99',
    priceStrike: '$49.99',
    instructor: 'Demo Instructor',
    rating: 4,
  },
];

export const faqItemsMock = [
  {
    id: 'faq-lorem',
    question: 'What is Lorem Ipsum?',
    answer: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`,
    defaultExpanded: true,
  },
  {
    id: 'faq-why',
    question: 'Why do we use it?',
    answer: `It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using meaningful content that would draw attention away from the structure of the page.`,
    defaultExpanded: false,
  },
];

export const tabKeys = ['description', 'curriculum', 'faq', 'notice', 'reviews'];

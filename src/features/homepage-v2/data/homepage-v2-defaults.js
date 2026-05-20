/** Offline / loading fallback — mirrors backend `homepage_v2_defaults.php`. */
export const HOMEPAGE_V2_DEFAULTS = {
  sections: {
    hero: {
      visible: true,
      label: 'Professional learning platform',
      headline: 'High quality learning at your own pace',
      description:
        'Build confidence with guided modules, secure lesson delivery, practice quizzes, and progress analytics — all in one polished workspace designed for serious learners.',
      primaryButton: { text: 'Get Started', link: '/enrolled-courses' },
      secondaryButton: { text: 'Learn More', link: '/courses' },
      images: [
        { key: 'lecture', label: 'Lecture Preview', alt: 'Lecture preview', url: null, mediaId: null },
        { key: 'instructor', label: 'Instructor Preview', alt: 'Instructor preview', url: null, mediaId: null },
        { key: 'testimonial', label: 'Student Testimonial', alt: 'Student testimonial', url: null, mediaId: null },
      ],
    },
    feature_cards: {
      visible: true,
      eyebrow: 'Why learners choose us',
      cards: [
        {
          id: 'fc-1',
          icon: 'solar:clock-circle-bold-duotone',
          title: 'Study at your own pace',
          description:
            'Learn on your schedule with structured modules you can pause, replay, and revisit anytime.',
        },
        {
          id: 'fc-2',
          icon: 'solar:play-circle-bold-duotone',
          title: '120+ lessons',
          description:
            'Access a growing library of replayable lessons covering core topics and exam-ready skills.',
        },
        {
          id: 'fc-3',
          icon: 'solar:users-group-rounded-bold-duotone',
          title: 'Expert instructors',
          description:
            'Learn from experienced educators who break down complex concepts into clear, practical steps.',
        },
        {
          id: 'fc-4',
          icon: 'solar:chart-2-bold-duotone',
          title: 'Strong success rate',
          description:
            'Track outcomes with analytics, quizzes, and progress tools designed to keep learners on pace.',
        },
        {
          id: 'fc-5',
          icon: 'solar:wallet-money-bold-duotone',
          title: 'Flexible pricing',
          description:
            'Choose programs and enrollment options that fit your goals without unnecessary overhead.',
        },
      ],
    },
    instructors: {
      visible: true,
      label: 'Instructor team',
      title: 'Learn from our elite lineup',
      description:
        'Work with educators who combine board-level expertise, clear teaching, and real-world problem solving — so every lesson moves you closer to your goals.',
      button: { text: 'Get Started', link: '/enrolled-courses' },
      images: [
        { id: 'ins-1', label: 'Instructor 1', alt: 'Instructor 1', url: null, mediaId: null },
        { id: 'ins-2', label: 'Instructor 2', alt: 'Instructor 2', url: null, mediaId: null },
        { id: 'ins-3', label: 'Instructor 3', alt: 'Instructor 3', url: null, mediaId: null },
        { id: 'ins-4', label: 'Instructor 4', alt: 'Instructor 4', url: null, mediaId: null },
        { id: 'ins-5', label: 'Instructor 5', alt: 'Instructor 5', url: null, mediaId: null },
        { id: 'ins-6', label: 'Instructor 6', alt: 'Instructor 6', url: null, mediaId: null },
      ],
    },
    stats: {
      visible: true,
      eyebrow: '2025 outcomes snapshot',
      title: 'Results that speak louder than promises',
      year: '2025',
      primaryValue: '73.9%',
      primaryLabel: 'Program completion rate',
      secondaryValue: '34.8%',
      secondaryLabel: 'Industry benchmark',
      watermarkText: 'ACHIEVER',
      items: [],
    },
    success_stories: {
      visible: true,
      label: 'Success stories',
      title: 'The next top achiever could be you',
      description:
        'Join learners who turned consistent study habits into standout results — with proof you can see and celebrate.',
      groupImage: {
        label: 'Top Achievers Group Photo',
        alt: 'Top achievers group',
        url: null,
        mediaId: null,
      },
      badges: [
        { id: 'b-1', label: 'TOP 1', detail: '94.2%', position: { top: '8%', left: '4%' } },
        { id: 'b-2', label: 'TOP 3', detail: '91.8%', position: { top: '12%', right: '6%' } },
        { id: 'b-3', label: '92%', detail: 'Average', position: { bottom: '18%', left: '8%' } },
        { id: 'b-4', label: 'TOP 4', detail: '90.5%', position: { bottom: '10%', right: '4%' } },
      ],
    },
    how_it_works: {
      visible: true,
      eyebrow: 'How it works',
      title: 'Our proven three-step process',
      steps: [
        {
          id: 'step-1',
          number: '1',
          title: 'Review',
          description:
            'Review at your own pace. Watch high-quality lessons covering the full curriculum with clear explanations and examples.',
          imageFirst: false,
          image: { label: 'Step 1 Preview', alt: 'Step 1', url: null, mediaId: null },
        },
        {
          id: 'step-2',
          number: '2',
          title: 'Refresher',
          description:
            'Reinforce weak areas with focused refreshers, practice drills, and summaries that help concepts stick before exam day.',
          imageFirst: true,
          image: { label: 'Step 2 Preview', alt: 'Step 2', url: null, mediaId: null },
        },
        {
          id: 'step-3',
          number: '3',
          title: 'Final Coaching',
          description:
            'Join live coaching sessions, mock drills, and last-mile guidance so you walk into the exam with confidence.',
          imageFirst: false,
          image: { label: 'Step 3 Preview', alt: 'Step 3', url: null, mediaId: null },
        },
      ],
    },
    featured_content: {
      visible: true,
      eyebrow: 'Featured content',
      title: 'Experience the learning quality',
      description:
        'Preview the lesson experience — crisp delivery, structured pacing, and content that keeps learners engaged from start to finish.',
      items: [
        {
          id: 'fv-1',
          title: 'Video 1',
          description: '',
          videoUrl: '',
          thumbnail: { label: 'Video 1', alt: 'Video 1', url: null, mediaId: null },
        },
        {
          id: 'fv-2',
          title: 'Video 2',
          description: '',
          videoUrl: '',
          thumbnail: { label: 'Video 2', alt: 'Video 2', url: null, mediaId: null },
        },
        {
          id: 'fv-3',
          title: 'Video 3',
          description: '',
          videoUrl: '',
          thumbnail: { label: 'Video 3', alt: 'Video 3', url: null, mediaId: null },
        },
        {
          id: 'fv-4',
          title: 'Video 4',
          description: '',
          videoUrl: '',
          thumbnail: { label: 'Video 4', alt: 'Video 4', url: null, mediaId: null },
        },
        {
          id: 'fv-5',
          title: 'Video 5',
          description: '',
          videoUrl: '',
          thumbnail: { label: 'Video 5', alt: 'Video 5', url: null, mediaId: null },
        },
      ],
    },
  },
  meta: { updatedAt: null },
};

// ----------------------------------------------------------------------

/** Rich marketing/program copy keyed by seeded LMS `Course.public_id` values. */
export const COURSE_PAGE_COPY = {
  'course-ce-review': {
    category: 'Civil Engineering',
    description:
      'A comprehensive Civil Engineering review course focused on hydraulics, structures, and environmental systems. It helps learners organize technical concepts, practice board-style problems, and build confidence for licensure preparation.',
    body: [
      'This structured review track is designed for engineering learners who need a cleaner way to study major subjects, revisit difficult formulas, and move through guided modules in a logical sequence. Lessons combine recorded walkthroughs, technical references, and review checkpoints in one course experience.',
      'Each module is arranged to support both theory and application. Learners can move from concept refreshers into practice drills, follow instructor guidance, and prepare for mock-board style assessments without losing context between topics.',
    ],
    learn: [
      'Strengthen hydraulics, structures, and environmental engineering fundamentals.',
      'Practice board-style computations through guided module drills.',
      'Review formulas, references, and technical problem-solving workflows in one place.',
      'Build a repeatable study path for coaching sessions and exam preparation.',
    ],
    audience: [
      'Civil Engineering graduates preparing for professional licensure exams.',
      'Review-center learners who need structured technical modules and practice sessions.',
      'Working professionals refreshing core concepts before certification or promotion.',
    ],
    faqs: [
      {
        question: 'Is this course suitable for first-time board review learners?',
        answer:
          'Yes. The course starts with concept refreshers, then gradually builds into guided drills and structured practice sessions.',
      },
      {
        question: 'Does the course include downloadable references?',
        answer:
          'Yes. Modules can include PDFs, e-books, and reference materials alongside the main lesson flow.',
      },
      {
        question: 'Can this be used by review centers for group cohorts?',
        answer:
          'Yes. The layout supports individual study as well as organized cohort delivery with instructor oversight.',
      },
    ],
    notices: [
      'Streaming is enabled for core lecture content to keep review materials secure.',
      'Progress is tracked per module so instructors can quickly identify weak areas.',
      'Mock-board coaching sessions can be layered on top of this core review sequence.',
    ],
    reviews: [
      {
        author: 'Mark Dela Cruz',
        role: 'Civil Engineering examinee',
        rating: 5,
        content:
          'The hydraulics and structures modules are very clear. It feels like a focused review center workflow instead of scattered files and chats.',
      },
      {
        author: 'Angela Ramos',
        role: 'Review program coordinator',
        rating: 4.5,
        content:
          'The guided module flow and technical references make it much easier to support our learners and track what they need next.',
      },
    ],
  },
  'course-plumbing-mastery': {
    category: 'Master Plumbing',
    badge: 'HOT',
    description:
      'An exam-focused Master Plumbing course that covers code interpretation, pipe sizing, sanitary systems, and practical troubleshooting for faster review progress.',
    body: [
      'This course is built for plumbing licensure preparation with a practical balance of technical explanation, code review, and solution walkthroughs. Lessons are organized to help learners move from system concepts into field-relevant applications.',
      'Review-center teams can use it to deliver structured plumbing modules, timed practice, and final coaching sessions while keeping learner progress and curriculum visibility in one place.',
    ],
    learn: [
      'Interpret plumbing code requirements with more confidence.',
      'Practice pipe sizing, sanitary system design, and fixture-unit calculations.',
      'Review troubleshooting scenarios with guided explanations and technical references.',
      'Prepare for mock-board assessments with structured progress checkpoints.',
    ],
    audience: [
      'Master Plumbing examinees preparing for board review programs.',
      'Learners who want more guided practice on code-based scenarios.',
      'Review-center instructors building a reusable plumbing course workflow.',
    ],
    faqs: [
      {
        question: 'Does this course focus on code-heavy topics?',
        answer:
          'Yes. Code interpretation and applied problem-solving are central parts of the program content.',
      },
      {
        question: 'Are practice scenarios included?',
        answer:
          'Yes. The course includes guided drills, module-based reviews, and final coaching content.',
      },
      {
        question: 'Can instructors use this for live sessions too?',
        answer:
          'Yes. The structure works well for both recorded delivery and live review-center sessions.',
      },
    ],
    notices: [
      'Code review modules are arranged to support both self-paced and guided coaching.',
      'Technical references can be attached per lesson to improve exam readiness.',
      'Learner progress highlights which areas need remediation before mock exams.',
    ],
    reviews: [
      {
        author: 'Jose Mendoza',
        role: 'Master Plumbing examinee',
        rating: 5,
        content:
          'The pipe sizing practice and code discussions are easy to follow. It feels like a modern review center platform.',
      },
      {
        author: 'Rhea Santos',
        role: 'Program mentor',
        rating: 4.5,
        content:
          'The course structure makes it easier to coach learners and point them to the exact lesson or drill they need.',
      },
    ],
  },
  'course-materials-intensive': {
    category: 'Materials Engineering',
    badge: 'ADVANCED',
    description:
      'A deep Materials Engineering review experience covering metallurgy, thermodynamics, failures, and materials behavior with guided modules and exam-ready practice.',
    body: [
      'This program is designed for learners who need a more organized way to study materials characterization, thermal processes, and failure analysis. The course combines conceptual refreshers with review checkpoints so technical topics stay manageable.',
      'It is especially useful for programs that want structured digital delivery of advanced lessons, references, and coaching notes across a longer review timeline.',
    ],
    learn: [
      'Review metallurgical behavior, heat treatment, and material response concepts.',
      'Connect thermodynamics principles with manufacturing and performance scenarios.',
      'Practice failure analysis reasoning in a guided learning sequence.',
      'Use structured references and review modules for long-form technical preparation.',
    ],
    audience: [
      'Materials Engineering learners preparing for intensive exam review.',
      'Advanced students who want clearer module progression across difficult topics.',
      'Institutions delivering long-form technical coaching and digital content.',
    ],
    faqs: [
      {
        question: 'Is this course best for advanced learners?',
        answer:
          'It is designed for intermediate to advanced learners, but the guided sequence still helps structure core refreshers.',
      },
      {
        question: 'What topics are emphasized most?',
        answer:
          'Metallurgy, thermodynamics, material behavior, heat treatment, and failure analysis are all emphasized.',
      },
      {
        question: 'Can learners revisit references after the lesson?',
        answer:
          'Yes. Modules can include PDFs, e-books, and structured summaries for later study.',
      },
    ],
    notices: [
      'Advanced modules are arranged to keep high-density technical topics easier to revisit.',
      'Reference materials can be paired with each module to support independent review.',
      'The course flow is ideal for longer intensive programs and exam-season schedules.',
    ],
    reviews: [
      {
        author: 'Paula Reyes',
        role: 'Materials Engineering learner',
        rating: 5,
        content:
          'The modules are organized really well. Difficult topics like heat treatment and failure analysis feel less overwhelming.',
      },
      {
        author: 'Dr. Ian Torres',
        role: 'Technical reviewer',
        rating: 4.5,
        content:
          'This layout works well for advanced engineering topics because the references, modules, and progress flow stay connected.',
      },
    ],
  },
  'course-how-to-design-components': {
    category: 'Environmental Sciences',
    badge: 'SPECIAL',
    description:
      'A UX-focused sprint on structuring screens so layouts stay consistent, typography stays readable, and learners can skim without losing hierarchy. ',
    body: [
      'Interface design fails quietly: spacing drifts, type scales collide, and “almost right” grids create cognitive drag. This course anchors you in repeatable composition habits—establishing grids, aligning modules, and reinforcing affordances so instructional content reads as calmly as intended.',
      "You'll move through short theory bursts and applied layout exercises modeled on LMS patterns: hero regions, stacked lessons, FAQs, notices, and review surfaces.",
    ],
    learn: [
      'Build responsive layout shells that behave predictably across breakpoints.',
      'Pair typography scale ramps with instructional density for long-read pages.',
      'Design component inventories that naming, props, and states can share.',
      'Critique layouts with checkpoints that unblock engineering sooner.',
      'Ship teaser and catalog cards that harmonize thumbnails, badges, and CTAs.',
    ],
    audience: [
      'Product designers supporting education or LMS experiences.',
      'Frontend engineers prototyping curriculum pages.',
      'Instructional designers who own layout fidelity with engineering.',
      'Teams standardizing dashboards, courses, and enrollment flows.',
    ],
    faqs: [
      {
        question: 'Do we cover design systems?',
        answer:
          "You'll practice modular regions and repeatable tokens—the same ingredients design systems formalize.",
      },
      {
        question: 'Are Figma files required?',
        answer:
          'No. Exercises are layout principles; you can sketch in any tool or in-browser.',
      },
      {
        question: 'Is this only for web?',
        answer:
          'Patterns apply to web-first LMS UIs; responsive thinking still helps native layouts.',
      },
    ],
    notices: [
      'Preview builds use sample Environmental Sciences metadata to mirror catalog cards.',
      'Completion state in the sidebar is a mock for instructor preview only.',
      'Swap copy in Settings to align with your production program description.',
    ],
    reviews: [
      {
        author: 'Jamie Ortega',
        role: 'Product designer',
        rating: 4.5,
        content:
          'Clear structure for teaching pages. The module on hierarchy alone saved us a round of visual QA.',
      },
    ],
  },
};

// ----------------------------------------------------------------------

export function getCourseCopy(course) {
  const fallbackDesc = typeof course?.description === 'string' ? course.description : '';
  return (
    COURSE_PAGE_COPY[course.id] ?? {
      category: 'Engineering Program',
      description: fallbackDesc || 'Course overview',
      body: fallbackDesc ? [fallbackDesc] : ['Overview will appear here soon.'],
      learn:
        Array.isArray(course?.subjects) && course.subjects.length > 0
          ? course.subjects
          : ['Structured objectives for this course will be listed soon.'],
      audience: ['Learners preparing for guided technical review.'],
      faqs: [],
      notices: [],
      reviews: [],
    }
  );
}

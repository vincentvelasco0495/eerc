import { CourseQuizStartView } from 'src/features/courses/views/course-quiz-start-view';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const metadata = { title: `Start quiz | ${CONFIG.appName}` };

export default function CourseQuizStartPage() {
  return (
    <>
      <title>{metadata.title}</title>
      <CourseQuizStartView />
    </>
  );
}

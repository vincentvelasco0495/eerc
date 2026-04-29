import { CONFIG } from 'src/global-config';
import { InstructorCourseCurriculumView } from 'src/features/instructor-course-builder/views/instructor-course-curriculum-view';

const metadata = { title: `Course curriculum | Dashboard - ${CONFIG.appName}` };

export default function InstructorCourseCurriculumPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <InstructorCourseCurriculumView />
    </>
  );
}

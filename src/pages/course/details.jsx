import { useParams } from 'react-router';

import { CONFIG } from 'src/global-config';
import { CourseDetailsView } from 'src/features/courses/views/course-details-view';

const metadata = { title: `Course details | Dashboard - ${CONFIG.appName}` };

export default function CourseDetailsPage() {
  const { courseId = '' } = useParams();

  return (
    <>
      <title>{metadata.title}</title>

      <CourseDetailsView courseId={courseId} />
    </>
  );
}

import { CONFIG } from 'src/global-config';
import { StudentProfileView } from 'src/features/student-profile/views/student-profile-view';

const metadata = { title: `Enrolled Courses | Dashboard - ${CONFIG.appName}` };

export default function EnrolledCoursesPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <StudentProfileView />
    </>
  );
}

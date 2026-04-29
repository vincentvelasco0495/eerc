import { CONFIG } from 'src/global-config';
import { StudentProfileView } from 'src/features/student-profile/views/student-profile-view';

const metadata = { title: `Student Profile | Dashboard - ${CONFIG.appName}` };

export default function StudentProfilePage() {
  return (
    <>
      <title>{metadata.title}</title>

      <StudentProfileView />
    </>
  );
}

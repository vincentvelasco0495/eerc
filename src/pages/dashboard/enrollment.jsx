import { CONFIG } from 'src/global-config';
import { EnrollmentView } from 'src/features/enrollment/views/enrollment-view';

const metadata = { title: `Enrollment | Dashboard - ${CONFIG.appName}` };

export default function EnrollmentPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <EnrollmentView />
    </>
  );
}

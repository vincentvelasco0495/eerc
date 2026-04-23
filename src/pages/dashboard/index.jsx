import { CONFIG } from 'src/global-config';
import { LmsDashboardView } from 'src/features/dashboard/views/lms-dashboard-view';

// ----------------------------------------------------------------------

const metadata = { title: `Dashboard - ${CONFIG.appName}` };

export default function OverviewAppPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <LmsDashboardView />
    </>
  );
}

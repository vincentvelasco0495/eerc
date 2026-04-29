import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

import { usePathname } from 'src/routes/hooks';

import { useLmsUser } from 'src/hooks/use-lms';

import { DashboardContent } from 'src/layouts/dashboard';

import { lmsPageShellStyles } from 'src/components/layout/lms-page-shell.styles';

import { workspaceContentSx } from './styles';
import { StudentProfileSidebar } from '../student-profile-sidebar';
import { getStudentWorkspaceNavGroups } from '../../student-profile-data';

export function StudentWorkspaceShell({ children }) {
  const pathname = usePathname();
  const user = useLmsUser();
  const navGroups = getStudentWorkspaceNavGroups(pathname);

  return (
    <DashboardContent maxWidth={false}>
      <Stack spacing={3.5} sx={[lmsPageShellStyles.content, ...workspaceContentSx]}>
        <Grid container spacing={3} alignItems="flex-start">
          <Grid size={{ xs: 12, lg: 3 }}>
            <StudentProfileSidebar user={user} navGroups={navGroups} />
          </Grid>

          <Grid size={{ xs: 12, lg: 9 }}>{children}</Grid>
        </Grid>
      </Stack>
    </DashboardContent>
  );
}

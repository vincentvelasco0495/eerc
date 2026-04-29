import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

import { usePathname } from 'src/routes/hooks';

import { useLmsUser } from 'src/hooks/use-lms';

import { DashboardContent } from 'src/layouts/dashboard';

import { lmsPageShellStyles } from 'src/components/layout/lms-page-shell.styles';

import { workspaceContentSx } from './styles';
import { InstructorProfileSidebar } from '../instructor-profile-sidebar';
import { buildInstructorProfileIdentity, getInstructorWorkspaceNavGroups } from '../../instructor-profile-data';

export function InstructorWorkspaceShell({ children }) {
  const pathname = usePathname();
  const user = useLmsUser();
  const profile = buildInstructorProfileIdentity(user);
  const navGroups = getInstructorWorkspaceNavGroups(pathname);

  return (
    <DashboardContent maxWidth={false}>
      <Stack spacing={3.5} sx={[lmsPageShellStyles.content, ...workspaceContentSx]}>
        <Grid container spacing={3} alignItems="flex-start">
          <Grid size={{ xs: 12, lg: 3 }}>
            <InstructorProfileSidebar profile={profile} navGroups={navGroups} />
          </Grid>

          <Grid size={{ xs: 12, lg: 9 }}>{children}</Grid>
        </Grid>
      </Stack>
    </DashboardContent>
  );
}

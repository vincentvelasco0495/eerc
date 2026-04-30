import { merge } from 'es-toolkit';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import { iconButtonClasses } from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';

import { _notifications } from 'src/_mock';

import { Logo } from 'src/components/logo';
import { useSettingsContext } from 'src/components/settings';

import { _account } from '../nav-config-account';
import { AccountDrawer } from '../components/account-drawer';
import { SettingsButton } from '../components/settings-button';
import { MainSection, HeaderSection, LayoutSection } from '../core';
import { dashboardLayoutVars, dashboardNavColorVars } from './css-vars';
import { NotificationsDrawer } from '../components/notifications-drawer';

// ----------------------------------------------------------------------

export function DashboardLayout({ sx, cssVars, children, slotProps, layoutQuery = 'lg' }) {
  const theme = useTheme();
  const pathname = usePathname();

  const settings = useSettingsContext();

  const navVars = dashboardNavColorVars(theme, settings.state.navColor, settings.state.navLayout);

  const isStudentWorkspace = [
    paths.dashboard.instructorProfile,
    paths.dashboard.instructorAnnouncement,
    paths.dashboard.instructorSettings,
    paths.dashboard.instructorGradebook,
    paths.dashboard.instructorCourseCurriculum,
    paths.dashboard.instructorAssignments,
    paths.dashboard.studentProfile,
    paths.dashboard.studentAssignments,
    paths.dashboard.quizzes.root,
    paths.dashboard.studentSettings,
  ].includes(pathname);

  const hideDashboardHeader = pathname === paths.dashboard.instructorCourseCurriculum;

  const isNavMini = settings.state.navLayout === 'mini';
  const isNavHorizontal = settings.state.navLayout === 'horizontal';
  const isNavVertical = isNavMini || settings.state.navLayout === 'vertical';

  /** Controls header tint/height + logo chrome. */
  const showHorizontalNavRail = isStudentWorkspace ? isNavHorizontal : true;

  const renderHeader = () => {
    const headerSlotProps = {
      container: {
        maxWidth: false,
        sx: {
          width: 1,
          maxWidth: 'none !important',
          mx: 0,
          px: { xs: 2, sm: 3, [layoutQuery]: 5 },
          ...(showHorizontalNavRail && {
            bgcolor: 'var(--layout-nav-bg)',
            height: { [layoutQuery]: 'var(--layout-nav-horizontal-height)' },
            [`& .${iconButtonClasses.root}`]: { color: 'var(--layout-nav-text-secondary-color)' },
          }),
        },
      },
    };

    const headerSlots = {
      topArea: (
        <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
          This is an info Alert.
        </Alert>
      ),
      bottomArea: null,
      leftArea: (
        <>
          {/** @slot Logo */}
          {showHorizontalNavRail && <Logo sx={{ display: 'inline-flex' }} />}
        </>
      ),
      rightArea: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 0.75 } }}>
          {/** @slot Notifications popover */}
          <NotificationsDrawer data={_notifications} />

          {/** @slot Settings button */}
          <SettingsButton />

          {/** @slot Account drawer */}
          <AccountDrawer data={_account} />
        </Box>
      ),
    };

    return (
      <HeaderSection
        layoutQuery={layoutQuery}
        disableElevation={showHorizontalNavRail ? false : isNavVertical}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        sx={slotProps?.header?.sx}
      />
    );
  };

  const renderFooter = () => null;

  const renderMain = () => <MainSection {...slotProps?.main}>{children}</MainSection>;

  return (
    <LayoutSection
      headerSection={hideDashboardHeader ? null : renderHeader()}
      sidebarSection={null}
      footerSection={renderFooter()}
      cssVars={{ ...dashboardLayoutVars(theme), ...navVars.layout, ...cssVars }}
      sx={[...(Array.isArray(sx) ? sx : [sx])]}
    >
      {renderMain()}
    </LayoutSection>
  );
}

import { merge } from 'es-toolkit';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { iconButtonClasses } from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';

import { _notifications } from 'src/_mock';

import { Logo } from 'src/components/logo';

import { NavMobile } from './nav/mobile';
import { NavDesktop } from './nav/desktop';
import { Footer, HomeFooter } from './footer';
import { _account } from '../nav-config-account';
import { MenuButton } from '../components/menu-button';
import { useDashboardEntry } from './use-dashboard-entry';
import { navData as mainNavData } from '../nav-config-main';
import { AccountDrawer } from '../components/account-drawer';
import { SettingsButton } from '../components/settings-button';
import { MainSection, LayoutSection, HeaderSection } from '../core';
import { NotificationsDrawer } from '../components/notifications-drawer';

/** Bell badge count for `/course-detail` header (four unread). */
const COURSE_DETAIL_NOTIFICATION_DATA = _notifications.map((notification, index) => ({
  ...notification,
  isUnRead: index < 4,
}));

// ----------------------------------------------------------------------

export function MainLayout({ sx, cssVars, children, slotProps, layoutQuery = 'md' }) {
  const pathname = usePathname();

  const { goToDashboardOrSignIn, loading: authLoadingForDashboard } = useDashboardEntry();

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const isHomePage = pathname === '/';
  const isMinimalCourseChrome =
    pathname === paths.courseDetailDemo || pathname === paths.programCourseDetail;

  const navData = slotProps?.nav?.data ?? mainNavData;

  const renderHeader = () => {
    if (isMinimalCourseChrome) {
      const courseDetailHeaderSlots = {
        topArea: null,
        leftArea: (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              minWidth: { md: 220, lg: 260 },
            }}
          >
            <Logo sx={{ width: 40, height: 40 }} />
          </Box>
        ),
        centerArea: null,
        rightArea: (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 0.25, sm: 0.75 },
              flexShrink: 0,
              ml: 'auto',
              color: 'text.secondary',
              [`& .${iconButtonClasses.root}`]: { color: 'text.secondary' },
            }}
          >
            <NotificationsDrawer
              data={COURSE_DETAIL_NOTIFICATION_DATA}
              sx={{ color: 'inherit' }}
            />
            <SettingsButton dotForced sx={{ color: 'inherit' }} />
            <AccountDrawer data={_account} sx={{ color: 'inherit' }} />
          </Box>
        ),
      };

      const headerSlotProps = {
        container: {
          maxWidth: false,
          sx: {
            width: 1,
            maxWidth: 'none !important',
            mx: 0,
            px: { xs: 2, sm: 3, md: 5 },
          },
        },
      };

      return (
        <HeaderSection
          layoutQuery={layoutQuery}
          {...slotProps?.header}
          slots={{ ...courseDetailHeaderSlots, ...slotProps?.header?.slots }}
          slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
          sx={slotProps?.header?.sx}
        />
      );
    }

    const headerSlotProps = {
      container: {
        maxWidth: false,
        sx: {
          width: 1,
          maxWidth: 'none !important',
          mx: 0,
          px: { xs: 2, sm: 3, md: 5 },
        },
      },
    };

    const headerSlots = {
      topArea: (
        <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
          This is an info Alert.
        </Alert>
      ),
      leftArea: (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            minWidth: { md: 220, lg: 260 },
          }}
        >
          {/** @slot Nav mobile */}
          <MenuButton
            onClick={onOpen}
            sx={(theme) => ({
              mr: 1,
              ml: -1,
              [theme.breakpoints.up(layoutQuery)]: { display: 'none' },
            })}
          />
          <NavMobile data={navData} open={open} onClose={onClose} />

          {/** @slot Logo */}
          <Logo
            sx={{
              width: 40,
              height: 40,
            }}
          />
        </Box>
      ),
      centerArea: (
        <NavDesktop
          data={navData}
          sx={(theme) => ({
            display: 'none',
            [theme.breakpoints.up(layoutQuery)]: { display: 'flex' },
          })}
        />
      ),
      rightArea: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          {isHomePage ? (
            <Button
              type="button"
              variant="contained"
              disabled={authLoadingForDashboard}
              onClick={goToDashboardOrSignIn}
              sx={(theme) => ({
                display: 'none',
                px: 2.5,
                py: 1,
                minHeight: 40,
                minWidth: 'fit-content',
                alignItems: 'center',
                whiteSpace: 'nowrap',
                lineHeight: 1,
                borderRadius: 999,
                [theme.breakpoints.up(layoutQuery)]: { display: 'inline-flex' },
              })}
            >
              Go to dashboard
            </Button>
          ) : null}
        </Box>
      ),
    };

    return (
      <HeaderSection
        layoutQuery={layoutQuery}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        sx={slotProps?.header?.sx}
      />
    );
  };

  const renderFooter = () =>
    isHomePage ? (
      <HomeFooter
        sx={[
          {
            bgcolor: '#0f172a',
            color: 'common.white',
            '& a': { color: 'common.white' },
          },
          ...(Array.isArray(slotProps?.footer?.sx) ? slotProps.footer.sx : [slotProps?.footer?.sx]),
        ]}
      />
    ) : (
      <Footer sx={slotProps?.footer?.sx} layoutQuery={layoutQuery} />
    );

  const renderMain = () => <MainSection {...slotProps?.main}>{children}</MainSection>;

  return (
    <LayoutSection
      /** **************************************
       * @Header
       *************************************** */
      headerSection={renderHeader()}
      /** **************************************
       * @Footer
       *************************************** */
      footerSection={renderFooter()}
      /** **************************************
       * @Styles
       *************************************** */
      cssVars={cssVars}
      sx={sx}
    >
      {renderMain()}
    </LayoutSection>
  );
}

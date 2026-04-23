import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export const navData = [
  { title: 'Home', path: '/', icon: <Iconify width={22} icon="solar:home-angle-bold-duotone" /> },
  {
    title: 'Programs',
    path: paths.dashboard.courses.root,
    icon: <Iconify width={22} icon="solar:book-bookmark-bold-duotone" />,
  },
  {
    title: 'Features',
    path: paths.dashboard.analyticsHub,
    icon: <Iconify width={22} icon="solar:star-bold-duotone" />,
  },
  {
    title: 'Leaderboard',
    path: paths.dashboard.leaderboard,
    icon: <Iconify width={22} icon="solar:cup-star-bold-duotone" />,
  },
  {
    title: 'Dashboard',
    path: CONFIG.auth.redirectPath,
    icon: <Iconify width={22} icon="solar:widget-5-bold-duotone" />,
  },
];

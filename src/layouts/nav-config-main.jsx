import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export const navData = [
  { title: 'Home', path: '/', icon: <Iconify width={22} icon="solar:home-angle-bold-duotone" /> },
  {
    title: 'About Us',
    path: paths.about,
    icon: <Iconify width={22} icon="solar:shield-user-bold-duotone" />,
  },
  {
    title: 'Programs',
    path: paths.dashboard.courses.root,
    icon: <Iconify width={22} icon="solar:book-bookmark-bold-duotone" />,
    deepMatch: true,
    children: [
      {
        subheader: 'Programs',
        items: [
          {
            title: 'Civil Engineering',
            path: paths.dashboard.courses.details('course-ce-review'),
          },
          {
            title: 'Master Plumbing',
            path: paths.dashboard.courses.details('course-plumbing-mastery'),
          },
          {
            title: 'Materials Engineering',
            path: paths.dashboard.courses.details('course-materials-intensive'),
          },
        ],
      },
    ],
  },
  {
    title: 'Leaderboard',
    path: paths.dashboard.leaderboard,
    icon: <Iconify width={22} icon="solar:cup-star-bold-duotone" />,
  },
  {
    title: 'Contact Us',
    path: paths.contact,
    icon: <Iconify width={22} icon="solar:phone-calling-rounded-bold-duotone" />,
  },
];

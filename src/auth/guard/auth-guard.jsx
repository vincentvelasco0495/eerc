import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';

import { isDashboardLayoutPath } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hooks';

import { SplashScreen } from 'src/components/loading-screen';

import { useAuthContext } from '../hooks';
import { getAuthSignInPath } from '../utils';
import {
  canAccessPage,
  getRoleHomePath,
  searchParamsToQuery,
} from '../utils/page-permissions';

// ----------------------------------------------------------------------

export function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchParams] = useSearchParams();

  const { authenticated, loading, user } = useAuthContext();

  const [isChecking, setIsChecking] = useState(true);

  const isPublicPath =
    /^\/course-details\/[^/]+(\/.*)?$/.test(pathname ?? '') ||
    /^\/program-course-detail(\/.*)?$/.test(pathname ?? '');

  const createRedirectPath = (currentPath) => {
    const queryString = new URLSearchParams({ returnTo: pathname }).toString();
    return `${currentPath}?${queryString}`;
  };

  const checkPermissions = async () => {
    if (loading) {
      return;
    }

    if (isPublicPath) {
      setIsChecking(false);
      return;
    }

    if (!authenticated) {
      const signInPath = getAuthSignInPath();
      const redirectPath = createRedirectPath(signInPath);

      router.replace(redirectPath);

      return;
    }

    if (isDashboardLayoutPath(pathname)) {
      const query = searchParamsToQuery(searchParams);

      if (!canAccessPage(user, pathname, query)) {
        router.replace(getRoleHomePath(user?.role));
        return;
      }
    }

    setIsChecking(false);
  };

  useEffect(() => {
    checkPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, loading, pathname, searchParams, user]);

  if (isChecking) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}

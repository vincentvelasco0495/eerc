import { useCallback } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useAuthContext } from 'src/auth/hooks';
import { getAuthSignInPath } from 'src/auth/utils';

// ----------------------------------------------------------------------

export function useDashboardEntry() {
  const router = useRouter();
  const { authenticated, loading } = useAuthContext();

  const goToDashboardOrSignIn = useCallback(() => {
    if (loading) {
      return;
    }

    if (authenticated) {
      router.push(paths.dashboard.root);
      return;
    }

    router.push(getAuthSignInPath());
  }, [authenticated, loading, router]);

  return { goToDashboardOrSignIn, loading };
}

import { useEffect, ReactNode, useMemo } from 'react';

// material-ui
import { CacheProvider } from '@emotion/react';
import createCache, { StylisPlugin } from '@emotion/cache';

// third-party
import rtlPlugin from 'stylis-plugin-rtl';

// project-imports
import { ThemeDirection } from 'config';
import useConfig from 'hooks/useConfig';

interface Props {
  children: ReactNode;
}

// ==============================|| RTL LAYOUT ||============================== //

export default function RTLLayout({ children }: Props) {
  const { themeDirection } = useConfig();

  useEffect(() => {
    document.dir = themeDirection;
  }, [themeDirection]);

  const cacheRtl = useMemo(
    () =>
      createCache({
        key: themeDirection === ThemeDirection.RTL ? 'rtl' : 'css',
        prepend: true,
        stylisPlugins: themeDirection === ThemeDirection.RTL ? [rtlPlugin as StylisPlugin] : []
      }),
    [themeDirection]
  );

  return <CacheProvider value={cacheRtl}>{children}</CacheProvider>;
}

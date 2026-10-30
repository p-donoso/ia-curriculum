'use client';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material';
import { theme } from './theme';
import type { ReactNode } from 'react';
import { I18nProvider } from './i18n';
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        <I18nProvider>
          <CssBaseline />
          <GlobalStyles styles="@layer theme,base,mui,components,utilities;" />
          {children}
        </I18nProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}

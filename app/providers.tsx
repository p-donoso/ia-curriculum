'use client';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material';
import { theme } from './theme';
import type { ReactNode } from 'react';
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles styles="@layer theme,base,mui,components,utilities;" />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}

'use client';

import { useEffect, useState } from 'react';
import './globals.css';
import { localeStorageKey, translate, type Locale } from './i18n';
import { RecoveryScreen } from './components/recovery-screen';

type GlobalErrorState = Error & { digest?: string };

export default function GlobalError({ error, retry }: { error: GlobalErrorState; retry: () => void }) {
  const [locale, setLocale] = useState<Locale>('es');

  useEffect(() => {
    try {
      const storedLocale = window.localStorage.getItem(localeStorageKey);
      if (storedLocale === 'en' || storedLocale === 'es') setLocale(storedLocale);
    } catch {
      // Keep the fallback usable when browser storage is unavailable.
    }
  }, []);

  useEffect(() => {
    console.error('IA Curriculum root error:', error);
  }, [error]);

  const t = (key: string) => translate(locale, key);

  return (
    <html lang={locale}>
      <head>
        <title>{t('errorTitle')} · IA Curriculum</title>
      </head>
      <body>
        <RecoveryScreen
          code="500"
          title={t('errorTitle')}
          message={t('errorMessage')}
          labelledBy="global-error-title"
          reference={error.digest ? `${t('errorReference')}: ${error.digest}` : undefined}
          actions={
            <>
              <button className="recovery-button recovery-button-primary" onClick={retry}>
                {t('tryAgain')}
              </button>
              <a className="recovery-button recovery-button-secondary" href="/">
                {t('goHome')}
              </a>
            </>
          }
        />
      </body>
    </html>
  );
}

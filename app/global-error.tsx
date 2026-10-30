'use client';

import { useEffect, useState } from 'react';
import './globals.css';
import { localeStorageKey, translate, type Locale } from './i18n';

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
        <main className="recovery-page">
          <section className="recovery-card" aria-labelledby="global-error-title" role="alert">
            <p className="recovery-code">500</p>
            <h1 className="recovery-title" id="global-error-title">
              {t('errorTitle')}
            </h1>
            <p className="recovery-message">{t('errorMessage')}</p>
            {error.digest && (
              <p className="recovery-reference">
                {t('errorReference')}: {error.digest}
              </p>
            )}
            <div className="recovery-actions">
              <button className="recovery-button recovery-button-primary" onClick={retry}>
                {t('tryAgain')}
              </button>
              <a className="recovery-button recovery-button-secondary" href="/">
                {t('goHome')}
              </a>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}

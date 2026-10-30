'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { LocaleToggle, useI18n } from './i18n';

type RouteError = Error & { digest?: string };

export default function ErrorPage({ error, retry }: { error: RouteError; retry: () => void }) {
  const { t } = useI18n();

  useEffect(() => {
    console.error('IA Curriculum route error:', error);
  }, [error]);

  return (
    <main className="recovery-page">
      <section className="recovery-card" aria-labelledby="error-title" role="alert">
        <div className="recovery-toolbar">
          <LocaleToggle />
        </div>
        <p className="recovery-code">500</p>
        <h1 className="recovery-title" id="error-title">
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
          <Link className="recovery-button recovery-button-secondary" href="/">
            {t('goHome')}
          </Link>
        </div>
      </section>
    </main>
  );
}

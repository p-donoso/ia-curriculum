'use client';

import Link from 'next/link';
import { LocaleToggle, useI18n } from './i18n';

export default function NotFound() {
  const { t } = useI18n();

  return (
    <main className="recovery-page">
      <section className="recovery-card" aria-labelledby="not-found-title">
        <div className="recovery-toolbar">
          <LocaleToggle />
        </div>
        <p className="recovery-code">404</p>
        <h1 className="recovery-title" id="not-found-title">
          {t('notFound')}
        </h1>
        <p className="recovery-message">{t('notFoundMessage')}</p>
        <div className="recovery-actions">
          <Link className="recovery-button recovery-button-primary" href="/">
            {t('goHome')}
          </Link>
        </div>
      </section>
    </main>
  );
}

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { LocaleToggle, useI18n } from './i18n';
import { RecoveryScreen } from './components/recovery-screen';

type RouteError = Error & { digest?: string };

export default function ErrorPage({ error, retry }: { error: RouteError; retry: () => void }) {
  const { t } = useI18n();

  useEffect(() => {
    console.error('IA Curriculum route error:', error);
  }, [error]);

  return (
    <RecoveryScreen
      code="500"
      title={t('errorTitle')}
      message={t('errorMessage')}
      labelledBy="error-title"
      toolbar={<LocaleToggle />}
      reference={error.digest ? `${t('errorReference')}: ${error.digest}` : undefined}
      actions={
        <>
          <button className="recovery-button recovery-button-primary" onClick={retry}>
            {t('tryAgain')}
          </button>
          <Link className="recovery-button recovery-button-secondary" href="/">
            {t('goHome')}
          </Link>
        </>
      }
    />
  );
}

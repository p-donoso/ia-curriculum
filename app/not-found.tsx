'use client';

import Link from 'next/link';
import { LocaleToggle, useI18n } from './i18n';
import { RecoveryScreen } from './components/recovery-screen';

export default function NotFound() {
  const { t } = useI18n();

  return (
    <RecoveryScreen
      code="404"
      title={t('notFound')}
      message={t('notFoundMessage')}
      labelledBy="not-found-title"
      toolbar={<LocaleToggle />}
      actions={
        <Link className="recovery-button recovery-button-primary" href="/">
          {t('goHome')}
        </Link>
      }
    />
  );
}

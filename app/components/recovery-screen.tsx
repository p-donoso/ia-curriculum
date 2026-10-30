import type { ReactNode } from 'react';

type RecoveryScreenProps = {
  code: '404' | '500';
  title: string;
  message: string;
  labelledBy: string;
  toolbar?: ReactNode;
  reference?: string;
  actions: ReactNode;
};

/** Shared accessible layout for not-found and application error routes. */
export function RecoveryScreen({ code, title, message, labelledBy, toolbar, reference, actions }: RecoveryScreenProps) {
  return (
    <main className="recovery-page">
      <section className="recovery-card" aria-labelledby={labelledBy} role={code === '500' ? 'alert' : undefined}>
        {toolbar && <div className="recovery-toolbar">{toolbar}</div>}
        <p className="recovery-code">{code}</p>
        <h1 className="recovery-title" id={labelledBy}>
          {title}
        </h1>
        <p className="recovery-message">{message}</p>
        {reference && <p className="recovery-reference">{reference}</p>}
        <div className="recovery-actions">{actions}</div>
      </section>
    </main>
  );
}

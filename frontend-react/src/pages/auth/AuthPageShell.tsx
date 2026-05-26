import type { PropsWithChildren } from 'react';

type AuthPageShellProps = PropsWithChildren<{
  title: string;
  subtitle: string;
}>;

export function AuthPageShell({ title, subtitle, children }: AuthPageShellProps) {
  return (
    <section className="auth-page">
      <div className="auth-page__media" aria-hidden="true">
        <img src="/assets/img/focus/audience-perception.jpg" alt="" />
      </div>
      <div className="auth-card">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {children}
      </div>
    </section>
  );
}

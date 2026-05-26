import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { resetPassword } from '../../shared/api/auth';

type Feedback = {
  message: string;
  type?: 'success' | 'error' | 'info';
};

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [visibleFields, setVisibleFields] = useState<Record<'password' | 'confirm', boolean>>({
    password: false,
    confirm: false,
  });
  const [feedback, setFeedback] = useState<Feedback>({
    message: token ? '' : t('auth.reset.missingToken'),
    type: token ? undefined : 'error',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = `${t('auth.reset.title')} | AI Cinema Lab`;
  }, [t]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setFeedback({ message: t('auth.reset.mismatch'), type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ message: t('auth.reset.submitting'), type: 'info' });

    try {
      const response = await resetPassword(token, password);

      setFeedback({ message: response.message || t('auth.reset.success'), type: 'success' });
      window.setTimeout(() => navigate('/login'), 900);
    } catch (error) {
      setFeedback({ message: error instanceof Error ? error.message : t('auth.reset.error'), type: 'error' });
      setIsSubmitting(false);
    }
  }

  return (
    <section
      className="login-section forgot-password-section section-padding fix bg-cover"
      style={{ backgroundImage: "url('/assets/img/service/Pattern.png')" }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-11">
            <div className="login-wrapper forgot-password-wrapper">
              <div className="row g-0 align-items-stretch">
                <div className="col-xl-6">
                  <div className="forgot-password-visual">
                    <img src="/assets/img/about/ai-lab.jpg" alt="AI Cinema Lab reset password" />
                  </div>
                </div>
                <div className="col-xl-6">
                  <div className="signin-item forgot-password-panel">
                    <div className="sign-header">
                      <span className="reset-eyebrow">{t('auth.reset.eyebrow')}</span>
                      <h3>{t('auth.reset.title')}</h3>
                      <p>{t('auth.reset.subtitle')}</p>
                    </div>

                    <form action="#" className="mt-4" onSubmit={handleSubmit}>
                      <div className="input-item">
                        <span className="lable-text">{t('auth.reset.newPassword')}</span>
                        <input
                          type={visibleFields.password ? 'text' : 'password'}
                          placeholder={t('auth.reset.newPassword')}
                          autoComplete="new-password"
                          minLength={8}
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          disabled={!token}
                          required
                        />
                        <button
                          type="button"
                          className="icon password-toggle"
                          aria-label={visibleFields.password ? t('common.hidePassword') : t('common.showPassword')}
                          onClick={() => setVisibleFields((current) => ({ ...current, password: !current.password }))}
                        >
                          <i className={`fa-solid ${visibleFields.password ? 'fa-eye' : 'fa-eye-slash'}`} />
                        </button>
                      </div>
                      <div className="input-item">
                        <span className="lable-text">{t('auth.reset.confirmPassword')}</span>
                        <input
                          type={visibleFields.confirm ? 'text' : 'password'}
                          placeholder={t('auth.reset.confirmPassword')}
                          autoComplete="new-password"
                          minLength={8}
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          disabled={!token}
                          required
                        />
                        <button
                          type="button"
                          className="icon password-toggle"
                          aria-label={visibleFields.confirm ? t('common.hidePassword') : t('common.showPassword')}
                          onClick={() => setVisibleFields((current) => ({ ...current, confirm: !current.confirm }))}
                        >
                          <i className={`fa-solid ${visibleFields.confirm ? 'fa-eye' : 'fa-eye-slash'}`} />
                        </button>
                      </div>

                      <div className="button-items">
                        <button type="submit" className="theme-btn" disabled={isSubmitting || !token}>
                          {t('auth.reset.submit')} <i className="fa-sharp fa-regular fa-arrow-up-right" />
                        </button>
                      </div>

                      <p className={`forgot-password-feedback${feedback.type ? ` is-${feedback.type}` : ''}`} aria-live="polite">
                        {feedback.message}
                      </p>
                      <p className="auth-back-link">
                        {t('auth.forgot.remembered')}
                        <Link to="/login">{t('auth.forgot.back')}</Link>
                      </p>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

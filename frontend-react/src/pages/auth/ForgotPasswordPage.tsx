import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { forgotPassword } from '../../shared/api/auth';

type Feedback = {
  message: string;
  type?: 'success' | 'error' | 'info';
};

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState<Feedback>({ message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = `${t('auth.forgot.title')} | AI Cinema Lab`;
  }, [t]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback({ message: t('auth.forgot.submitting'), type: 'info' });

    try {
      const response = await forgotPassword(email.trim());

      setFeedback({
        message: response.message || t('auth.forgot.success'),
        type: 'success',
      });
    } catch (error) {
      setFeedback({ message: error instanceof Error ? error.message : t('auth.forgot.error'), type: 'error' });
    } finally {
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
                    <img src="/assets/img/about/ai-lab.jpg" alt="AI Cinema Lab reset access" />
                  </div>
                </div>
                <div className="col-xl-6">
                  <div className="signin-item forgot-password-panel">
                    <div className="sign-header">
                      <span className="reset-eyebrow">{t('auth.forgot.eyebrow')}</span>
                      <h3>{t('auth.forgot.title')}</h3>
                      <p>{t('auth.forgot.subtitle')}</p>
                    </div>

                    <form action="#" className="mt-4" onSubmit={handleSubmit}>
                      <div className="input-item">
                        <span className="lable-text">{t('auth.email')}</span>
                        <input
                          type="email"
                          placeholder="name@example.com"
                          autoComplete="email"
                          autoCapitalize="none"
                          spellCheck={false}
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          required
                        />
                        <div className="icon">
                          <i className="fa-regular fa-envelope" />
                        </div>
                      </div>

                      <div className="button-items">
                        <button type="submit" className="theme-btn" disabled={isSubmitting}>
                          {t('auth.forgot.submit')} <i className="fa-sharp fa-regular fa-arrow-up-right" />
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

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getGoogleAuthStartUrl, registerUser } from '../../shared/api/auth';
import { useAuth } from '../../shared/auth/useAuth';

type Feedback = {
  message: string;
  type?: 'success' | 'error' | 'info';
};

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const returnTo = getSafeReturnTo(new URLSearchParams(location.search).get('returnTo'));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({ message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = `${t('auth.register.title')} | AI Cinema Lab`;
  }, [t]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback({ message: t('auth.register.submitting'), type: 'info' });

    try {
      const response = await registerUser({ name: name.trim(), email: email.trim(), password, rememberMe });

      signIn(response.accessToken, response.user, rememberMe);
      setFeedback({ message: t('auth.register.success'), type: 'success' });
      navigate(returnTo);
    } catch (error) {
      setFeedback({ message: error instanceof Error ? error.message : t('auth.register.error'), type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="login-section section-padding fix bg-cover" style={{ backgroundImage: "url('/assets/img/service/Pattern.png')" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-12">
            <div className="login-wrapper">
              <div className="row">
                <div className="col-xl-6">
                  <div className="sign-img" style={{ height: '100%' }}>
                    <img
                      src="/assets/img/ethics-authenticity.jpg"
                      alt="Register visual"
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'block',
                        objectFit: 'cover',
                        objectPosition: 'center',
                      }}
                    />
                  </div>
                </div>
                <div className="col-xl-6">
                  <div className="signin-item">
                    <div className="sign-header">
                      <h3>{t('auth.register.title')}</h3>
                      <p>{t('auth.register.subtitle')}</p>
                    </div>
                    <div className="social-icon">
                      <a
                        href={getGoogleAuthStartUrl(returnTo, rememberMe)}
                        className="google-auth-button"
                        onClick={() => setFeedback({ message: t('auth.google.redirecting'), type: 'info' })}
                      >
                        <i className="fa-brands fa-google" /> {t('auth.register.google')}
                      </a>
                    </div>
                    <h5>{t('auth.register.emailDivider')}</h5>
                    <form action="#" className="mt-4" onSubmit={handleSubmit}>
                      <div className="input-item">
                        <span className="lable-text">{t('auth.name')}</span>
                        <input
                          type="text"
                          name="name"
                          placeholder={t('auth.name')}
                          autoComplete="name"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          required
                        />
                        <div className="icon">
                          <i className="fa-regular fa-user" />
                        </div>
                      </div>
                      <div className="input-item">
                        <span className="lable-text">{t('auth.email')}</span>
                        <input
                          type="email"
                          placeholder="info@example.com"
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
                      <div className="input-item">
                        <span className="lable-text">{t('auth.password')}</span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t('auth.password')}
                          autoComplete="new-password"
                          minLength={8}
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="icon password-toggle"
                          aria-label={showPassword ? t('common.hidePassword') : t('common.showPassword')}
                          onClick={() => setShowPassword((value) => !value)}
                        >
                          <i className={`fa-solid ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`} />
                        </button>
                      </div>
                      <div className="form-check">
                        <div>
                          <input
                            id="registerRemember"
                            name="reviewcheck"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(event) => setRememberMe(event.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="registerRemember">
                            {t('auth.remember')}
                          </label>
                        </div>
                        <Link to="/forgot-password" className="forgot-password-link">
                          {t('auth.forgotLink')}
                        </Link>
                      </div>
                      <div className="button-items">
                        <button type="submit" className="theme-btn" disabled={isSubmitting}>
                          {t('auth.register.submit')} <i className="fa-sharp fa-regular fa-arrow-up-right" />
                        </button>
                      </div>
                      <p className={`auth-form-feedback${feedback.type ? ` is-${feedback.type}` : ''}`} aria-live="polite">
                        {feedback.message}
                      </p>
                      <p>
                        {t('auth.register.hasAccount')}
                        <Link to="/login">{t('auth.register.login')}</Link>
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

function getSafeReturnTo(returnTo: string | null): string {
  if (!returnTo || !returnTo.startsWith('/') || returnTo.startsWith('//') || returnTo.includes('\\') || returnTo.includes('://')) {
    return '/';
  }

  return returnTo;
}

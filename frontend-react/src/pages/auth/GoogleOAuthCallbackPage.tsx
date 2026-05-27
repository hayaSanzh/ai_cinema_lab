import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../shared/auth/useAuth';
import type { User } from '../../shared/types/user';

export function GoogleOAuthCallbackPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const hasHandledCallback = useRef(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = `${t('auth.google.processingTitle')} | AI Cinema Lab`;
  }, [t]);

  useEffect(() => {
    if (hasHandledCallback.current) {
      return;
    }

    hasHandledCallback.current = true;

    try {
      const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const callbackError = params.get('error');

      if (callbackError) {
        throw new Error(callbackError);
      }

      const accessToken = params.get('accessToken');
      const encodedUser = params.get('user');

      if (!accessToken || !encodedUser) {
        throw new Error(t('auth.google.missingResponse'));
      }

      const rememberMe = params.get('rememberMe') === '1';
      const returnTo = getSafeReturnTo(params.get('returnTo'));
      const user = JSON.parse(decodeBase64Url(encodedUser)) as User;

      signIn(accessToken, user, rememberMe);
      navigate(returnTo, { replace: true });
    } catch (callbackError) {
      setError(callbackError instanceof Error ? callbackError.message : t('auth.google.error'));
      window.history.replaceState(null, '', '/auth/google/callback');
    }
  }, [navigate, signIn, t]);

  return (
    <section className="login-section section-padding fix bg-cover" style={{ backgroundImage: "url('/assets/img/service/Pattern.png')" }}>
      <div className="container">
        <div className="google-callback-panel">
          <h1>{error ? t('auth.google.failedTitle') : t('auth.google.processingTitle')}</h1>
          <p>{error || t('auth.google.processingText')}</p>
          {error ? (
            <Link to="/login" className="theme-btn">
              {t('auth.google.backToLogin')} <i className="fa-sharp fa-regular fa-arrow-up-right" />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

function getSafeReturnTo(returnTo: string | null): string {
  if (!returnTo || !returnTo.startsWith('/') || returnTo.startsWith('//') || returnTo.includes('\\') || returnTo.includes('://')) {
    return '/';
  }

  return returnTo;
}

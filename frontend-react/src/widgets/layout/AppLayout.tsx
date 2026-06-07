import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CinemaBot } from '../chatbot/CinemaBot';
import { Footer } from './Footer';
import { Header } from './Header';
import { LanguageSwitcher } from '../language/LanguageSwitcher';
import { navLinks } from './nav-links';
import { useAuth } from '../../shared/auth/useAuth';
import { getInitials } from '../../shared/lib/format';

export function AppLayout() {
  const location = useLocation();
  const { i18n, t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const shouldShowChatbot = !['/login', '/register', '/auth/google/callback', '/forgot-password', '/reset-password'].includes(
    location.pathname,
  );

  useEffect(() => {
    document.body.classList.add('body-bg');

    return () => {
      document.body.classList.remove('body-bg');
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
    window.setTimeout(initWow, 60);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <Preloader loadingLabel={t('common.loading')} />
      <MouseCursor />
      <button id="back-top" className="back-to-top" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <i className="fa-regular fa-arrow-up" />
      </button>
      <Offcanvas isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <Header onOpenMenu={() => setIsMenuOpen(true)} />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
      {shouldShowChatbot ? <CinemaBot /> : null}
    </div>
  );
}

function Preloader({ loadingLabel }: { loadingLabel: string }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const preloaderText = 'AI Cinema Lab';

  useEffect(() => {
    const loadTimer = window.setTimeout(() => setIsLoaded(true), 250);
    const hideTimer = window.setTimeout(() => setIsVisible(false), 1150);

    return () => {
      window.clearTimeout(loadTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div id="preloader" className={`preloader${isLoaded ? ' loaded' : ''}`} data-layout-part="preloader">
      <div className="animation-preloader">
        <div className="spinner" />
        <div className="txt-loading">
          {preloaderText.split('').map((letter, index) => (
            <span key={`${letter}-${index}`} data-text-preloader={letter} className="letters-loading">
              {letter === ' ' ? '\u00a0' : letter}
            </span>
          ))}
        </div>
        <p className="text-center">{loadingLabel}</p>
      </div>
      <div className="loader">
        <div className="row">
          <div className="col-3 loader-section section-left">
            <div className="bg" />
          </div>
          <div className="col-3 loader-section section-left">
            <div className="bg" />
          </div>
          <div className="col-3 loader-section section-right">
            <div className="bg" />
          </div>
          <div className="col-3 loader-section section-right">
            <div className="bg" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MouseCursor() {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      const transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;

      if (outerRef.current) {
        outerRef.current.style.transform = transform;
      }

      if (innerRef.current) {
        innerRef.current.style.transform = transform;
      }
    }

    window.addEventListener('mousemove', handleMouseMove);

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <div ref={outerRef} className="mouse-cursor cursor-outer" data-layout-part="cursor" />
      <div ref={innerRef} className="mouse-cursor cursor-inner" data-layout-part="cursor" />
    </>
  );
}

function Offcanvas({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { session } = useAuth();

  return (
    <>
      <div className="fix-area" data-layout-part="offcanvas">
        <div className={`offcanvas__info${isOpen ? ' info-open' : ''}`}>
          <div className="offcanvas__wrapper">
            <div className="offcanvas__content">
              <div className="offcanvas__top mb-5 d-flex justify-content-between align-items-center">
                <div className="offcanvas__logo">
                  <Link to="/" onClick={onClose}>
                    <img className="site-logo" src="/assets/img/logo/cinema-bot-icon.png" alt="AI Cinema Lab logo" />
                  </Link>
                </div>
                <div className="offcanvas__close">
                  <button type="button" aria-label={t('common.closeMenu')} onClick={onClose}>
                    <i className="fas fa-times" />
                  </button>
                </div>
              </div>
              <p className="text d-none d-xl-block">{t('layout.offcanvasDescription')}</p>
              <div className="offcanvas-language">
                <LanguageSwitcher />
              </div>
              <ul className="offcanvas-nav">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <NavLink to={link.to} className={({ isActive }) => (isActive ? 'active' : undefined)} onClick={onClose}>
                      {t(link.labelKey)}
                    </NavLink>
                  </li>
                ))}
              </ul>
              <div className="offcanvas-auth-actions">
                {session ? (
                  <Link to="/profile" className="offcanvas-profile-link" onClick={onClose}>
                    <span className="offcanvas-profile-avatar">
                      {session.user.avatarUrl ? (
                        <img src={session.user.avatarUrl} alt="" />
                      ) : (
                        getInitials(session.user.name || session.user.email || 'AI')
                      )}
                    </span>
                    <span>{t('profile.title')}</span>
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="offcanvas-auth-link is-secondary" onClick={onClose}>
                      {t('auth.login.submit')}
                    </Link>
                    <Link to="/register" className="offcanvas-auth-link is-primary" onClick={onClose}>
                      {t('nav.join')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <button
        type="button"
        className={`offcanvas__overlay${isOpen ? ' overlay-open' : ''}`}
        aria-label={t('common.closeMenuOverlay')}
        onClick={onClose}
      />
    </>
  );
}

function initWow() {
  const maybeWindow = window as typeof window & {
    WOW?: new (options?: Record<string, unknown>) => { init: () => void };
  };

  if (maybeWindow.WOW) {
    new maybeWindow.WOW({ live: false }).init();
  }
}

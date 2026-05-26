import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../shared/auth/useAuth';
import { LanguageSwitcher } from '../language/LanguageSwitcher';
import { navLinks } from './nav-links';

type HeaderProps = {
  onOpenMenu: () => void;
};

export function Header({ onOpenMenu }: HeaderProps) {
  const { session } = useAuth();
  const { t } = useTranslation();

  return (
    <header id="header-sticky" className="header-1" data-layout-part="header">
      <div className="container-fluid">
        <div className="mega-menu-wrapper">
          <div className="header-main">
            <div className="header-left">
              <div className="logo">
                <Link to="/" className="header-logo" aria-label="AI Cinema Lab home">
                  <img src="/assets/img/logo/white-logo.svg" alt="AI Cinema Lab logo" />
                </Link>
              </div>
              <div className="mean__menu-wrapper">
                <div className="main-menu">
                  <nav id="mobile-menu" aria-label="Main navigation">
                    <ul>
                      {navLinks.map((link) => (
                        <li key={link.to} className="has-dropdown">
                          <NavLink to={link.to} className={({ isActive }) => (isActive ? 'active' : undefined)}>
                            {t(link.labelKey)}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
            <div className="header-right d-flex justify-content-end align-items-center">
              <LanguageSwitcher />
              {session ? (
                <Link to="/profile" className="header-profile-link" aria-label={t('nav.profile')}>
                  <span className="header-profile-avatar">
                    {session.user.avatarUrl ? (
                      <img src={session.user.avatarUrl} alt={session.user.name ? `${session.user.name} avatar` : 'Profile avatar'} />
                    ) : (
                      getInitials(session.user.name || session.user.email || 'AI')
                    )}
                  </span>
                </Link>
              ) : (
                <Link to="/register" className="join-text header-join-now">
                  {t('nav.join')}
                </Link>
              )}
              <div className="header__hamburger d-xl-block my-auto">
                <button type="button" className="sidebar__toggle" aria-label={t('common.openMenu')} onClick={onOpenMenu}>
                  <span className="header-menu-bars" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return value.slice(0, 2).toUpperCase();
}

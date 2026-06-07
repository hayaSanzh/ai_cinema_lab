import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer-section footer-bg" data-layout-part="footer">
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-wrapper text-center">
            <div className="logo-img wow fadeInUp mb-3" data-wow-delay=".3s">
              <Link to="/">
                <img
                  src="/assets/img/logo/cinema-bot-icon.png"
                  alt="AI Cinema Lab logo"
                  className="footer-logo site-logo"
                />
              </Link>
            </div>
            <p className="wow fadeInUp footer-credit" data-wow-delay=".5s">
              {t('footer.createdBy')} <b>Ainissa Sarsenbayeva</b> {t('footer.and')} <b>Zhaniya Serikbayeva</b> &mdash;{' '}
              {t('footer.students')} <b>Astana IT University</b>, <br />
              {t('footer.school')}
            </p>
            <div className="footer-social-links wow fadeInUp" data-wow-delay=".7s">
              <a href="https://www.instagram.com/aitu_creative?igsh=b2h3NmNzb2JhbHNi" aria-label="Instagram">
                <i className="fa-brands fa-instagram" />
              </a>
              <a href="https://t.me/aicommunityaitu" aria-label="Telegram">
                <i className="fa-brands fa-telegram" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

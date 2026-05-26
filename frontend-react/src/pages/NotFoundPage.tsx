import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <section className="stub-page">
      <p className="eyebrow">404</p>
      <h1>{t('notFound.title')}</h1>
      <p>{t('notFound.description')}</p>
      <Link to="/" className="primary-link">
        {t('common.backHome')}
      </Link>
    </section>
  );
}

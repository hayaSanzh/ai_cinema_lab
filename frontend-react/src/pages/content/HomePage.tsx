import { useTranslation } from 'react-i18next';
import indexHtml from '../../../../frontend/public/index.html?raw';
import { LegacyHtmlPage } from './LegacyHtmlPage';

export function HomePage() {
  const { t } = useTranslation();

  return <LegacyHtmlPage html={indexHtml} page="home" title={t('legacy.home.title')} />;
}

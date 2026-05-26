import { useTranslation } from 'react-i18next';
import aboutHtml from '../../../../frontend/public/about.html?raw';
import { LegacyHtmlPage } from './LegacyHtmlPage';

export function AboutPage() {
  const { t } = useTranslation();

  return <LegacyHtmlPage html={aboutHtml} page="about" title={t('legacy.about.title')} />;
}

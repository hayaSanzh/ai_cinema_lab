import { useTranslation } from 'react-i18next';
import casesHtml from '../../../../frontend/public/cases.html?raw';
import { LegacyHtmlPage } from './LegacyHtmlPage';

export function CasesPage() {
  const { t } = useTranslation();

  return <LegacyHtmlPage html={casesHtml} page="cases" title={t('legacy.cases.title')} />;
}

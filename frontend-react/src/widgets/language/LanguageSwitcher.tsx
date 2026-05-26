import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  languageLabels,
  supportedLanguages,
  type SupportedLanguage,
} from '../../shared/i18n/i18n';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const currentLanguage = (i18n.resolvedLanguage || i18n.language) as SupportedLanguage;

  function changeLanguage(language: SupportedLanguage) {
    i18n.changeLanguage(language);
    localStorage.setItem('aiforge.language', language);
    setIsOpen(false);
  }

  return (
    <div className="language-switcher">
      <button
        type="button"
        className={`language-switcher__button${isOpen ? ' is-open' : ''}`}
        aria-expanded={isOpen}
        aria-label={t('common.changeLanguage')}
        onClick={() => setIsOpen((value) => !value)}
      >
        {languageLabels[currentLanguage] ?? languageLabels.en}
        <ChevronDown size={15} aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className="language-switcher__menu">
          {supportedLanguages.map((language) => (
            <button
              key={language}
              type="button"
              className={language === currentLanguage ? 'is-active' : undefined}
              onClick={() => changeLanguage(language)}
            >
              {languageLabels[language]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

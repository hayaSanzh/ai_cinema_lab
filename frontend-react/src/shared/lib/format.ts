export function formatDateTime(value: string, language = 'en') {
  const localeByLanguage: Record<string, string> = {
    en: 'en',
    kk: 'kk-KZ',
    ru: 'ru-RU',
  };

  return new Intl.DateTimeFormat(localeByLanguage[language] ?? 'en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return value.slice(0, 2).toUpperCase();
}

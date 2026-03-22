import { getRequestConfig } from 'next-intl/server';
import { Locale } from './types';

// Supported locales
export const locales = ['en', 'zh', 'es'] as const;

export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  es: 'Español',
};

export function getLanguageName(locale: string): string {
  const languageMap: Record<string, string> = {
    en: 'English',
    zh: 'Chinese (中文)',
    es: 'Spanish (Español)',
  };
  return languageMap[locale] || 'English';
}

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = 'en'; // fallback to default
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});

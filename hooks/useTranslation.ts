import { da, Translations } from '@/locales/da';

type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKeyOf<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

type TranslationKey = NestedKeyOf<Translations>;

function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((acc, part) => acc?.[part], obj) || path;
}

export function useTranslation() {
  const t = (key: TranslationKey | string, params?: Record<string, string | number>): string => {
    let translation = getNestedValue(da, key);

    if (params) {
      Object.keys(params).forEach((param) => {
        translation = translation.replace(`{{${param}}}`, String(params[param]));
      });
    }

    return translation;
  };

  return { t };
}

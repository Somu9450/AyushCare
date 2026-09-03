import { useKioskStore } from '../store/useKioskStore';
import en from '../loc/en.json';
import hi from '../loc/hi.json';

const dictionaries = {
  en,
  hi,
  pa: hi, // Fallback gracefully with key lookups
  bn: hi
};

export const useTranslation = () => {
  const language = useKioskStore((state) => state.language);
  const dict = dictionaries[language] || dictionaries.en;

  const t = (path, fallback = '') => {
    if (!path) return fallback;
    const parts = path.split('.');
    let current = dict;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        // Try fallback to english
        let enCurrent = dictionaries.en;
        for (const enPart of parts) {
          if (enCurrent && typeof enCurrent === 'object' && enPart in enCurrent) {
            enCurrent = enCurrent[enPart];
          } else {
            return fallback || path;
          }
        }
        return typeof enCurrent === 'string' ? enCurrent : fallback || path;
      }
    }
    return typeof current === 'string' ? current : fallback || path;
  };

  return { t, language };
};

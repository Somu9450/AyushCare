import { useKioskStore } from '../store/useKioskStore';
import en from '../loc/en.json';
import hi from '../loc/hi.json';
import pa from '../loc/pa.json';
import bn from '../loc/bn.json';

const dictionaries = {
  en,
  hi,
  pa,
  bn,
};

export const useTranslation = () => {
  const language = useKioskStore((state) => state.language);
  const dict = dictionaries[language] || dictionaries.hi;

  const t = (path, fallback = '') => {
    if (!path) return fallback;
    const parts = path.split('.');
    
    // 1. Try selected language dictionary
    let current = dict;
    let found = true;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        found = false;
        break;
      }
    }
    if (found && typeof current === 'string') return current;

    // 2. Try Hindi dictionary if selected is not English
    if (language !== 'en' && language !== 'hi') {
      let hiCurrent = dictionaries.hi;
      let hiFound = true;
      for (const part of parts) {
        if (hiCurrent && typeof hiCurrent === 'object' && part in hiCurrent) {
          hiCurrent = hiCurrent[part];
        } else {
          hiFound = false;
          break;
        }
      }
      if (hiFound && typeof hiCurrent === 'string') return hiCurrent;
    }

    // 3. Fallback to English dictionary
    let enCurrent = dictionaries.en;
    let enFound = true;
    for (const enPart of parts) {
      if (enCurrent && typeof enCurrent === 'object' && enPart in enCurrent) {
        enCurrent = enCurrent[enPart];
      } else {
        enFound = false;
        break;
      }
    }
    if (enFound && typeof enCurrent === 'string') return enCurrent;

    return fallback || path;
  };

  const isHindi = language === 'hi';
  const isPunjabi = language === 'pa';
  const isBengali = language === 'bn';
  const isIndic = language !== 'en';

  return { t, language, isHindi, isPunjabi, isBengali, isIndic };
};

export default useTranslation;

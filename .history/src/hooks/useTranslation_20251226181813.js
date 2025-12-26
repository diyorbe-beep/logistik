import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';

export const useTranslation = () => {
  const { language } = useLanguage();
  
  const t = (key) => {
    return getTranslation(language, key);
  };
  
  return { t, language };
};



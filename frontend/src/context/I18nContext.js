import React, { createContext, useContext, useEffect, useState } from "react";
import { TRANSLATIONS } from "@/i18n/translations";

const I18nContext = createContext(null);
const KEY = "drj_lang_v1";

export const I18nProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => localStorage.getItem(KEY) || "en");

  const setLang = (code) => {
    if (!TRANSLATIONS[code]) return;
    setLangState(code);
    localStorage.setItem(KEY, code);
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  return (
    <I18nContext.Provider value={{ lang, setLang, t, languages: Object.values(TRANSLATIONS) }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};

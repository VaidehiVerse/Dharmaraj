import React, { createContext, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import merge from "lodash/merge";
import i18n, { SUPPORTED_LANGUAGES } from "@/i18n/i18n";

const I18nContext = createContext(null);

function getNestedTranslations(language) {
  return i18n.getResourceBundle(language, "translation") || {};
}

export const I18nProvider = ({ children }) => {
  const { i18n: i18nInstance } = useTranslation();

  const value = useMemo(() => {
    const lang = i18nInstance.language?.split("-")[0] || "en";
    const english = getNestedTranslations("en");
    const localized = getNestedTranslations(lang);
    const t = lang === "en" ? english : merge({}, english, localized);

    return {
      lang,
      languages: SUPPORTED_LANGUAGES,
      t,
      setLang: (code) => {
        if (SUPPORTED_LANGUAGES.some((l) => l.code === code)) {
          i18nInstance.changeLanguage(code);
        }
      },
      tKey: (key, options) => i18nInstance.t(key, options),
    };
  }, [i18nInstance]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};

/** Direct react-i18next hook — use t('nav.home') in new components. */
export { useTranslation };

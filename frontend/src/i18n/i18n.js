import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en/translation.json";
import hi from "./locales/hi/translation.json";
import gu from "./locales/gu/translation.json";

export const LANG_STORAGE_KEY = "drj_lang_v1";
export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "EN", name: "English" },
  { code: "hi", label: "हिं", name: "हिंदी" },
  { code: "gu", label: "ગુ", name: "ગુજરાતી" },
];

const savedLang =
  typeof window !== "undefined" ? localStorage.getItem(LANG_STORAGE_KEY) : null;

const initialLang = SUPPORTED_LANGUAGES.some((l) => l.code === savedLang)
  ? savedLang
  : "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    gu: { translation: gu },
  },
  lng: initialLang,
  fallbackLng: "en",
  supportedLngs: ["en", "hi", "gu"],
  ns: ["translation"],
  defaultNS: "translation",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

i18n.on("languageChanged", (lng) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(LANG_STORAGE_KEY, lng);
    document.documentElement.lang = lng;
  }
});

if (typeof document !== "undefined") {
  document.documentElement.lang = initialLang;
}

export default i18n;

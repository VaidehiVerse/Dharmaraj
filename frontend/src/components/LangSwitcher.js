import React from "react";
import { useI18n } from "@/context/I18nContext";

/** Compact EN / HI / GU toggle for the header (replaces dropdown). */
export default function LangSwitcher({ className = "" }) {
  const { lang, setLang, languages } = useI18n();

  return (
    <div
      className={`inline-flex w-auto border border-[var(--drj-line)] bg-white/80 ${className}`}
      role="group"
      aria-label="Language"
      data-testid="lang-switcher-trigger"
    >
      {languages.map((l) => {
        const active = lang === l.code;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            className={`flex-1 sm:flex-none min-w-[2.25rem] px-2.5 h-9 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors border-r border-[var(--drj-line)] last:border-r-0 ${
              active
                ? "bg-forest text-white"
                : "text-[var(--drj-ink-muted)] hover:text-forest hover:bg-[var(--drj-gold-soft)]"
            }`}
            aria-pressed={active}
            aria-label={l.name}
            data-testid={`lang-option-${l.code}`}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}

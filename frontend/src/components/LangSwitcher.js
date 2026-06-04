import React from "react";
import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/context/I18nContext";

export default function LangSwitcher({ minimal = false }) {
  const { lang, setLang, languages } = useI18n();
  const current = languages.find((l) => l.code === lang);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center gap-2 px-3 h-9 border border-[var(--drj-line)] hover:border-[var(--drj-gold)] transition text-xs uppercase tracking-[0.16em] text-[var(--drj-forest)] bg-white/60"
        data-testid="lang-switcher-trigger"
      >
        <Globe size={14} />
        <span>{current?.label}</span>
        {!minimal && <span className="hidden md:inline text-[var(--drj-ink-muted)]">/ {current?.name}</span>}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white border border-[var(--drj-line)]">
        <DropdownMenuLabel className="text-overline text-[var(--drj-gold)]">Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {languages.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => setLang(l.code)}
            className="cursor-pointer flex items-center justify-between"
            data-testid={`lang-option-${l.code}`}
          >
            <span className="font-medium text-[var(--drj-forest)]">{l.name}</span>
            {lang === l.code && <Check size={14} className="text-[var(--drj-gold)]" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import React from "react";
import { Leaf, ShieldCheck, Award, Truck, Headphones, Sparkles } from "lucide-react";
import { useI18n } from "@/context/I18nContext";

/** White + gold trust strip used on Home + Product pages. */
export default function TrustStrip() {
  const { t } = useI18n();
  const items = [
    { icon: Leaf, key: "ayurvedic" },
    { icon: Sparkles, key: "premium" },
    { icon: Award, key: "made_in_india" },
    { icon: ShieldCheck, key: "secure" },
    { icon: Truck, key: "delivery" },
    { icon: Headphones, key: "support" },
  ];
  return (
    <section className="bg-white border-y border-[var(--drj-line)]" data-testid="trust-strip">
      <div className="container-drj py-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
        {items.map((it) => (
          <div key={it.key} className="trust-card" data-testid={`trust-${it.key}`}>
            <span className="w-12 h-12 flex items-center justify-center bg-[var(--drj-gold-soft)] border border-[var(--drj-gold)] text-[var(--drj-gold)]">
              <it.icon size={20} />
            </span>
            <span className="text-overline text-forest">{t.trust[it.key]}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

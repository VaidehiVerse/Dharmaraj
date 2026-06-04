import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Flame, Activity, Dumbbell, Salad, Heart, Brain, Wind, Leaf, Sparkles } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { useI18n } from "@/context/I18nContext";

/**
 * Premium radial showcase — the Vajra bottle at center, ten benefits orbiting around.
 * Positions are pre-computed for desktop. On mobile we fall back to a 2-col grid.
 */
const POD_POSITIONS = [
  { top: "4%", left: "50%", transform: "translate(-50%, 0)" },        // top
  { top: "14%", right: "4%", transform: "translate(0, 0)" },          // top-right
  { top: "40%", right: "-2%", transform: "translate(0, -50%)" },       // right
  { top: "66%", right: "4%", transform: "translate(0, 0)" },           // bottom-right
  { bottom: "4%", left: "50%", transform: "translate(-50%, 0)" },     // bottom
  { bottom: "10%", left: "6%", transform: "translate(0, 0)" },         // bottom-left
  { top: "40%", left: "-2%", transform: "translate(0, -50%)" },        // left
  { top: "14%", left: "4%", transform: "translate(0, 0)" },            // top-left
  { top: "26%", left: "32%", transform: "translate(-50%, -50%)" },     // upper-inner-left
  { top: "26%", right: "32%", transform: "translate(50%, -50%)" },     // upper-inner-right
];

export default function RadialBenefits() {
  const { t } = useI18n();
  const benefits = [
    { icon: ShieldCheck, key: "immunity" },
    { icon: Flame, key: "energy" },
    { icon: Activity, key: "stamina" },
    { icon: Dumbbell, key: "strength" },
    { icon: Salad, key: "digestion" },
    { icon: Leaf, key: "gut" },
    { icon: Brain, key: "brain" },
    { icon: Heart, key: "heart" },
    { icon: Wind, key: "lung" },
    { icon: Sparkles, key: "overall" },
  ];

  return (
    <section className="section bg-cream relative overflow-hidden" data-testid="radial-benefits-section">
      <div className="container-drj relative">
        <div className="text-center mb-12 lg:mb-16">
          <div className="drj-divider text-overline mb-4">{t.benefits.eyebrow}</div>
          <h2 className="font-serif text-4xl lg:text-5xl text-forest tracking-tight">{t.benefits.title}</h2>
          <p className="text-[var(--drj-ink-muted)] mt-4 max-w-xl mx-auto font-light">
            One bottle, ten quiet rituals. Move your cursor over each card to see how 1 Vajra works in concert.
          </p>
        </div>

        {/* DESKTOP RADIAL */}
        <div className="hidden lg:block">
          <div className="radial-orbit" data-testid="radial-orbit">
            <div className="radial-ring" />
            <div className="radial-ring-inner" />
            <div className="radial-center" data-testid="radial-bottle">
              <img src={BRAND.productImage} alt="1 Vajra" loading="lazy" />
            </div>
            {benefits.map((b, i) => (
              <motion.div
                key={b.key}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="benefit-pod"
                style={POD_POSITIONS[i]}
                data-testid={`benefit-pod-${b.key}`}
              >
                <span className="icon-wrap">
                  <b.icon size={16} />
                </span>
                <span className="label">{t.benefits[b.key]}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* MOBILE / TABLET GRID with bottle on top */}
        <div className="lg:hidden">
          <div className="flex justify-center mb-10">
            <img src={BRAND.productImage} alt="1 Vajra" className="w-48 h-auto" style={{ filter: "drop-shadow(0 18px 40px rgba(212,175,55,0.35))" }} />
          </div>
          <div className="grid grid-cols-2 gap-3" data-testid="radial-benefits-mobile">
            {benefits.map((b) => (
              <div key={b.key} className="benefit-pod !relative !top-auto !left-auto !right-auto !bottom-auto !transform-none !min-w-0 !max-w-none">
                <span className="icon-wrap">
                  <b.icon size={14} />
                </span>
                <span className="label">{t.benefits[b.key]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

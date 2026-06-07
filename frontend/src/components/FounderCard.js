import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, MapPin } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { useI18n } from "@/context/I18nContext";

/**
 * Premium founder card — gold-framed photograph, signature message,
 * trust badges. Used on both Home and About pages.
 */
export default function FounderCard({ compact = false }) {
  const { t } = useI18n();
  return (
    <section className="section bg-white relative overflow-hidden" data-testid="founder-section">
      <div className="absolute -top-32 -right-32 w-[480px] h-[480px] bg-[var(--drj-gold-soft)] opacity-40 rounded-full blur-3xl pointer-events-none" />
      <div className="container-drj relative">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5"
          >
            <div className="gold-frame">
              <div className="aspect-[4/5] overflow-hidden bg-cream relative">
                <img
                  src={BRAND.founder.photo}
                  alt={BRAND.founder.name}
                  className="w-full h-full object-cover"
                  data-testid="founder-photo"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[rgba(45,94,62,0.85)] to-transparent p-6 text-white">
                  <div className="text-overline text-[var(--drj-gold-bright)]">Founder</div>
                  <div className="font-serif text-3xl mt-1" data-testid="founder-name">{BRAND.founder.name}</div>
                  <div className="text-xs opacity-90 mt-1 flex items-center gap-1.5">
                    <MapPin size={12} /> Surat, Gujarat · India
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-7"
          >
            <div className="text-overline text-gold mb-4">{t.founder.eyebrow}</div>
            <h2 className="font-serif text-4xl lg:text-5xl text-forest tracking-tight leading-tight">
              {t.founder.title}
            </h2>

            <div className="mt-8 relative">
              <span className="absolute -top-4 -left-2 font-serif text-7xl text-[var(--drj-gold)] opacity-30 leading-none">"</span>
              <p className="text-[var(--drj-ink)] text-lg font-light leading-relaxed italic pl-6 border-l-2 border-[var(--drj-gold)]" data-testid="founder-message">
                {BRAND.founder.message}
              </p>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="w-16 h-px bg-[var(--drj-gold)]" />
              <div>
                <div className="font-serif text-2xl text-forest">{BRAND.founder.name}</div>
                <div className="text-overline text-[var(--drj-ink-muted)] mt-1">{BRAND.founder.title}</div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 max-w-md">
              <Badge icon={BadgeCheck} text="Udyam Certified" />
              <Badge icon={BadgeCheck} text="FSSAI Licensed" />
              <Badge icon={BadgeCheck} text="ISO Certified" />
              <Badge icon={BadgeCheck} text="GST Registered" />
            </div>

            {!compact && (
              <Link to="/about" className="btn-outline mt-10" data-testid="founder-cta">
                {t.founder.cta} <ArrowRight size={16} />
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const Badge = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-2 text-sm text-[var(--drj-ink)]">
    <Icon size={16} className="text-[var(--drj-gold)] shrink-0" />
    <span>{text}</span>
  </div>
);

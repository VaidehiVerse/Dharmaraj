import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import FounderCard from "@/components/FounderCard";
import { GoldDivider } from "@/components/AyurvedaArt";
import { useI18n } from "@/context/I18nContext";

export default function About() {
  const { t } = useI18n();
  const mvp = [
    { icon: Leaf, t: t.about.mission_t, d: t.about.mission_d },
    { icon: Sparkles, t: t.about.vision_t, d: t.about.vision_d },
    { icon: ShieldCheck, t: t.about.promise_t, d: t.about.promise_d },
  ];

  return (
    <div data-testid="about-page" className="bg-white">
      

      <section className="page-content">
        <div className="container-drj grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-5">
            <div className="gold-frame">
              <div className="aspect-[4/5] overflow-hidden">
                <img src="/images/father.jpeg" alt="Forest" className="w-full h-full object-cover"/>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="drj-divider text-overline mb-3">{t.about.story_eyebrow}</div>
            <h2 className="font-serif text-3xl lg:text-4xl text-forest tracking-tight leading-tight">{t.aboutPage.story_title}</h2>
            <p className="text-[var(--drj-ink-muted)] mt-5 leading-relaxed font-light">
              {t.aboutPage.story_p1}
            </p>
            <p className="text-[var(--drj-ink-muted)] mt-4 leading-relaxed font-light">
              {t.aboutPage.story_p1b}
            </p>
            <p className="text-[var(--drj-ink-muted)] mt-4 leading-relaxed font-light">
              {t.aboutPage.story_p2}
            </p>
            <p className="text-[var(--drj-ink-muted)] mt-4 leading-relaxed font-light">
              {t.aboutPage.story_p3}
            </p>
          </div>
        </div>
      </section>

      <FounderCard compact />

      <section className="section bg-cream">
        <div className="container-drj">
          <div className="text-center mb-12">
            <GoldDivider />
            <h2 className="font-serif text-4xl text-forest mt-6 tracking-tight">{t.about.mvp_title}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {mvp.map((b) => (
              <div key={b.t} className="bg-white border border-[var(--drj-line)] p-10 hover:border-gold transition" data-testid={`about-${b.t.toLowerCase()}`}>
                <span className="w-12 h-12 flex items-center justify-center bg-[var(--drj-gold-soft)] border border-[var(--drj-gold)] text-gold">
                  <b.icon size={20}/>
                </span>
                <h3 className="font-serif text-3xl text-forest mt-5">{b.t}</h3>
                <p className="text-[var(--drj-ink-muted)] mt-3 font-light leading-relaxed">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest text-white">
        <div className="container-drj py-16 lg:py-20 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="text-overline text-[var(--drj-gold-bright)] mb-2">{t.aboutPage.cta_eyebrow}</div>
            <h2 className="font-serif text-4xl lg:text-5xl tracking-tight leading-tight">{t.aboutPage.cta_title}</h2>
          </div>
          <div className="flex flex-wrap gap-4 lg:justify-end">
            <Link to="/product/1-vajra" className="btn-gold" data-testid="about-cta-buy">{t.cta.order} <ArrowRight size={16}/></Link>
            <Link to="/contact" className="btn-outline-gold" data-testid="about-cta-contact">{t.aboutPage.talk_to_us}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

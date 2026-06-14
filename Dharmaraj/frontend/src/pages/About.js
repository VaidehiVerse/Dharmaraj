import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import FounderCard from "@/components/FounderCard";
import { TulsiSprig, GoldDivider } from "@/components/AyurvedaArt";

export default function About() {
  return (
    <div data-testid="about-page" className="bg-white">

      <section className="section">
        <div className="container-drj grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <div className="gold-frame">
              <div className="aspect-[4/5] overflow-hidden">
                <img src="/images/father.jpeg" alt="Forest" className="w-full h-full object-cover"/>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="drj-divider text-overline mb-4">Our Story</div>
            <h2 className="font-serif text-4xl lg:text-5xl text-forest tracking-tight leading-tight">Selfless Service and Nature’s Blessing: A Father’s Journey</h2>
            <p className="text-[var(--drj-ink-muted)] mt-6 leading-relaxed font-light">
              Dharmaraj Ayurveda was born from a single, stubborn belief: that the wisdom of the ancients
              deserves not a museum, but a living seat at the modern table. In a market crowded with watered-down
              herbal blends and stimulant-laced "wellness", we set out to build something honest.
            </p>
            <p className="text-[var(--drj-ink-muted)] mt-4 leading-relaxed font-light">
              Each formulation begins with classical Vaidyas in Gujarat — physicians who have spent decades
              with the original Sanskrit texts. From there, every botanical is sent for HPLC standardization,
              third-party heavy-metal testing, and FSSAI-licensed manufacturing in a GMP-certified facility.
              No shortcuts. No filler. No noise.
            </p>
            <p className="text-[var(--drj-ink-muted)] mt-4 leading-relaxed font-light">
              The result is <span className="text-forest font-medium">1 Vajra</span> — and the apothecary
              we are quietly building behind it.
            </p>
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      <FounderCard compact />

      <section className="py-1 section bg-cream">
        <div className="container-drj">
          <div className="text-center mb-12">
            <GoldDivider />
            <h2 className="font-serif text-4xl text-forest mt-6 tracking-tight">Mission · Vision · Promise</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Leaf, t: "Mission", d: "To restore the integrity of Ayurvedic formulation — pure herbs, classical wisdom, modern standardization." },
              { icon: Sparkles, t: "Vision", d: "An India where every household has at least one Ayurvedic ritual that grandparents would proudly recognize." },
              { icon: ShieldCheck, t: "Promise", d: "Every bottle is a promise of pure, potent benefits, verified by rigorous third-party tests." },
            ].map((b) => (
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
        <div className="container-drj py-20 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-overline text-[var(--drj-gold-bright)] mb-3">Begin</div>
            <h2 className="font-serif text-4xl lg:text-5xl tracking-tight leading-tight">A 30-day ritual, an old promise kept.</h2>
          </div>
          <div className="flex flex-wrap gap-4 lg:justify-end">
            <Link to="/product/1-vajra" className="btn-gold" data-testid="about-cta-buy">Order 1 Vajra <ArrowRight size={16}/></Link>
            <Link to="/contact" className="btn-outline-gold" data-testid="about-cta-contact">Talk To Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

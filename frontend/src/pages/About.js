import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import { BRAND } from "@/lib/brand";

export default function About() {
  return (
    <div data-testid="about-page" className="bg-[var(--drj-bg)]">
      <section className="bg-obsidian text-white relative grain overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1612703508477-00e02a9b170c?w=2000&q=85')", backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/85 to-obsidian/30"/>
        <div className="container-drj relative py-24 lg:py-32">
          <div className="text-overline text-gold mb-4">About Us</div>
          <h1 className="font-serif text-5xl lg:text-7xl tracking-tight leading-tight">Rooted in Tradition.<br/><span className="text-gold italic">Awakened for Today.</span></h1>
          <p className="text-white/70 mt-6 max-w-2xl font-light text-lg">A quiet rebellion against shortcuts — Dharmaraj Ayurveda exists to bring the original Ayurvedic intelligence to a generation that needs it most.</p>
        </div>
      </section>

      <section className="section">
        <div className="container-drj grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <div className="aspect-[4/5] overflow-hidden">
              <img src="https://images.unsplash.com/photo-1506452305024-9d3f02d1c9b5?w=1600&q=85" alt="Forest" className="w-full h-full object-cover"/>
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="drj-divider text-overline mb-4">Our Story</div>
            <h2 className="font-serif text-4xl lg:text-5xl text-forest tracking-tight leading-tight">From Surat, with reverence.</h2>
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

      <section className="section bg-forest text-white relative overflow-hidden grain">
        <div className="container-drj relative grid md:grid-cols-3 gap-px bg-white/10">
          {[
            { icon: Leaf, t: "Mission", d: "To restore the integrity of Ayurvedic formulation — pure herbs, classical wisdom, modern standardization." },
            { icon: Sparkles, t: "Vision", d: "An India where every household has at least one Ayurvedic ritual that grandparents would proudly recognize." },
            { icon: ShieldCheck, t: "Promise", d: "Every batch is third-party tested. If your bottle doesn't honour our promise, we replace it. No questions." },
          ].map((b) => (
            <div key={b.t} className="bg-forest p-10 hover:bg-[var(--drj-forest-soft)] transition-colors" data-testid={`about-${b.t.toLowerCase()}`}>
              <b.icon size={28} className="text-gold"/>
              <h3 className="font-serif text-3xl mt-4">{b.t}</h3>
              <p className="text-white/70 mt-3 font-light leading-relaxed">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container-drj grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="drj-divider text-overline mb-4">A Note From The Founder</div>
            <h2 className="font-serif text-4xl text-forest tracking-tight leading-tight">"Ayurveda doesn't need translation. It needs trust."</h2>
            <p className="text-[var(--drj-ink-muted)] mt-6 leading-relaxed font-light">
              I grew up watching my grandmother brew Kashayam in copper vessels at 5 AM. The smell, the discipline,
              the quiet faith — it was a rhythm older than any of us. When I left Surat for the corporate world,
              I watched friends pop synthetic energy boosters at meetings, then complain of insomnia at midnight.
            </p>
            <p className="text-[var(--drj-ink-muted)] mt-4 leading-relaxed font-light">
              Dharmaraj is the answer my grandmother would have wanted. Quietly potent. Earnestly made.
              A way to bring the old rhythm back, capsule by capsule.
            </p>
            <div className="mt-8 font-serif text-2xl text-forest">— The Dharmaraj Team</div>
            <div className="text-overline text-gold mt-2">Surat, Gujarat</div>
          </div>
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="aspect-[4/5] overflow-hidden">
              <img src="https://images.pexels.com/photos/37589314/pexels-photo-37589314.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Founder" className="w-full h-full object-cover"/>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-obsidian text-white">
        <div className="container-drj py-20 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-overline text-gold mb-3">Begin</div>
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

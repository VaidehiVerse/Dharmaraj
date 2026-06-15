import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Star, Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { apiClient } from "@/lib/api";
import { BRAND, whatsappLink } from "@/lib/brand";
import { useI18n } from "@/context/I18nContext";
import TrustStrip from "@/components/TrustStrip";
import FounderCard from "@/components/FounderCard";
import { SunRays, Mountains, WaterWave, FloatingLeaf, GoldParticles, TulsiSprig, GoldDivider } from "@/components/AyurvedaArt";

const faqs = [
  { q: "How long until I feel the benefits of 1 Vajra?", a: "Most customers report noticeable energy and digestion improvements within 14–21 days. For deeper Rasayana effects, we recommend a continuous 60–90 day cycle." },
  { q: "Is 1 Vajra safe for daily long-term use?", a: "Yes. 1 Vajra is a 100% botanical formulation with classically-used herbs. It is FSSAI-licensed as a health supplement and contains no stimulants or synthetics." },
  { q: "Can women take 1 Vajra?", a: "Absolutely. Shatavari and Amla make it particularly nourishing for women. Pregnant or lactating women should consult their healthcare provider first." },
  { q: "Are there any side effects?", a: "1 Vajra is gentle and well-tolerated. Those on prescription medication or with chronic conditions should consult a Vaidya or physician before use." },
  { q: "Where do you ship and how long does it take?", a: "We ship across India. Metro cities receive orders in 2–4 working days; other locations in 4–7 working days. Free shipping above ₹999." },
];

// Awakening Soon
const customProducts = [
  {
    id: "1-vajra",
    slug: "1-vajra",
    name: "1 Vajra",
    tagline: "Ojas & Vitality Rasayana",
    image: "/images/ai-bottle-1.jpeg", 
    status: "Available",
    link: "/product/1-vajra",
    sizeClass: "max-h-[95%] w-auto object-contain p-2" 
  },
  {
    id: "prod-2",
    slug: "product-2",
    name: "Tejas Elixir",
    tagline: "Skin & Aura Glow",
    image: "/images/ai-bottle-2.jpeg", 
    status: "Soon",
    link: "#",
    sizeClass: "max-h-[95%] w-auto object-contain p-2" 
  },
  {
    id: "prod-3",
    slug: "product-3",
    name: "Prana Herbs",
    tagline: "Respiratory & Immunity",
    image: "/images/ai-bottle-3.jpeg", 
    status: "Soon",
    link: "#",
    sizeClass: "max-h-[95%] w-auto object-contain p-2" 
  },
  {
    id: "prod-4",
    slug: "product-4",
    name: "Soma Oil",
    tagline: "Tranquility & Sleep Blend",
    image: "/images/ai-bottle-4.jpeg", 
    status: "Soon",
    link: "#",
    sizeClass: "max-h-[95%] w-auto object-contain p-2" 
  },
  {
    id: "prod-5",
    slug: "product-5",
    name: "Medha Ghrutam",
    tagline: "Cognitive Focus & Memory",
    image: "/images/ai-bottle-5.jpeg", 
    status: "Soon",
    link: "#",
    sizeClass: "max-h-[95%] w-auto object-contain p-2" 
  }
];

export default function Home() {
  const [vajra, setVajra] = useState(null);
  const { t } = useI18n();

  useEffect(() => {
    apiClient.get("/products/1-vajra").then((r) => setVajra(r.data)).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative bg-cream overflow-hidden">
        <div className="hero-sun" />
        <SunRays />
        <Mountains />
        <FloatingLeaf className="float-leaf-1" color="#88b66d" size={56} rotate={-15} />
        <FloatingLeaf className="float-leaf-2" color="#4f8557" size={44} rotate={20} />
        <FloatingLeaf className="float-leaf-3" color="#88b66d" size={62} rotate={-5} />
        <FloatingLeaf className="float-leaf-4" color="#a8c89b" size={40} rotate={15} />
        <GoldParticles />

        <div className="container-drj home-hero-inner relative grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <TulsiSprig size={36} />
              <span className="text-overline text-gold">{t.hero.eyebrow}</span>
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-forest leading-[0.95] tracking-tight">
              {t.hero.title_1}
              <br />
              <span className="shimmer-text italic">{t.hero.title_2}</span>
            </h1>
            <p className="text-[var(--drj-ink-muted)] mt-8 max-w-xl text-lg font-light leading-relaxed">
              {t.hero.desc}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/product/1-vajra" className="btn-gold" data-testid="hero-buy-now">
                {t.hero.buy} <ArrowRight size={16} />
              </Link>
              <Link to="/shop" className="btn-outline" data-testid="hero-explore-benefits">
                {t.hero.explore}
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-[var(--drj-ink-muted)] uppercase tracking-[0.2em]">
              <span className="flex items-center gap-2 text-forest"><Star size={14} className="fill-gold text-gold" /> {t.hero.reviews}</span>
            </div>

            {/* Founder mini badge */}
            <Link to="/about" className="mt-8 inline-flex items-center gap-3 px-4 py-3 bg-white border border-[var(--drj-line)] hover:border-gold transition group max-w-md" data-testid="hero-founder-badge">
              <img src={BRAND.founder.photo} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-gold" />
              <div className="text-left">
                <div className="text-overline text-gold">A note from the founder</div>
                <div className="text-sm text-forest font-medium mt-0.5">{BRAND.founder.name} →</div>
              </div>
              <Sparkles size={16} className="text-gold ml-auto group-hover:scale-110 transition" />
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.15 }} className="relative z-10">
            <div className="relative aspect-square max-w-lg mx-auto flex items-center justify-center">
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[var(--drj-gold-soft)] to-transparent opacity-70" />
              <div className="absolute inset-6 rounded-full border-2 border-dashed border-[var(--drj-gold)] opacity-60 animate-[ringRotate_60s_linear_infinite]" />

              <img
                src={BRAND.heroProductImage} 
                alt="Dharmaraj Ayurveda Vajra health supplement bottle"
                className="relative z-10 max-h-[80%] w-auto object-contain mx-auto drop-shadow-xl"
              />
              <div className="absolute -bottom-4 -right-4 bg-white border border-[var(--drj-gold)] p-5 shadow-xl">
                <div className="text-overline text-gold">From</div>
                <div className="font-serif text-3xl text-forest leading-none mt-1">₹999</div>
                <div className="text-xs text-[var(--drj-ink-muted)] mt-1">60 caps · 30 days</div>
              </div>
            </div>
          </motion.div>
        </div>

        <WaterWave />
      </section>

      {/* TRUST STRIP */}
      <TrustStrip />

      {/* FOUNDER */}
      <FounderCard />

      {/* TESTIMONIALS (VOICES FROM THE CIRCLE) */}
      <section className="mb-2 mb-4 bg-white">
        <div className="container-drj">
          {/* 🛠️ Tightened margin bottom from mb-12 to mb-8 */}
          <div className="text-center mb-8">
            <GoldDivider className="mb-4" />
            <div className="drj-divider text-overline mb-4">Voices from the Circle</div>
            <h2 className="font-serif text-4xl lg:text-5xl text-forest tracking-tight">Trusted across India.</h2>
          </div>
          <Testimonials vajra={vajra} />
        </div>
      </section>

      {/* AWAKENING SOON */}
      <section className="section bg-cream">
        <div className="container-drj">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <div className="drj-divider text-overline mb-4">Awakening Soon</div>
              <h2 className="font-serif text-4xl lg:text-5xl text-forest tracking-tight">The Dharmaraj Apothecary.</h2>
            </div>
            <Link to="/shop" className="btn-outline" data-testid="shop-all-cta">View All <ArrowRight size={16}/></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6" data-testid="coming-soon-grid">
            {customProducts.map((p) => (
              <Link key={p.id} to={p.link} className="group block bg-white border border-[var(--drj-line)] hover:border-gold transition" data-testid={`coming-soon-${p.slug}`}>
                <div className="aspect-[4/5] overflow-hidden relative bg-cream flex items-center justify-center">
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    className={`group-hover:scale-105 transition-transform duration-700 ${p.sizeClass}`} 
                  />
                  <span className="absolute top-3 left-3 bg-forest text-[var(--drj-gold-bright)] px-2 py-1 text-[9px] tracking-[0.2em] uppercase">
                    {p.status}
                  </span>
                </div>
                <div className="p-5">
                  <div className="font-serif text-lg text-forest leading-tight">{p.name}</div>
                  <div className="text-overline text-gold mt-1">{p.tagline}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="section bg-white border-t border-[var(--drj-line)]">
        <div className="container-drj text-center mb-16">
          <div className="drj-divider text-overline mb-4">Follow the Journey</div>
          <h2 className="font-serif text-4xl text-forest">@dharmarajayurveda</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6 px-4 py-4 bg-[var(--drj-line)]" data-testid="instagram-feed">
          {[
            { type: "video", src: "/images/journey-video-1.mp4" },
            { type: "video", src: "/images/journey-video-2.mp4" },
            { type: "video", src: "/images/journey-video-3.mp4" },
            { type: "video", src: "/images/journey-video-4.mp4" },
            { type: "video", src: "/images/journey-video-5.mp4" },
            { type: "video", src: "/images/journey-video-6.mp4" },
          ].slice(0, 6).map((item, i) => (
            <a key={i} href={BRAND.instagram} target="_blank" rel="noreferrer" className="block aspect-[9/16] overflow-hidden relative group bg-white" data-testid={`ig-tile-${i}`}>
              <video
                src={item.src}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-forest/0 group-hover:bg-forest/40 transition-colors flex items-center justify-center">
                <i className="fa-brands fa-instagram text-2xl text-white opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-cream">
        <div className="container-drj grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <div className="drj-divider text-overline mb-4">Questions</div>
            <h2 className="font-serif text-4xl lg:text-5xl text-forest tracking-tight">Curious minds answered.</h2>
            <p className="text-[var(--drj-ink-muted)] mt-5 font-light">For anything else, our wellness desk is one WhatsApp away.</p>
            <a href={whatsappLink()} target="_blank" rel="noreferrer" className="btn-outline-gold mt-6" data-testid="faq-whatsapp-cta">
              <i className="fa-brands fa-whatsapp"></i> Ask on WhatsApp
            </a>
          </div>
          <div className="lg:col-span-8">
            <Accordion type="single" collapsible className="border-t border-[var(--drj-line-strong)]">
              {faqs.map((f, idx) => (
                <AccordionItem key={idx} value={`faq-${idx}`} className="border-b border-[var(--drj-line-strong)]" data-testid={`faq-item-${idx}`}>
                  <AccordionTrigger className="text-left font-serif text-xl text-forest hover:no-underline py-6">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-[var(--drj-ink-muted)] leading-relaxed font-light pb-6">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="bg-forest text-white relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-[var(--drj-gold)] opacity-10 rounded-full blur-3xl" />
        <div className="container-drj py-20 lg:py-24 grid lg:grid-cols-2 gap-10 items-center relative">
          <div>
            <div className="text-overline text-[var(--drj-gold-bright)] mb-3">Begin Your Ritual</div>
            <h2 className="font-serif text-4xl lg:text-5xl tracking-tight leading-tight">Rise. Grow. With Dharmaraj.</h2>
          </div>
          <div className="flex flex-wrap gap-4 lg:justify-end">
            <Link to="/product/1-vajra" className="btn-gold" data-testid="bottom-cta-buy">{t.cta.order} <ArrowRight size={16}/></Link>
            <Link to="/contact" className="btn-outline-gold" data-testid="bottom-cta-contact">{t.cta.contact}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const Testimonials = ({ vajra }) => {
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    if (vajra?.id) {
      apiClient.get(`/reviews/${vajra.id}`).then((rev) => setReviews(rev.data.slice(0, 6))).catch(() => {});
    } else {
      apiClient.get("/products/1-vajra").then((r) => {
        apiClient.get(`/reviews/${r.data.id}`).then((rev) => setReviews(rev.data.slice(0, 6)));
      }).catch(() => {});
    }
  }, [vajra]);

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="testimonials-grid">
      {reviews.map((r) => (
        <div key={r.id} className="bg-cream border border-[var(--drj-line)] p-8 hover:border-gold transition" data-testid={`testimonial-${r.id}`}>
          <div className="flex text-gold mb-4">{Array.from({length: r.rating}).map((_,i)=>(<Star key={i} size={14} className="fill-gold text-gold"/>))}</div>
          <h3 className="font-serif text-xl text-forest mb-3">{r.title}</h3>
          <p className="text-sm text-[var(--drj-ink-muted)] leading-relaxed font-light">"{r.comment}"</p>
          <div className="mt-6 pt-4 border-t border-[var(--drj-line)] text-xs">
            <div className="font-medium text-forest">{r.name}</div>
            <div className="text-[var(--drj-ink-muted)] mt-1">{r.location} · Verified Buyer</div>
          </div>
        </div>
      ))}
    </div>
  );
};
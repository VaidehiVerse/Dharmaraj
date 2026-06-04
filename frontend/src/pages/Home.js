import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Star, Sparkles, BadgeCheck } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { apiClient, inr } from "@/lib/api";
import { BRAND, whatsappLink } from "@/lib/brand";
import { useCart } from "@/context/CartContext";
import { useI18n } from "@/context/I18nContext";
import TrustStrip from "@/components/TrustStrip";
import RadialBenefits from "@/components/RadialBenefits";
import FounderCard from "@/components/FounderCard";
import { SunRays, Mountains, WaterWave, FloatingLeaf, GoldParticles, TulsiSprig, GoldDivider } from "@/components/AyurvedaArt";

const faqs = [
  { q: "How long until I feel the benefits of 1 Vajra?", a: "Most customers report noticeable energy and digestion improvements within 14–21 days. For deeper Rasayana effects, we recommend a continuous 60–90 day cycle." },
  { q: "Is 1 Vajra safe for daily long-term use?", a: "Yes. 1 Vajra is a 100% botanical formulation with classically-used herbs. It is FSSAI-licensed as a health supplement and contains no stimulants or synthetics." },
  { q: "Can women take 1 Vajra?", a: "Absolutely. Shatavari and Amla make it particularly nourishing for women. Pregnant or lactating women should consult their healthcare provider first." },
  { q: "Are there any side effects?", a: "1 Vajra is gentle and well-tolerated. Those on prescription medication or with chronic conditions should consult a Vaidya or physician before use." },
  { q: "Where do you ship and how long does it take?", a: "We ship across India. Metro cities receive orders in 2–4 working days; other locations in 4–7 working days. Free shipping above ₹999." },
];

export default function Home() {
  const [vajra, setVajra] = useState(null);
  const [products, setProducts] = useState([]);
  const { addItem } = useCart();
  const { t } = useI18n();

  useEffect(() => {
    apiClient.get("/products/1-vajra").then((r) => setVajra(r.data)).catch(() => {});
    apiClient.get("/products", { params: { coming_soon: true } }).then((r) => setProducts(r.data)).catch(() => {});
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

        <div className="container-drj relative grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-16 lg:py-28">
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
              <a href="#benefits" className="btn-outline" data-testid="hero-explore-benefits">
                {t.hero.explore}
              </a>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-[var(--drj-ink-muted)] uppercase tracking-[0.2em]">
              <span className="flex items-center gap-2 text-forest"><Star size={14} className="fill-gold text-gold" /> {t.hero.reviews}</span>
              <span className="flex items-center gap-1.5"><BadgeCheck size={14} className="text-gold" /> FSSAI · ISO · GMP</span>
              <span>60 Veg Capsules</span>
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
            <div className="relative aspect-square max-w-md mx-auto flex items-center justify-center">
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-[var(--drj-gold-soft)] to-white opacity-90" />
              <div className="absolute inset-12 rounded-full border-2 border-dashed border-[var(--drj-gold)] opacity-60 animate-[ringRotate_60s_linear_infinite]" />
              <img src={BRAND.productImage} alt="1 Vajra" className="relative z-10 w-3/4 h-auto" style={{ filter: "drop-shadow(0 30px 60px rgba(212,175,55,0.4))" }} />
              <div className="absolute -bottom-4 -right-4 bg-white border border-[var(--drj-gold)] p-5 shadow-xl">
                <div className="text-overline text-gold">From</div>
                <div className="font-serif text-3xl text-forest leading-none mt-1">₹1,299</div>
                <div className="text-xs text-[var(--drj-ink-muted)] mt-1">60 caps · 30 days</div>
              </div>
            </div>
          </motion.div>
        </div>

        <WaterWave />
      </section>

      {/* TRUST STRIP */}
      <TrustStrip />

      {/* WHY AYURVEDA */}
      <section className="section bg-sand">
        <div className="container-drj grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <div className="gold-frame">
              <div className="aspect-[4/5] overflow-hidden">
                <img src="https://images.pexels.com/photos/37589314/pexels-photo-37589314.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Meditating in nature" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="drj-divider text-overline mb-6">Why Ayurveda</div>
            <h2 className="font-serif text-4xl lg:text-5xl text-forest tracking-tight leading-tight">
              A 5,000-year-old science of harmony — distilled into a daily ritual.
            </h2>
            <p className="text-[var(--drj-ink-muted)] mt-6 leading-relaxed text-lg font-light">
              Ayurveda doesn't isolate symptoms — it nourishes the source. Standardized botanical
              extracts work in concert with your body's intelligence, building strength quietly
              from within. No stimulants. No crashes. Just deep, durable wellness.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 mt-10">
              {[
                { num: "9", label: "Standardized Herbs" },
                { num: "60", label: "Veg Capsules" },
                { num: "30-Day", label: "Wellness Cycle" },
              ].map((s) => (
                <div key={s.label} className="border-l-2 border-gold pl-4">
                  <div className="font-serif text-4xl text-forest">{s.num}</div>
                  <div className="text-overline text-[var(--drj-ink-muted)] mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RADIAL BENEFITS (with anchor) */}
      <div id="benefits"><RadialBenefits /></div>

      {/* INGREDIENTS DEEP DIVE */}
      {vajra && (
        <section className="section bg-cream relative overflow-hidden">
          <div className="container-drj relative">
            <div className="grid lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-4 lg:sticky lg:top-32">
                <div className="text-overline text-gold mb-4">The Formula</div>
                <h2 className="font-serif text-4xl lg:text-5xl tracking-tight leading-tight text-forest">
                  Nine herbs.<br />One quiet revolution.
                </h2>
                <p className="text-[var(--drj-ink-muted)] mt-6 leading-relaxed font-light">
                  Each capsule of 1 Vajra is a precision blend of standardized botanicals.
                  Not raw powder — extracts measured for potency the way classical
                  Rasashastra demanded.
                </p>
                <Link to="/product/1-vajra" className="btn-primary mt-8" data-testid="ingredients-cta">
                  Explore Full Formula <ArrowRight size={16} />
                </Link>
              </div>
              <div className="lg:col-span-8 grid sm:grid-cols-2 gap-3">
                {vajra.ingredients.map((ing, i) => (
                  <motion.div
                    key={ing.name}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.04 }}
                    className="bg-white border border-[var(--drj-line)] p-6 hover:border-gold transition-all"
                    data-testid={`ingredient-${ing.name.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-serif text-2xl text-forest">{ing.name}</h3>
                      <span className="text-overline text-gold whitespace-nowrap">{ing.qty}</span>
                    </div>
                    <div className="text-xs italic text-[var(--drj-ink-muted)] mt-1">{ing.botanical}</div>
                    <div className="text-xs text-gold mt-3">{ing.std}</div>
                    <p className="text-sm text-[var(--drj-ink-muted)] mt-2">{ing.benefit}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FOUNDER */}
      <FounderCard />

      {/* FEATURED PRODUCT */}
      {vajra && (
        <section className="section bg-sand">
          <div className="container-drj grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-square bg-white border border-[var(--drj-gold)] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-12 rounded-full bg-[var(--drj-gold-soft)] opacity-50" />
              <img src={vajra.images[0]} alt="1 Vajra" className="relative z-10 w-3/4 h-auto" style={{ filter: "drop-shadow(0 24px 50px rgba(212,175,55,0.4))" }} />
              <span className="absolute top-6 left-6 bg-gold text-white px-3 py-1 text-[10px] tracking-[0.22em] uppercase font-semibold">Flagship</span>
            </div>
            <div>
              <div className="text-overline text-gold mb-3">Featured Product</div>
              <h2 className="font-serif text-5xl lg:text-6xl text-forest tracking-tight">1 Vajra</h2>
              <p className="text-overline text-[var(--drj-ink-muted)] mt-3">{vajra.tagline}</p>
              <div className="flex items-center gap-2 mt-5 text-sm">
                <div className="flex">{[1,2,3,4,5].map((s)=>(<Star key={s} size={14} className="fill-gold text-gold"/>))}</div>
                <span className="font-medium text-forest">{vajra.rating}</span>
                <span className="text-[var(--drj-ink-muted)]">· {vajra.review_count} verified reviews</span>
              </div>
              <p className="text-[var(--drj-ink-muted)] mt-6 leading-relaxed font-light">{vajra.short_description}</p>
              <div className="flex items-baseline gap-3 mt-8">
                <span className="font-serif text-4xl text-forest">{inr(vajra.price)}</span>
                <span className="text-lg line-through text-[var(--drj-ink-muted)]">{inr(vajra.mrp)}</span>
                <span className="text-xs px-2 py-1 bg-[var(--drj-gold-soft)] text-forest border border-[var(--drj-gold)]">SAVE {Math.round((1-vajra.price/vajra.mrp)*100)}%</span>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={() => addItem(vajra, 1)} className="btn-primary" data-testid="featured-add-to-cart">
                  {t.cta.add_to_cart} <ArrowRight size={16}/>
                </button>
                <Link to="/product/1-vajra" className="btn-outline" data-testid="featured-view-details">{t.cta.details}</Link>
                <a href={whatsappLink()} target="_blank" rel="noreferrer" className="btn-outline-gold" data-testid="featured-whatsapp">
                  <i className="fa-brands fa-whatsapp"></i> WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      <section className="section bg-white">
        <div className="container-drj">
          <div className="text-center mb-12">
            <GoldDivider className="mb-4" />
            <div className="drj-divider text-overline mb-4">Voices from the Circle</div>
            <h2 className="font-serif text-4xl lg:text-5xl text-forest tracking-tight">Trusted across India.</h2>
          </div>
          <Testimonials />
        </div>
      </section>

      {/* COMING SOON */}
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
            {products.map((p) => (
              <Link key={p.id} to="#" className="group block bg-white border border-[var(--drj-line)] hover:border-gold transition" data-testid={`coming-soon-${p.slug}`}>
                <div className="aspect-[4/5] overflow-hidden relative bg-cream">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <span className="absolute top-3 left-3 bg-forest text-[var(--drj-gold-bright)] px-2 py-1 text-[9px] tracking-[0.2em] uppercase">Soon</span>
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
        <div className="container-drj text-center mb-12">
          <div className="drj-divider text-overline mb-4">Follow the Journey</div>
          <h2 className="font-serif text-4xl text-forest">@dharmarajayurveda</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-[var(--drj-line)]" data-testid="instagram-feed">
          {[
            "https://images.unsplash.com/photo-1716816211590-c15a328a5ff0?w=600&q=85",
            "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=600&q=85",
            "https://images.unsplash.com/photo-1506452305024-9d3f02d1c9b5?w=600&q=85",
            "https://images.unsplash.com/photo-1612703508477-00e02a9b170c?w=600&q=85",
            "https://images.unsplash.com/photo-1524863479829-916d8e77f114?w=600&q=85",
            "https://images.pexels.com/photos/37589314/pexels-photo-37589314.jpeg?auto=compress&cs=tinysrgb&w=600",
          ].map((src, i) => (
            <a key={i} href={BRAND.instagram} target="_blank" rel="noreferrer" className="block aspect-square overflow-hidden relative group bg-white" data-testid={`ig-tile-${i}`}>
              <img src={src} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
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

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    apiClient.get("/products/1-vajra").then((r) => {
      apiClient.get(`/reviews/${r.data.id}`).then((rev) => setReviews(rev.data.slice(0, 6)));
    }).catch(()=>{});
  }, []);
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

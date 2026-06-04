import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Star, ShieldCheck, Leaf, Award, Truck, Headphones, Heart, Sparkles, Flame, Brain, Wind, Salad, Mountain } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { apiClient, inr } from "@/lib/api";
import { BRAND, whatsappLink } from "@/lib/brand";
import { useCart } from "@/context/CartContext";

const benefits = [
  { icon: ShieldCheck, title: "Immunity", desc: "Giloy, Amla & Tulsi power the body's innate defense." },
  { icon: Flame, title: "Strength & Stamina", desc: "Ashwagandha and White Musli for lasting vitality." },
  { icon: Brain, title: "Focus & Calm", desc: "Adaptogens that quiet stress and sharpen the mind." },
  { icon: Salad, title: "Digestion", desc: "Trikatu kindles Agni for clean nutrient absorption." },
  { icon: Heart, title: "Heart Wellness", desc: "Antioxidant-rich botanicals for a healthy heart." },
  { icon: Wind, title: "Lung Health", desc: "Pippali & Tulsi support clear, easy breathing." },
];

const trustItems = [
  { icon: Leaf, label: "100% Botanical" },
  { icon: Award, label: "FSSAI · ISO · GMP" },
  { icon: ShieldCheck, label: "Secure Payments" },
  { icon: Truck, label: "Pan-India Delivery" },
  { icon: Headphones, label: "Vaidya Support" },
  { icon: Sparkles, label: "30-Day Promise" },
];

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

  useEffect(() => {
    apiClient.get("/products/1-vajra").then((r) => setVajra(r.data)).catch(() => {});
    apiClient.get("/products", { params: { coming_soon: true } }).then((r) => setProducts(r.data)).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative bg-obsidian overflow-hidden grain">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1506452305024-9d3f02d1c9b5?crop=entropy&cs=srgb&fm=jpg&w=2400&q=85')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/85 to-obsidian/40" />
        <div className="container-drj relative grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-20 lg:py-32">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center gap-3 mb-6">
              <span className="drj-divider text-overline">Est. Surat · Gujarat</span>
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-[var(--drj-bg)] leading-[0.95] tracking-tight">
              Ancient Ayurveda,<br />
              <span className="text-gold italic">Modern Wellness.</span>
            </h1>
            <p className="text-white/70 mt-8 max-w-xl text-lg font-light leading-relaxed">
              Meet <span className="text-gold">1 Vajra</span> — a 100% botanical formula of nine
              standardized herbal extracts, crafted to awaken immunity, stamina and vitality the
              way classical Ayurveda intended.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/product/1-vajra" className="btn-gold" data-testid="hero-buy-now">
                Buy 1 Vajra <ArrowRight size={16} />
              </Link>
              <Link to="/about" className="btn-outline-gold" data-testid="hero-learn-more">
                Our Story
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-white/60 uppercase tracking-[0.2em]">
              <span className="flex items-center gap-2"><Star size={14} className="fill-gold text-gold" /> 4.9 · 247+ reviews</span>
              <span>FSSAI · ISO · GMP</span>
              <span>60 Veg Capsules</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 border border-gold/30 rotate-3"></div>
              <div className="absolute inset-0 border border-gold/15 -rotate-3"></div>
              <div className="relative bg-obsidian-2 h-full overflow-hidden border border-gold/40">
                <img src={BRAND.productLabel} alt="1 Vajra" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-[var(--drj-gold)] text-obsidian p-6 max-w-[180px] hidden sm:block">
                <div className="text-overline">From</div>
                <div className="font-serif text-3xl leading-none mt-1">₹1,299</div>
                <div className="text-xs mt-1 opacity-80">60 caps · 30 days</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-[var(--drj-line)] bg-white">
        <div className="container-drj py-8 grid grid-cols-2 md:grid-cols-6 gap-6">
          {trustItems.map((t) => (
            <div key={t.label} className="flex flex-col items-center text-center gap-2" data-testid={`trust-${t.label.toLowerCase().replace(/\s|·/g, "-")}`}>
              <t.icon size={22} className="text-forest" />
              <span className="text-overline text-[var(--drj-ink)]">{t.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* WHY AYURVEDA */}
      <section className="section bg-[var(--drj-bg)]">
        <div className="container-drj grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src="https://images.pexels.com/photos/37589314/pexels-photo-37589314.jpeg?auto=compress&cs=tinysrgb&w=1600"
                alt="Meditating in nature"
                className="w-full h-full object-cover"
              />
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
                <div key={s.label} className="border-l-2 border-gold pl-4" data-testid={`stat-${s.label.toLowerCase().replace(/\s|-/g, "-")}`}>
                  <div className="font-serif text-4xl text-forest">{s.num}</div>
                  <div className="text-overline text-[var(--drj-ink-muted)] mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS BENTO */}
      <section className="section bg-white border-y border-[var(--drj-line)]">
        <div className="container-drj">
          <div className="text-center mb-16">
            <div className="drj-divider text-overline mb-4">Benefits of 1 Vajra</div>
            <h2 className="font-serif text-4xl lg:text-5xl text-forest tracking-tight">Twelve quiet shifts in your wellbeing.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--drj-line)]" data-testid="benefits-grid">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="bg-white p-10 hover:bg-[var(--drj-bg)] transition-colors"
              >
                <b.icon size={28} className="text-gold" />
                <h3 className="font-serif text-2xl text-forest mt-6">{b.title}</h3>
                <p className="text-sm text-[var(--drj-ink-muted)] mt-3 leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* INGREDIENTS DEEP DIVE */}
      {vajra && (
        <section className="section bg-forest text-white relative overflow-hidden grain">
          <div className="container-drj relative">
            <div className="grid lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-4 lg:sticky lg:top-32">
                <div className="text-overline text-gold mb-4">The Formula</div>
                <h2 className="font-serif text-4xl lg:text-5xl tracking-tight leading-tight">Nine herbs.<br />One quiet revolution.</h2>
                <p className="text-white/70 mt-6 leading-relaxed font-light">
                  Each capsule of 1 Vajra is a precision blend of standardized botanicals.
                  Not raw powder — extracts measured for potency the way classical
                  Rasashastra demanded.
                </p>
                <Link to="/product/1-vajra" className="btn-outline-gold mt-8" data-testid="ingredients-cta">
                  Explore Full Formula <ArrowRight size={16} />
                </Link>
              </div>
              <div className="lg:col-span-8 grid sm:grid-cols-2 gap-px bg-white/10">
                {vajra.ingredients.map((ing) => (
                  <div key={ing.name} className="bg-forest p-7 hover:bg-[var(--drj-forest-soft)] transition-colors" data-testid={`ingredient-${ing.name.toLowerCase().replace(/\s+/g, "-")}`}>
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-serif text-2xl">{ing.name}</h3>
                      <span className="text-overline text-gold whitespace-nowrap">{ing.qty}</span>
                    </div>
                    <div className="text-xs italic text-white/50 mt-1">{ing.botanical}</div>
                    <div className="text-xs text-gold mt-3">{ing.std}</div>
                    <p className="text-sm text-white/70 mt-2">{ing.benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FEATURED PRODUCT */}
      {vajra && (
        <section className="section bg-[var(--drj-bg)]">
          <div className="container-drj grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-square bg-obsidian overflow-hidden">
              <img src={vajra.images[0]} alt="1 Vajra" className="w-full h-full object-cover" />
              <span className="absolute top-6 left-6 bg-gold text-obsidian px-3 py-1 text-[10px] tracking-[0.22em] uppercase font-semibold">Flagship</span>
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
                <span className="text-xs px-2 py-1 bg-[var(--drj-gold)]/20 text-forest">SAVE {Math.round((1-vajra.price/vajra.mrp)*100)}%</span>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={() => addItem(vajra, 1)} className="btn-primary" data-testid="featured-add-to-cart">
                  Add to Cart <ArrowRight size={16}/>
                </button>
                <Link to="/product/1-vajra" className="btn-outline" data-testid="featured-view-details">View Details</Link>
                <a href={whatsappLink()} target="_blank" rel="noreferrer" className="btn-outline-gold" data-testid="featured-whatsapp">
                  <i className="fa-brands fa-whatsapp"></i> WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* BEFORE / AFTER */}
      <section className="section bg-white border-y border-[var(--drj-line)]">
        <div className="container-drj">
          <div className="text-center mb-14">
            <div className="drj-divider text-overline mb-4">Real Transformations</div>
            <h2 className="font-serif text-4xl lg:text-5xl text-forest tracking-tight">Before · After 60 days</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-[var(--drj-line)]" data-testid="before-after-grid">
            {[
              { name: "Rohan, 32", before: "Tired by 4pm, low gym stamina", after: "Sharper focus, 30% better workout recovery", img: "https://images.unsplash.com/photo-1524863479829-916d8e77f114?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85" },
              { name: "Aanya, 28", before: "Bloating, low immunity in season-change", after: "Settled digestion, no cold for 4 months", img: "https://images.unsplash.com/photo-1506452305024-9d3f02d1c9b5?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85" },
              { name: "Vikram, 41", before: "Stress + irregular sleep", after: "Calmer mind, deep restorative sleep", img: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85" },
            ].map((t) => (
              <div key={t.name} className="bg-white p-8 flex flex-col">
                <div className="aspect-[4/3] overflow-hidden mb-6"><img src={t.img} alt={t.name} className="w-full h-full object-cover"/></div>
                <div className="font-serif text-2xl text-forest">{t.name}</div>
                <div className="text-overline text-gold mt-2">Before</div>
                <p className="text-sm text-[var(--drj-ink-muted)] mt-1">{t.before}</p>
                <div className="text-overline text-forest mt-4">After 60 days</div>
                <p className="text-sm text-forest mt-1">{t.after}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section bg-[var(--drj-bg)]">
        <div className="container-drj">
          <div className="text-center mb-14">
            <div className="drj-divider text-overline mb-4">Voices from the Circle</div>
            <h2 className="font-serif text-4xl lg:text-5xl text-forest tracking-tight">Trusted across India.</h2>
          </div>
          <Testimonials />
        </div>
      </section>

      {/* OUR STORY TEASER */}
      <section className="section bg-obsidian text-white relative overflow-hidden grain">
        <div className="container-drj grid lg:grid-cols-2 gap-16 items-center relative">
          <div>
            <div className="text-overline text-gold mb-4">The Dharmaraj Story</div>
            <h2 className="font-serif text-4xl lg:text-5xl tracking-tight leading-tight">
              Born in Surat. Grounded in Sanatan Ayurveda.
            </h2>
            <p className="text-white/70 mt-6 font-light leading-relaxed">
              Dharmaraj Ayurveda was founded with a single conviction: that the wisdom of our
              forefathers deserves a modern voice. We work with classical Vaidyas, modern
              standardization labs, and FSSAI-certified facilities to craft formulations that
              honour the old and serve the new.
            </p>
            <Link to="/about" className="btn-outline-gold mt-8 inline-flex" data-testid="story-cta">
              Read the Full Story <ArrowRight size={16}/>
            </Link>
          </div>
          <div className="aspect-[5/6] overflow-hidden">
            <img src="https://images.unsplash.com/photo-1612703508477-00e02a9b170c?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85" alt="Forest" className="w-full h-full object-cover"/>
          </div>
        </div>
      </section>

      {/* COMING SOON */}
      <section className="section bg-white">
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
              <Link key={p.id} to="#" className="group block bg-[var(--drj-bg)] border border-[var(--drj-line)]" data-testid={`coming-soon-${p.slug}`}>
                <div className="aspect-[4/5] overflow-hidden relative">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <span className="absolute top-3 left-3 bg-obsidian text-gold px-2 py-1 text-[9px] tracking-[0.2em] uppercase">Soon</span>
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
      <section className="section bg-[var(--drj-bg)] border-t border-[var(--drj-line)]">
        <div className="container-drj text-center mb-12">
          <div className="drj-divider text-overline mb-4">Follow the Journey</div>
          <h2 className="font-serif text-4xl text-forest">@dharmarajayurveda</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px" data-testid="instagram-feed">
          {[
            "https://images.unsplash.com/photo-1716816211590-c15a328a5ff0?w=600&q=85",
            "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=600&q=85",
            "https://images.unsplash.com/photo-1506452305024-9d3f02d1c9b5?w=600&q=85",
            "https://images.unsplash.com/photo-1612703508477-00e02a9b170c?w=600&q=85",
            "https://images.unsplash.com/photo-1524863479829-916d8e77f114?w=600&q=85",
            "https://images.pexels.com/photos/37589314/pexels-photo-37589314.jpeg?auto=compress&cs=tinysrgb&w=600",
          ].map((src, i) => (
            <a key={i} href={BRAND.instagram} target="_blank" rel="noreferrer" className="block aspect-square overflow-hidden relative group" data-testid={`ig-tile-${i}`}>
              <img src={src} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
              <div className="absolute inset-0 bg-obsidian/0 group-hover:bg-obsidian/40 transition-colors flex items-center justify-center">
                <i className="fa-brands fa-instagram text-2xl text-white opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-white border-t border-[var(--drj-line)]">
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
            <Accordion type="single" collapsible className="border-t border-[var(--drj-line)]">
              {faqs.map((f, idx) => (
                <AccordionItem key={idx} value={`faq-${idx}`} className="border-b border-[var(--drj-line)]" data-testid={`faq-item-${idx}`}>
                  <AccordionTrigger className="text-left font-serif text-xl text-forest hover:no-underline py-6">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-[var(--drj-ink-muted)] leading-relaxed font-light pb-6">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="bg-forest text-white">
        <div className="container-drj py-20 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-overline text-gold mb-3">Begin Your Ritual</div>
            <h2 className="font-serif text-4xl lg:text-5xl tracking-tight leading-tight">Rise. Grow. With Dharmaraj.</h2>
          </div>
          <div className="flex flex-wrap gap-4 lg:justify-end">
            <Link to="/product/1-vajra" className="btn-gold" data-testid="bottom-cta-buy">Order 1 Vajra <ArrowRight size={16}/></Link>
            <Link to="/contact" className="btn-outline-gold" data-testid="bottom-cta-contact">Contact Us</Link>
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
        <div key={r.id} className="bg-white border border-[var(--drj-line)] p-8" data-testid={`testimonial-${r.id}`}>
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

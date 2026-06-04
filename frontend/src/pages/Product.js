import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Plus, Minus, ShieldCheck, Truck, Leaf, Award, ArrowRight, Sparkles, FlaskConical, Beaker, Sun, Heart } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { apiClient, inr } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { whatsappLink, BRAND } from "@/lib/brand";
import { toast } from "sonner";
import RadialBenefits from "@/components/RadialBenefits";
import TrustStrip from "@/components/TrustStrip";

const HOW_IT_WORKS = [
  { icon: Beaker, title: "Standardized Extracts", desc: "We use HPLC-verified extracts (5% Withanolides, 95% Curcuminoids) instead of raw powders — guaranteeing precise potency in every capsule." },
  { icon: FlaskConical, title: "Synergistic Blending", desc: "Trikatu (Ginger + Piper) is paired with Ashwagandha & Shatavari to multiply absorption (up to 2000% via piperine) and balance Vata-Pitta-Kapha." },
  { icon: Sun, title: "Daily Rasayana Ritual", desc: "Two capsules with warm milk activate dormant Ojas. Over 30 days, immunity, stamina and clarity build quietly from within." },
];

export default function Product() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("description");
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, title: "", comment: "" });
  const { addItem, setDrawerOpen } = useCart();
  const { user } = useAuth();
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    if (!user) return;
    apiClient.get("/me/wishlist").then((r) => setInWishlist(r.data.some((p) => p.slug === slug))).catch(() => {});
  }, [user, slug]);

  const toggleWishlist = async () => {
    if (!user) { toast.info("Sign in to save favourites"); return; }
    try {
      if (inWishlist) {
        await apiClient.delete(`/me/wishlist/${slug}`);
        setInWishlist(false);
        toast.success("Removed from wishlist");
      } else {
        await apiClient.post(`/me/wishlist/${slug}`);
        setInWishlist(true);
        toast.success("Added to wishlist");
      }
    } catch { toast.error("Could not update wishlist"); }
  };

  useEffect(() => {
    apiClient.get(`/products/${slug}`).then((r) => {
      setProduct(r.data);
      apiClient.get(`/reviews/${r.data.id}`).then((rev) => setReviews(rev.data));
    });
  }, [slug]);

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const { data } = await apiClient.post("/reviews", { ...reviewForm, product_id: product.id });
      setReviews((curr) => [data, ...curr]);
      setReviewForm({ name: "", rating: 5, title: "", comment: "" });
      toast.success("Thank you for sharing your experience.");
    } catch {
      toast.error("Could not submit review");
    }
  };

  if (!product) return <div className="container-drj py-32 text-center text-[var(--drj-ink-muted)]">Loading...</div>;

  const handleAdd = () => {
    addItem(product, qty);
    toast.success(`${product.name} × ${qty} added to cart`);
  };

  return (
    <div data-testid="product-page" className="bg-white">
      <div className="container-drj py-6 text-xs text-[var(--drj-ink-muted)]">
        <Link to="/" className="hover:text-forest">Home</Link> <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-forest">Shop</Link> <span className="mx-2">/</span>
        <span className="text-forest">{product.name}</span>
      </div>

      {/* HERO PRODUCT */}
      <section className="bg-cream relative overflow-hidden">
        <div className="absolute top-10 right-10 w-72 h-72 bg-[var(--drj-gold-soft)] opacity-50 rounded-full blur-3xl" />
        <div className="container-drj py-10 lg:py-16 grid lg:grid-cols-2 gap-12 relative">
          <div>
            <div className="relative aspect-square bg-white border border-[var(--drj-gold)] flex items-center justify-center overflow-hidden" data-testid="product-main-image">
              <div className="absolute inset-10 rounded-full bg-[var(--drj-gold-soft)] opacity-40" />
              <motion.img
                key={active}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                src={product.images[active]}
                alt={product.name}
                className="relative z-10 max-h-[78%] max-w-[78%] object-contain"
                style={{ filter: "drop-shadow(0 28px 50px rgba(212,175,55,0.4))" }}
              />
              <span className="absolute top-5 left-5 bg-gold text-white px-3 py-1 text-[10px] tracking-[0.22em] uppercase font-semibold z-20">Flagship</span>
            </div>
            <div className="grid grid-cols-4 gap-3 mt-4">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`aspect-square overflow-hidden border ${active === i ? "border-gold" : "border-[var(--drj-line)]"} bg-cream`}
                  data-testid={`product-thumb-${i}`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain p-2" />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-32 self-start">
            <div className="text-overline text-gold">Dharmaraj Ayurveda</div>
            <h1 className="font-serif text-5xl lg:text-6xl text-forest tracking-tight mt-2">{product.name}</h1>
            <p className="text-overline text-[var(--drj-ink-muted)] mt-2">{product.tagline}</p>

            <div className="flex items-center gap-2 mt-4 text-sm">
              <div className="flex">{[1,2,3,4,5].map((s) => (<Star key={s} size={14} className="fill-gold text-gold"/>))}</div>
              <span className="font-medium text-forest">{product.rating}</span>
              <span className="text-[var(--drj-ink-muted)]">· {product.review_count} reviews</span>
            </div>

            <p className="mt-6 text-[var(--drj-ink-muted)] leading-relaxed font-light">{product.short_description}</p>

            <div className="flex items-baseline gap-3 mt-8">
              <span className="font-serif text-4xl text-forest">{inr(product.price)}</span>
              {product.mrp > product.price && (
                <span className="text-lg line-through text-[var(--drj-ink-muted)]">{inr(product.mrp)}</span>
              )}
              <span className="text-xs px-2 py-1 bg-[var(--drj-gold-soft)] text-forest border border-[var(--drj-gold)]">
                SAVE {Math.round((1 - product.price / product.mrp) * 100)}%
              </span>
            </div>
            <div className="text-xs text-[var(--drj-ink-muted)] mt-1">Inclusive of all taxes · {product.pack_size}</div>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center border border-[var(--drj-line-strong)] bg-white">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 text-forest" data-testid="qty-decrease"><Minus size={14}/></button>
                <span className="px-5 text-sm" data-testid="qty-value">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-4 py-3 text-forest" data-testid="qty-increase"><Plus size={14}/></button>
              </div>
              <button onClick={handleAdd} className="btn-primary flex-1 justify-center" data-testid="add-to-cart-button">
                Add to Cart
              </button>
              <button
                onClick={toggleWishlist}
                className={`h-12 w-12 flex items-center justify-center border transition ${inWishlist ? "bg-[var(--drj-gold)] text-white border-[var(--drj-gold)]" : "border-[var(--drj-line-strong)] text-forest hover:border-[var(--drj-gold)]"}`}
                data-testid="wishlist-toggle"
                aria-label="Toggle wishlist"
              >
                <Heart size={18} fill={inWishlist ? "currentColor" : "none"}/>
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => { addItem(product, qty); setDrawerOpen(false); window.location.href = "/checkout"; }}
                className="btn-gold justify-center"
                data-testid="buy-now-button"
              >
                Buy Now <ArrowRight size={16}/>
              </button>
              <a href={whatsappLink(`Hi, I'd like to order ${product.name}`)} target="_blank" rel="noreferrer" className="btn-outline-gold justify-center" data-testid="product-whatsapp">
                <i className="fa-brands fa-whatsapp"></i> Order on WhatsApp
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-10 pt-8 border-t border-[var(--drj-line)] text-xs">
              {[
                { icon: Leaf, label: "100% Botanical Formula" },
                { icon: Award, label: "FSSAI · ISO · GMP" },
                { icon: ShieldCheck, label: "30-Day Money-Back" },
                { icon: Truck, label: "Free shipping over ₹999" },
              ].map((t) => (
                <div key={t.label} className="flex items-center gap-3 text-[var(--drj-ink)]">
                  <t.icon size={18} className="text-gold"/>
                  <span>{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <TrustStrip />

      {/* PRODUCT STORY — large bottle with description around */}
      <section className="section bg-sand relative overflow-hidden" data-testid="product-story-section">
        <div className="container-drj">
          <div className="text-center mb-12">
            <div className="drj-divider text-overline mb-4">The Vajra Story</div>
            <h2 className="font-serif text-4xl lg:text-5xl text-forest tracking-tight">A formula whispered through generations.</h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            <div className="space-y-8 lg:text-right">
              <Highlight title="Ashwagandha 300mg" body="The classical adaptogen. Standardized to 5% Withanolides, it gently lowers cortisol and rebuilds stamina." align="right" />
              <Highlight title="White Musli 200mg" body="Saponin-rich Chlorophytum revered as the 'divine ginseng' of India — for vitality and endurance." align="right" />
              <Highlight title="Giloy 150mg" body="Tinospora's bitter wisdom — kindles immunity at the cellular level." align="right" />
            </div>
            <div className="relative aspect-square bg-white border border-[var(--drj-gold)] flex items-center justify-center order-first lg:order-none">
              <div className="absolute inset-10 rounded-full bg-[var(--drj-gold-soft)] opacity-50" />
              <div className="absolute inset-4 rounded-full border-2 border-dashed border-[var(--drj-gold)] opacity-40 animate-[ringRotate_60s_linear_infinite]" />
              <img src={BRAND.productImage} alt="1 Vajra" className="relative z-10 max-h-[70%]" style={{ filter: "drop-shadow(0 30px 60px rgba(212,175,55,0.45))" }} />
            </div>
            <div className="space-y-8">
              <Highlight title="Shatavari 150mg" body="The 'queen of herbs' — nourishment, hormonal balance, and feminine vitality." align="left" />
              <Highlight title="Curcumin 50mg" body="95% standardized Curcuminoids paired with Piperine for joint mobility and anti-oxidation." align="left" />
              <Highlight title="Trikatu 50mg" body="Ginger, Black Pepper, Long Pepper — Ayurveda's classical fire for digestion and absorption." align="left" />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section bg-cream" data-testid="how-it-works-section">
        <div className="container-drj">
          <div className="text-center mb-12">
            <div className="drj-divider text-overline mb-4">How It Works</div>
            <h2 className="font-serif text-4xl lg:text-5xl text-forest tracking-tight">From classical text to your daily ritual.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white border border-[var(--drj-line)] p-8 hover:border-gold transition"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-[var(--drj-gold-soft)] border border-[var(--drj-gold)] text-gold">
                  <s.icon size={20} />
                </div>
                <div className="font-serif text-2xl text-forest mt-5">Step {String(i+1).padStart(2,'0')}</div>
                <h3 className="font-serif text-xl text-forest mt-2">{s.title}</h3>
                <p className="text-sm text-[var(--drj-ink-muted)] mt-3 font-light leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* RADIAL BENEFITS */}
      <RadialBenefits />

      {/* TABS */}
      <section className="bg-white border-t border-[var(--drj-line)]">
        <div className="container-drj py-16 lg:py-24">
          <div className="flex gap-8 border-b border-[var(--drj-line)] overflow-x-auto no-scrollbar">
            {[
              ["description", "Description"],
              ["ingredients", "Ingredients"],
              ["dosage", "Dosage & Usage"],
              ["benefits", "Benefits"],
              ["reviews", `Reviews (${reviews.length})`],
            ].map(([k, l]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`pb-4 text-overline whitespace-nowrap transition-colors ${tab === k ? "text-forest border-b-2 border-gold" : "text-[var(--drj-ink-muted)]"}`}
                data-testid={`tab-${k}`}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="py-12 max-w-4xl">
            {tab === "description" && (<p className="text-lg text-[var(--drj-ink)] leading-relaxed font-light">{product.description}</p>)}
            {tab === "ingredients" && (
              <div className="grid sm:grid-cols-2 gap-6">
                {product.ingredients.map((ing) => (
                  <div key={ing.name} className="border-l-2 border-gold pl-5">
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-serif text-2xl text-forest">{ing.name}</h3>
                      <span className="text-overline text-gold">{ing.qty}</span>
                    </div>
                    <div className="text-xs italic text-[var(--drj-ink-muted)] mt-1">{ing.botanical}</div>
                    <div className="text-xs text-forest mt-2">{ing.std}</div>
                    <p className="text-sm text-[var(--drj-ink-muted)] mt-2 font-light">{ing.benefit}</p>
                  </div>
                ))}
              </div>
            )}
            {tab === "dosage" && (
              <div className="space-y-6 text-[var(--drj-ink)]">
                <div><div className="text-overline text-gold mb-2">Recommended Usage</div><p className="text-lg font-light">{product.dosage}</p></div>
                <div><div className="text-overline text-gold mb-2">Storage</div><p className="font-light">{product.storage}</p></div>
                <div><div className="text-overline text-gold mb-2">Caution</div><p className="font-light text-sm text-[var(--drj-ink-muted)]">Pregnant or lactating women, children, or people with medical conditions must consult a healthcare professional before use. Keep out of reach of children.</p></div>
              </div>
            )}
            {tab === "benefits" && (
              <ul className="grid sm:grid-cols-2 gap-4">
                {product.benefits.map((b) => (
                  <li key={b} className="flex gap-3 items-start"><span className="text-gold text-xl leading-none">✦</span><span className="text-[var(--drj-ink)] font-light">{b}</span></li>
                ))}
              </ul>
            )}
            {tab === "reviews" && (
              <div className="space-y-10">
                <form onSubmit={submitReview} className="border border-[var(--drj-line)] bg-cream p-8" data-testid="review-form">
                  <h3 className="font-serif text-2xl text-forest">Share your experience</h3>
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <input className="input-luxe" required placeholder="Your name" value={reviewForm.name} onChange={(e)=>setReviewForm({...reviewForm, name: e.target.value})} data-testid="review-name"/>
                    <input className="input-luxe" required placeholder="Title of your review" value={reviewForm.title} onChange={(e)=>setReviewForm({...reviewForm, title: e.target.value})} data-testid="review-title"/>
                  </div>
                  <div className="mt-6">
                    <div className="text-overline text-[var(--drj-ink-muted)] mb-2">Your rating</div>
                    <div className="flex gap-1" data-testid="review-rating">
                      {[1,2,3,4,5].map((s) => (<button type="button" key={s} onClick={()=>setReviewForm({...reviewForm, rating: s})}><Star size={22} className={s <= reviewForm.rating ? "fill-gold text-gold" : "text-[var(--drj-line-strong)]"} /></button>))}
                    </div>
                  </div>
                  <textarea required rows={4} className="input-luxe mt-6" placeholder="Tell us about your experience..." value={reviewForm.comment} onChange={(e)=>setReviewForm({...reviewForm, comment: e.target.value})} data-testid="review-comment"/>
                  <button className="btn-primary mt-6" data-testid="submit-review">Submit Review</button>
                </form>
                <div className="space-y-6" data-testid="reviews-list">
                  {reviews.map((r) => (
                    <div key={r.id} className="border-b border-[var(--drj-line)] pb-6">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex gap-3 items-center">
                          <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center font-serif">{r.name[0]}</div>
                          <div>
                            <div className="font-medium text-forest text-sm">{r.name}</div>
                            <div className="text-xs text-[var(--drj-ink-muted)]">{r.location || ""} {r.verified && "· Verified"}</div>
                          </div>
                        </div>
                        <div className="flex">{Array.from({length: r.rating}).map((_, i) => (<Star key={i} size={14} className="fill-gold text-gold"/>))}</div>
                      </div>
                      <h4 className="font-serif text-lg text-forest mt-4">{r.title}</h4>
                      <p className="text-[var(--drj-ink-muted)] mt-2 font-light">{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-cream">
        <div className="container-drj py-16">
          <h2 className="font-serif text-3xl text-forest mb-8 text-center">Frequently Asked</h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible>
              {[
                { q: "How should I store 1 Vajra?", a: product.storage },
                { q: "Can I take 1 Vajra with other supplements?", a: "Generally yes, but we recommend a 30-minute gap. Always consult your physician if on prescription medication." },
                { q: "What is the shelf life?", a: "Each bottle has a 24-month shelf life from manufacturing. Best Before is printed on the label." },
                { q: "Is this product vegetarian?", a: "Yes — vegetable HPMC capsule shell. 100% vegetarian and plant-based." },
              ].map((f, i) => (
                <AccordionItem key={i} value={`pfaq-${i}`} className="border-b border-[var(--drj-line)]" data-testid={`product-faq-${i}`}>
                  <AccordionTrigger className="font-serif text-lg text-forest hover:no-underline py-5">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-[var(--drj-ink-muted)] font-light pb-5">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </div>
  );
}

const Highlight = ({ title, body, align }) => (
  <motion.div
    initial={{ opacity: 0, x: align === "right" ? 24 : -24 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className={`bg-white border border-[var(--drj-line)] p-6 ${align === "right" ? "lg:border-r-4 lg:border-r-[var(--drj-gold)]" : "lg:border-l-4 lg:border-l-[var(--drj-gold)]"}`}
  >
    <div className="font-serif text-xl text-forest">{title}</div>
    <p className="text-sm text-[var(--drj-ink-muted)] mt-2 font-light leading-relaxed">{body}</p>
  </motion.div>
);

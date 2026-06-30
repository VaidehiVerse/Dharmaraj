import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Plus, Minus, ShieldCheck, Truck, Leaf, Award, ArrowRight, FlaskConical, Beaker, Sun, Heart } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { apiClient, inr } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { whatsappLink, BRAND } from "@/lib/brand";
import { toast } from "sonner";
import { useI18n } from "@/context/I18nContext";
import RadialBenefits from "@/components/RadialBenefits";
import ProductImageGallery from "@/components/ProductImageGallery";

const STEP_ICONS = [Beaker, FlaskConical, Sun];

const VAJRA_GALLERY_IMAGES = [
  "/images/new-image-1.jpg",
  "/images/new-image-3.jpg",
  "/images/new-image-4.jpg",
];

function productDisplayImages(product) {
  if (product.slug === "1-vajra") {
    return VAJRA_GALLERY_IMAGES;
  }
  return product.images?.length ? product.images : [BRAND.productImage];
}

export default function Product() {
  const { slug } = useParams();
  const { t, tKey } = useI18n();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
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
    if (!user) { toast.info(t.product.sign_in_wishlist); return; }
    try {
      if (inWishlist) {
        await apiClient.delete(`/me/wishlist/${slug}`);
        setInWishlist(false);
        toast.success(t.product.wishlist_removed);
      } else {
        await apiClient.post(`/me/wishlist/${slug}`);
        setInWishlist(true);
        toast.success(t.product.wishlist_added);
      }
    } catch { toast.error(t.product.wishlist_error); }
  };

  useEffect(() => {
    apiClient.get(`/products/${slug}`).then((r) => {
      const data = { ...r.data, images: productDisplayImages(r.data) };
      setProduct(data);
      apiClient.get(`/reviews/${r.data.id}`).then((rev) => setReviews(rev.data)).catch(() => setReviews([]));
    }).catch(() => setProduct(null));
  }, [slug]);

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const { data } = await apiClient.post("/reviews", { ...reviewForm, product_id: product.id });
      setReviews((curr) => [data, ...curr]);
      setReviewForm({ name: "", rating: 5, title: "", comment: "" });
      toast.success(t.product.review_thanks);
    } catch {
      toast.error(t.product.review_error);
    }
  };

  if (!product) return <div className="container-drj py-32 text-center text-[var(--drj-ink-muted)]">{t.product.loading}</div>;

  const handleAdd = () => {
    addItem(product, qty);
    toast.success(tKey("product.added_to_cart", { name: product.name, qty }));
  };

  const highlights = t.product.highlights || [];
  const howSteps = (t.product.how_steps || []).map((step, i) => ({ ...step, icon: STEP_ICONS[i] }));
  const productFaqs = (t.product.faqs || []).map((f) => ({
    q: f.q,
    a: f.a_key === "storage" ? product.storage : f.a,
  }));
  const trustBadges = [
    { icon: Leaf, label: t.product.badges.botanical },
    { icon: Award, label: t.product.badges.extracts },
    { icon: ShieldCheck, label: t.product.badges.dosage },
    { icon: Truck, label: t.product.badges.shipping },
  ];
  const tabLabels = {
    description: t.product.tabs.description,
    ingredients: t.product.tabs.ingredients,
    dosage: t.product.tabs.dosage,
    benefits: t.product.tabs.benefits,
    reviews: `${t.product.tabs.reviews} (${reviews.length})`,
  };

  return (
    <div data-testid="product-page" className="bg-white">
      <div className="container-drj py-6 text-xs text-[var(--drj-ink-muted)]">
        <Link to="/" className="hover:text-forest">{t.product.breadcrumb_home}</Link> <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-forest">{t.product.breadcrumb_shop}</Link> <span className="mx-2">/</span>
        <span className="text-forest">{product.name}</span>
      </div>

      {/* HERO PRODUCT */}
      <section className="bg-cream relative overflow-hidden">
        <div className="absolute top-10 right-10 w-72 h-72 bg-[var(--drj-gold-soft)] opacity-50 rounded-full blur-3xl" />
        <div className="container-drj py-2 lg:py-6 grid lg:grid-cols-2 gap-12 relative">
          <div>
            <ProductImageGallery images={product.images} productName={product.name} />
          </div>

          <div className="lg:sticky lg:top-32 self-start">
            <div className="text-overline text-gold">Dharmaraj Ayurveda</div>
            <h1 className="font-serif text-5xl lg:text-6xl text-forest tracking-tight mt-2">{product.name}</h1>
            <p className="text-overline text-[var(--drj-ink-muted)] mt-2">{product.tagline}</p>

            <div className="flex items-center gap-2 mt-4 text-sm">
              <div className="flex">{[1,2,3,4,5].map((s) => (<Star key={s} size={14} className="fill-gold text-gold"/>))}</div>
              <span className="font-medium text-forest">{product.rating}</span>
              <span className="text-[var(--drj-ink-muted)]">· {product.review_count} {t.product.reviews}</span>
            </div>

            <p className="mt-6 text-[var(--drj-ink-muted)] leading-relaxed font-light">{product.short_description}</p>

            <div className="flex items-baseline gap-3 mt-8">
              <span className="font-serif text-4xl text-forest">{inr(product.price)}</span>
              {product.mrp > product.price && (
                <span className="text-lg line-through text-[var(--drj-ink-muted)]">{inr(product.mrp)}</span>
              )}
              <span className="text-xs px-2 py-1 bg-[var(--drj-gold-soft)] text-forest border border-[var(--drj-gold)]">
                {t.product.save} {Math.round((1 - product.price / product.mrp) * 100)}%
              </span>
            </div>
            <div className="text-xs text-[var(--drj-ink-muted)] mt-1">{t.product.inclusive_taxes} · {product.pack_size}</div>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center border border-[var(--drj-line-strong)] bg-white">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 text-forest" data-testid="qty-decrease"><Minus size={14}/></button>
                <span className="px-5 text-sm" data-testid="qty-value">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-4 py-3 text-forest" data-testid="qty-increase"><Plus size={14}/></button>
              </div>
              <button onClick={handleAdd} className="btn-primary flex-1 justify-center" data-testid="add-to-cart-button">
                {t.cta.add_to_cart}
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
                {t.cta.buy_now} <ArrowRight size={16}/>
              </button>
              <a href={whatsappLink(tKey("product.whatsapp_order_msg", { name: product.name }))} target="_blank" rel="noreferrer" className="btn-outline-gold justify-center" data-testid="product-whatsapp">
                <i className="fa-brands fa-whatsapp"></i> {t.product.order_whatsapp}
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-10 pt-8 border-t border-[var(--drj-line)] text-xs">
              {trustBadges.map((badge) => (
                <div key={badge.label} className="flex items-center gap-3 text-[var(--drj-ink)]">
                  <badge.icon size={18} className="text-gold"/>
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

<section className="py-12 bg-sand relative overflow-hidden" data-testid="product-story-section">  <div className="container-drj">
    <div className="text-center mb-12">
      <div className="drj-divider text-overline mb-4">{t.product.story_eyebrow}</div>
      <h2 className="font-serif text-4xl lg:text-5xl text-forest tracking-tight">{t.product.story_title}</h2>
    </div>

    {/* Main layout: Central bottle, ingredients around */}
    <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
      {/* Left Column (3 items) */}
      <div className="space-y-8 lg:w-1/3">
        <Highlight title={highlights[0]?.title} body={highlights[0]?.body} align="right" />
        <Highlight title={highlights[1]?.title} body={highlights[1]?.body} align="right" />
        <Highlight title={highlights[2]?.title} body={highlights[2]?.body} align="right" />
      </div>

      {/* Center Column (Bottle + Amla below) */}
      <div className="flex flex-col items-center gap-8 lg:w-1/3">
        <div className="relative aspect-square bg-white border border-[var(--drj-gold)] flex items-center justify-center w-full max-w-[400px]">
          <div className="absolute inset-10 rounded-full bg-[var(--drj-gold-soft)] opacity-50" />
          <div className="absolute inset-4 rounded-full border-2 border-dashed border-[var(--drj-gold)] opacity-40 animate-[ringRotate_60s_linear_infinite]" />
          <img src={BRAND.productImage} alt="1 Vajra" className="relative z-10 max-h-[95%]" style={{ filter: "drop-shadow(0 30px 60px rgba(212,175,55,0.45))" }} />
        </div>
        {/* Amla moved below the bottle */}
        <div className="w-full">
          <Highlight title={highlights[3]?.title} body={highlights[3]?.body} align="center" />
        </div>
      </div>

      {/* Right Column (3 items) */}
      <div className="space-y-8 lg:w-1/3">
        <Highlight title={highlights[4]?.title} body={highlights[4]?.body} align="left" />
        <Highlight title={highlights[5]?.title} body={highlights[5]?.body} align="left" />
        <Highlight title={highlights[6]?.title} body={highlights[6]?.body} align="left" />
      </div>
    </div>
  </div>
</section>
      {/* HOW IT WORKS */}
      
<section className="py-10 bg-cream" data-testid="how-it-works-section">
        <div className="container-drj">
          <div className="text-center mb-12">
            <div className="drj-divider text-overline mb-4">{t.product.how_eyebrow}</div>
            <h2 className="font-serif text-4xl lg:text-5xl text-forest tracking-tight">{t.product.how_title}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {howSteps.map((s, i) => (
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
                <div className="font-serif text-2xl text-forest mt-5">{t.product.step_label} {String(i+1).padStart(2,'0')}</div>
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
        <div className="container-drj py-4 lg:py-6">
          <div className="flex gap-8 border-b border-[var(--drj-line)] overflow-x-auto no-scrollbar">
            {Object.entries(tabLabels).map(([k, l]) => (
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
                <div><div className="text-overline text-gold mb-2">{t.product.dosage_labels.usage}</div><p className="text-lg font-light">{product.dosage}</p></div>
                <div><div className="text-overline text-gold mb-2">{t.product.dosage_labels.storage}</div><p className="font-light">{product.storage}</p></div>
                <div><div className="text-overline text-gold mb-2">{t.product.dosage_labels.caution}</div><p className="font-light text-sm text-[var(--drj-ink-muted)]">{t.product.dosage_labels.caution_text}</p></div>
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
                  <h3 className="font-serif text-2xl text-forest">{t.product.review_form.title}</h3>
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <input className="input-luxe" required placeholder={t.product.review_form.name} value={reviewForm.name} onChange={(e)=>setReviewForm({...reviewForm, name: e.target.value})} data-testid="review-name"/>
                    <input className="input-luxe" required placeholder={t.product.review_form.review_title} value={reviewForm.title} onChange={(e)=>setReviewForm({...reviewForm, title: e.target.value})} data-testid="review-title"/>
                  </div>
                  <div className="mt-6">
                    <div className="text-overline text-[var(--drj-ink-muted)] mb-2">{t.product.review_form.rating}</div>
                    <div className="flex gap-1" data-testid="review-rating">
                      {[1,2,3,4,5].map((s) => (<button type="button" key={s} onClick={()=>setReviewForm({...reviewForm, rating: s})}><Star size={22} className={s <= reviewForm.rating ? "fill-gold text-gold" : "text-[var(--drj-line-strong)]"} /></button>))}
                    </div>
                  </div>
                  <textarea required rows={4} className="input-luxe mt-6" placeholder={t.product.review_form.comment} value={reviewForm.comment} onChange={(e)=>setReviewForm({...reviewForm, comment: e.target.value})} data-testid="review-comment"/>
                  <button className="btn-primary mt-6" data-testid="submit-review">{t.product.review_form.submit}</button>
                </form>
                <div className="space-y-6" data-testid="reviews-list">
                  {reviews.map((r) => (
                    <div key={r.id} className="border-b border-[var(--drj-line)] pb-6">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex gap-3 items-center">
                          <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center font-serif">{r.name[0]}</div>
                          <div>
                            <div className="font-medium text-forest text-sm">{r.name}</div>
                            <div className="text-xs text-[var(--drj-ink-muted)]">{r.location || ""} {r.verified && `· ${t.product.verified}`}</div>
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
          <h2 className="font-serif text-3xl text-forest mb-8 text-center">{t.product.faq_title}</h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible>
              {productFaqs.map((f, i) => (
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

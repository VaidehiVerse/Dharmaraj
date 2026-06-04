import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Plus, Minus, ShieldCheck, Truck, Leaf, Award, ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { apiClient, inr } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { whatsappLink } from "@/lib/brand";
import { toast } from "sonner";

export default function Product() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("description");
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, title: "", comment: "" });
  const { addItem, setDrawerOpen } = useCart();

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
    <div data-testid="product-page" className="bg-[var(--drj-bg)]">
      <div className="container-drj py-6 text-xs text-[var(--drj-ink-muted)]">
        <Link to="/" className="hover:text-forest">Home</Link> <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-forest">Shop</Link> <span className="mx-2">/</span>
        <span className="text-forest">{product.name}</span>
      </div>

      <section className="bg-white border-y border-[var(--drj-line)]">
        <div className="container-drj py-10 lg:py-14 grid lg:grid-cols-2 gap-12">
          <div>
            <div className="bg-obsidian aspect-square overflow-hidden relative" data-testid="product-main-image">
              <motion.img
                key={active}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                src={product.images[active]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-5 left-5 bg-gold text-obsidian px-3 py-1 text-[10px] tracking-[0.22em] uppercase font-semibold">Flagship</span>
            </div>
            <div className="grid grid-cols-4 gap-3 mt-4">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`aspect-square overflow-hidden border ${active === i ? "border-gold" : "border-[var(--drj-line)]"}`}
                  data-testid={`product-thumb-${i}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
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
              <span className="text-xs px-2 py-1 bg-[var(--drj-gold)]/20 text-forest">
                SAVE {Math.round((1 - product.price / product.mrp) * 100)}%
              </span>
            </div>
            <div className="text-xs text-[var(--drj-ink-muted)] mt-1">Inclusive of all taxes · {product.pack_size}</div>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center border border-[var(--drj-line)]">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 text-forest" data-testid="qty-decrease"><Minus size={14}/></button>
                <span className="px-5 text-sm" data-testid="qty-value">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-4 py-3 text-forest" data-testid="qty-increase"><Plus size={14}/></button>
              </div>
              <button onClick={handleAdd} className="btn-primary flex-1 justify-center" data-testid="add-to-cart-button">
                Add to Cart
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
                <div key={t.label} className="flex items-center gap-3 text-[var(--drj-ink)]" data-testid={`assurance-${t.label.toLowerCase().replace(/\s|·/g, "-")}`}>
                  <t.icon size={18} className="text-forest"/>
                  <span>{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--drj-bg)]">
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
            {tab === "description" && (
              <div className="prose max-w-none">
                <p className="text-lg text-[var(--drj-ink)] leading-relaxed font-light">{product.description}</p>
              </div>
            )}

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
                <div>
                  <div className="text-overline text-gold mb-2">Recommended Usage</div>
                  <p className="text-lg font-light">{product.dosage}</p>
                </div>
                <div>
                  <div className="text-overline text-gold mb-2">Storage</div>
                  <p className="font-light">{product.storage}</p>
                </div>
                <div>
                  <div className="text-overline text-gold mb-2">Caution</div>
                  <p className="font-light text-sm text-[var(--drj-ink-muted)]">
                    Pregnant or lactating women, children, or people with medical conditions must
                    consult a healthcare professional before use. Keep out of reach of children.
                  </p>
                </div>
              </div>
            )}

            {tab === "benefits" && (
              <ul className="grid sm:grid-cols-2 gap-4">
                {product.benefits.map((b) => (
                  <li key={b} className="flex gap-3 items-start">
                    <span className="text-gold text-xl leading-none">✦</span>
                    <span className="text-[var(--drj-ink)] font-light">{b}</span>
                  </li>
                ))}
              </ul>
            )}

            {tab === "reviews" && (
              <div className="space-y-10">
                <form onSubmit={submitReview} className="border border-[var(--drj-line)] bg-white p-8" data-testid="review-form">
                  <h3 className="font-serif text-2xl text-forest">Share your experience</h3>
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <input className="input-luxe" required placeholder="Your name" value={reviewForm.name} onChange={(e)=>setReviewForm({...reviewForm, name: e.target.value})} data-testid="review-name"/>
                    <input className="input-luxe" required placeholder="Title of your review" value={reviewForm.title} onChange={(e)=>setReviewForm({...reviewForm, title: e.target.value})} data-testid="review-title"/>
                  </div>
                  <div className="mt-6">
                    <div className="text-overline text-[var(--drj-ink-muted)] mb-2">Your rating</div>
                    <div className="flex gap-1" data-testid="review-rating">
                      {[1,2,3,4,5].map((s) => (
                        <button type="button" key={s} onClick={()=>setReviewForm({...reviewForm, rating: s})}>
                          <Star size={22} className={s <= reviewForm.rating ? "fill-gold text-gold" : "text-[var(--drj-line)]"} />
                        </button>
                      ))}
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

      <section className="bg-white border-t border-[var(--drj-line)]">
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

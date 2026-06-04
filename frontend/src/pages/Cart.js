import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowRight, Tag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { apiClient, inr } from "@/lib/api";
import { toast } from "sonner";
import { useI18n } from "@/context/I18nContext";

export default function Cart() {
  const { items, updateQty, removeItem, subtotal } = useCart();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState(null);

  const shipping = subtotal >= 999 || items.length === 0 ? 0 : 49;
  const discount = applied?.discount || 0;
  const taxable = Math.max(subtotal - discount, 0);
  const tax = Math.round(taxable * 0.05);
  const total = taxable + shipping + tax;

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    try {
      const { data } = await apiClient.post("/coupons/validate", { code: coupon, subtotal });
      setApplied(data);
      toast.success(`Applied ${data.code} — saved ${inr(data.discount)}`);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Invalid coupon");
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-drj section text-center" data-testid="empty-cart">
        <div className="text-6xl text-gold mb-6">☘</div>
        <h1 className="font-serif text-4xl text-forest">{t.cart.empty_title}</h1>
        <p className="text-[var(--drj-ink-muted)] mt-4 font-light">{t.cart.empty_desc}</p>
        <Link to="/product/1-vajra" className="btn-primary mt-8 inline-flex" data-testid="empty-cart-cta">{t.cart.empty_cta}</Link>
      </div>
    );
  }

  return (
    <div data-testid="cart-page" className="bg-cream min-h-screen">
      <div className="container-drj py-12 lg:py-20">
        <div className="text-overline text-gold mb-2">{t.cart.eyebrow}</div>
        <h1 className="font-serif text-5xl text-forest tracking-tight">{t.cart.title}</h1>
        <div className="grid lg:grid-cols-3 gap-10 mt-12">
          <div className="lg:col-span-2 space-y-px bg-[var(--drj-line)] border border-[var(--drj-line)]">
            {items.map((it) => (
              <div key={it.product_id} className="bg-white p-6 flex gap-6" data-testid={`cart-row-${it.product_id}`}>
                <div className="w-28 h-32 bg-[var(--drj-bg)] flex items-center justify-center overflow-hidden shrink-0">
                  {it.image && <img src={it.image} alt={it.name} className="w-full h-full object-cover"/>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-2xl text-forest">{it.name}</h3>
                  <div className="text-overline text-gold mt-1">{inr(it.price)} each</div>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center border border-[var(--drj-line)]">
                      <button onClick={() => updateQty(it.product_id, it.quantity - 1)} className="px-3 py-2 text-forest"><Minus size={14}/></button>
                      <span className="px-4 text-sm">{it.quantity}</span>
                      <button onClick={() => updateQty(it.product_id, it.quantity + 1)} className="px-3 py-2 text-forest"><Plus size={14}/></button>
                    </div>
                    <button onClick={() => removeItem(it.product_id)} className="text-[var(--drj-ink-muted)] hover:text-red-700 text-xs flex items-center gap-2 uppercase tracking-[0.18em]" data-testid={`remove-${it.product_id}`}>
                      <Trash2 size={14}/> Remove
                    </button>
                  </div>
                </div>
                <div className="font-serif text-2xl text-forest whitespace-nowrap" data-testid={`line-total-${it.product_id}`}>{inr(it.price * it.quantity)}</div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-[var(--drj-line)] p-7">
              <h3 className="font-serif text-2xl text-forest">{t.cart.summary}</h3>
              <div className="space-y-3 mt-6 text-sm">
                <Row label={t.cart.subtotal} value={inr(subtotal)} testId="summary-subtotal"/>
                {discount > 0 && <Row label={`${t.cart.discount} (${applied.code})`} value={`− ${inr(discount)}`} accent testId="summary-discount"/>}
                <Row label={t.cart.shipping} value={shipping === 0 ? t.cart.free : inr(shipping)} testId="summary-shipping"/>
                <Row label={t.cart.tax} value={inr(tax)} testId="summary-tax"/>
                <div className="border-t border-[var(--drj-line)] pt-4 flex justify-between items-baseline">
                  <span className="text-overline text-forest">{t.cart.total}</span>
                  <span className="font-serif text-3xl text-forest" data-testid="summary-total">{inr(total)}</span>
                </div>
              </div>
              <button onClick={() => navigate("/checkout")} className="btn-primary w-full justify-center mt-8" data-testid="cart-proceed-checkout">
                {t.cart.proceed} <ArrowRight size={16}/>
              </button>
              <p className="text-xs text-[var(--drj-ink-muted)] text-center mt-3">{t.cart.secure}</p>
            </div>

            <div className="bg-white border border-[var(--drj-line)] p-7">
              <div className="flex items-center gap-2 text-overline text-gold mb-3"><Tag size={14}/> {t.cart.coupon}</div>
              <div className="flex gap-2 items-end border-b border-[var(--drj-line)]">
                <input className="input-luxe border-0 py-3 flex-1 uppercase" placeholder="WELCOME10" value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} data-testid="coupon-input"/>
                <button onClick={applyCoupon} className="text-overline text-forest pb-3 hover:text-gold transition" data-testid="apply-coupon">{t.cta.apply}</button>
              </div>
              <div className="text-xs text-[var(--drj-ink-muted)] mt-3 font-light">{t.cart.try} <span className="text-forest font-medium">WELCOME10</span> for 10% off</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Row = ({ label, value, accent, testId }) => (
  <div className="flex justify-between" data-testid={testId}>
    <span className="text-[var(--drj-ink-muted)]">{label}</span>
    <span className={accent ? "text-forest font-medium" : "text-[var(--drj-ink)]"}>{value}</span>
  </div>
);

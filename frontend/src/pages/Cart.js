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

  const discount = applied?.discount || 0;
  const total = Math.max(subtotal - discount, 0);

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
      <div data-testid="empty-cart" className="bg-cream">
        <section className="border-b border-[var(--drj-line)]">
          <div className="container-drj page-lead">
            <div className="text-overline text-gold mb-1">{t.cart.eyebrow}</div>
            <h1 className="font-serif text-4xl lg:text-5xl text-forest tracking-tight">{t.cart.empty_title}</h1>
          </div>
        </section>
        <div className="container-drj page-content text-center">
          <div className="text-6xl text-gold mb-6">☘</div>
          <p className="text-[var(--drj-ink-muted)] font-light">{t.cart.empty_desc}</p>
          <Link to="/product/1-vajra" className="btn-primary mt-8 inline-flex" data-testid="empty-cart-cta">{t.cart.empty_cta}</Link>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="cart-page" className="bg-cream">
      <section className="border-b border-[var(--drj-line)]">
        <div className="container-drj page-lead">
          <div className="text-overline text-gold mb-1">{t.cart.eyebrow}</div>
          <h1 className="font-serif text-4xl lg:text-5xl text-forest tracking-tight">{t.cart.title}</h1>
        </div>
      </section>

      <div className="container-drj page-content">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-2 border border-[var(--drj-line)] divide-y divide-[var(--drj-line)] bg-white">
            {items.map((it) => (
              <div key={it.product_id} className="p-5 lg:p-6 flex gap-5 lg:gap-6 items-center" data-testid={`cart-row-${it.product_id}`}>
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-cream flex items-center justify-center shrink-0">
                  {it.image && <img src={it.image} alt={it.name} className="max-h-[88%] max-w-[88%] object-contain"/>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-xl lg:text-2xl text-forest leading-tight">{it.name}</h3>
                  <div className="text-overline text-gold mt-1">{inr(it.price)} {t.common.each}</div>
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <div className="flex items-center border border-[var(--drj-line)]">
                      <button onClick={() => updateQty(it.product_id, it.quantity - 1)} className="px-3 py-2 text-forest"><Minus size={14}/></button>
                      <span className="px-4 text-sm">{it.quantity}</span>
                      <button onClick={() => updateQty(it.product_id, it.quantity + 1)} className="px-3 py-2 text-forest"><Plus size={14}/></button>
                    </div>
                    <button onClick={() => removeItem(it.product_id)} className="text-[var(--drj-ink-muted)] hover:text-red-700 text-xs flex items-center gap-2 uppercase tracking-[0.18em]" data-testid={`remove-${it.product_id}`}>
                      <Trash2 size={14}/> {t.cart.remove}
                    </button>
                  </div>
                </div>
                <div className="font-serif text-xl lg:text-2xl text-forest whitespace-nowrap" data-testid={`line-total-${it.product_id}`}>{inr(it.price * it.quantity)}</div>
              </div>
            ))}
          </div>

          <div className="space-y-5 lg:sticky lg:top-28">
            <div className="bg-white border border-[var(--drj-line)] p-6 lg:p-7">
              <h3 className="font-serif text-2xl text-forest">{t.cart.summary}</h3>
              <div className="space-y-3 mt-5 text-sm">
                <Row label={t.cart.subtotal} value={inr(subtotal)} testId="summary-subtotal"/>
                {discount > 0 && <Row label={`${t.cart.discount} (${applied.code})`} value={`− ${inr(discount)}`} accent testId="summary-discount"/>}
                <div className="border-t border-[var(--drj-line)] pt-4 flex justify-between items-baseline">
                  <span className="text-overline text-forest">{t.cart.total}</span>
                  <span className="font-serif text-3xl text-forest" data-testid="summary-total">{inr(total)}</span>
                </div>
                <p className="text-xs text-[var(--drj-ink-muted)] font-light pt-1">{t.product.inclusive_taxes} · {t.cart.free} {t.cart.shipping}</p>
              </div>
              <button onClick={() => navigate("/checkout")} className="btn-primary w-full justify-center mt-6" data-testid="cart-proceed-checkout">
                {t.cart.proceed} <ArrowRight size={16}/>
              </button>
              <p className="text-xs text-[var(--drj-ink-muted)] text-center mt-3">{t.cart.secure}</p>
            </div>

            <div className="bg-white border border-[var(--drj-line)] p-6 lg:p-7">
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

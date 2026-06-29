import React, { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Smartphone, Wallet, Banknote, Building2, ArrowRight, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { apiClient, inr, formatApiError } from "@/lib/api";
import { startRazorpayCheckout } from "@/lib/razorpay";
import { toast } from "sonner";
import { useI18n } from "@/context/I18nContext";

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", icon: Smartphone, note: "GPay · PhonePe · Paytm" },
  { id: "card", label: "Credit / Debit Card", icon: CreditCard, note: "Visa · Mastercard · RuPay" },
  { id: "netbanking", label: "Net Banking", icon: Building2, note: "All major Indian banks" },
  { id: "wallet", label: "Wallets", icon: Wallet, note: "Paytm · Amazon Pay" },
  { id: "cod", label: "Cash on Delivery", icon: Banknote, note: "Pay when you receive" },
];

const STATES = ["Gujarat","Maharashtra","Karnataka","Tamil Nadu","Delhi","Uttar Pradesh","Rajasthan","Madhya Pradesh","West Bengal","Kerala","Punjab","Haryana","Telangana","Andhra Pradesh","Odisha","Bihar","Assam","Jharkhand","Chhattisgarh","Uttarakhand","Himachal Pradesh","Goa","Jammu and Kashmir","Other"];

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { t } = useI18n();
  const [address, setAddress] = useState({ full_name: "", mobile: "", email: "", address: "", landmark: "", city: "", state: "Gujarat", pincode: "" });
  const [payment, setPayment] = useState("upi");
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  const totals = useMemo(() => {
    const sh = subtotal >= 999 ? 0 : 49;
    const disc = appliedCoupon?.discount || 0;
    const taxable = Math.max(subtotal - disc, 0);
    const tx = Math.round(taxable * 0.05);
    return { shipping: sh, discount: disc, tax: tx, total: taxable + sh + tx };
  }, [subtotal, appliedCoupon]);

  const checkoutPayload = useCallback(
    () => ({
      items,
      address,
      coupon_code: appliedCoupon?.code,
      payment_method: payment,
      notes: "",
    }),
    [items, address, appliedCoupon, payment],
  );

  if (items.length === 0) {
    return (
      <div className="container-drj section text-center">
        <h1 className="font-serif text-4xl text-forest">Your cart is empty</h1>
        <button onClick={() => navigate("/shop")} className="btn-primary mt-8">Browse Shop</button>
      </div>
    );
  }

  const tryCoupon = async () => {
    if (!coupon) return;
    try {
      const { data } = await apiClient.post("/coupons/validate", { code: coupon, subtotal });
      setAppliedCoupon(data);
      toast.success(`Applied ${data.code}`);
    } catch (e) {
      toast.error(formatApiError(e?.response?.data?.detail) || "Invalid coupon");
    }
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    try {
      let orderId;

      if (payment === "cod") {
        const { data } = await apiClient.post("/orders", { ...checkoutPayload(), payment_method: "cod" });
        orderId = data.order_id;
      } else {
        orderId = await startRazorpayCheckout({ checkoutPayload: checkoutPayload(), address });
      }

      clear();
      navigate(`/order-confirmation/${orderId}`, { state: { mobile: address.mobile } });
      toast.success("Order placed successfully");
    } catch (e) {
      toast.error(formatApiError(e?.response?.data?.detail) || e?.message || "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div data-testid="checkout-page" className="bg-cream min-h-screen">
      <div className="container-drj py-12 lg:py-20">
        <div className="text-overline text-gold mb-2">{t.checkout.eyebrow}</div>
        <h1 className="font-serif text-5xl text-forest tracking-tight">{t.checkout.title}</h1>

        <form onSubmit={placeOrder} className="grid lg:grid-cols-3 gap-10 mt-12">
          <div className="lg:col-span-2 space-y-12">
            <section className="bg-white border border-[var(--drj-line)] p-8">
              <h2 className="font-serif text-2xl text-forest">{t.checkout.delivery}</h2>
              <div className="grid sm:grid-cols-2 gap-6 mt-8">
                <Field label={t.checkout.fields.name} value={address.full_name} onChange={(v) => setAddress({...address, full_name: v})} testId="checkout-name"/>
                <Field label={t.checkout.fields.mobile} value={address.mobile} onChange={(v) => setAddress({...address, mobile: v})} testId="checkout-mobile"/>
                <Field label={t.checkout.fields.email} type="email" value={address.email} onChange={(v) => setAddress({...address, email: v})} testId="checkout-email"/>
                <Field label={t.checkout.fields.pincode} value={address.pincode} onChange={(v) => setAddress({...address, pincode: v})} testId="checkout-pincode"/>
                <Field label={t.checkout.fields.address} wide value={address.address} onChange={(v) => setAddress({...address, address: v})} testId="checkout-address"/>
                <Field label={t.checkout.fields.landmark} required={false} wide value={address.landmark} onChange={(v) => setAddress({...address, landmark: v})} testId="checkout-landmark"/>
                <Field label={t.checkout.fields.city} value={address.city} onChange={(v) => setAddress({...address, city: v})} testId="checkout-city"/>
                <div>
                  <div className="text-overline text-[var(--drj-ink-muted)] mb-1">{t.checkout.fields.state}</div>
                  <select className="input-luxe" required value={address.state} onChange={(e) => setAddress({...address, state: e.target.value})} data-testid="checkout-state">
                    {STATES.map((s) => (<option key={s}>{s}</option>))}
                  </select>
                </div>
              </div>
            </section>

            <section className="bg-white border border-[var(--drj-line)] p-8">
              <h2 className="font-serif text-2xl text-forest">Payment Method</h2>
              <div className="grid sm:grid-cols-2 gap-3 mt-6" data-testid="payment-methods">
                {PAYMENT_METHODS.map((m) => (
                  <label
                    key={m.id}
                    className={`border cursor-pointer p-4 flex items-center gap-4 transition ${payment === m.id ? "border-forest bg-[var(--drj-bg)]" : "border-[var(--drj-line)] hover:border-forest/50"}`}
                    data-testid={`pay-option-${m.id}`}
                  >
                    <input type="radio" name="payment" value={m.id} checked={payment === m.id} onChange={() => setPayment(m.id)} className="accent-[var(--drj-forest)]"/>
                    <m.icon size={20} className="text-forest"/>
                    <div className="flex-1">
                      <div className="font-medium text-forest">{m.label}</div>
                      <div className="text-xs text-[var(--drj-ink-muted)] mt-0.5">{m.note}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs text-[var(--drj-ink-muted)]">
                <ShieldCheck size={14} className="text-forest"/>
                <span>
                  {payment === "cod"
                    ? "Pay cash when your order is delivered."
                    : "Secure payment powered by Razorpay. You will complete payment in the Razorpay checkout."}
                </span>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-[var(--drj-line)] p-7 sticky top-32">
              <h3 className="font-serif text-2xl text-forest">{t.checkout.summary}</h3>
              <div className="space-y-3 mt-6 max-h-44 overflow-y-auto pr-2">
                {items.map((it) => (
                  <div key={it.product_id} className="flex justify-between text-sm">
                    <span className="text-[var(--drj-ink)] truncate pr-2">{it.name} <span className="text-[var(--drj-ink-muted)]">× {it.quantity}</span></span>
                    <span className="text-forest font-medium whitespace-nowrap">{inr(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[var(--drj-line)] my-5"></div>
              <div className="flex items-end gap-2 border-b border-[var(--drj-line)] mb-5">
                <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} className="input-luxe border-0 py-2 flex-1 uppercase" placeholder="Coupon code" data-testid="checkout-coupon-input"/>
                <button type="button" onClick={tryCoupon} className="text-overline text-forest pb-2" data-testid="checkout-apply-coupon">Apply</button>
              </div>
              <div className="space-y-2 text-sm">
                <Row label="Subtotal" value={inr(subtotal)}/>
                {totals.discount > 0 && <Row label="Discount" value={`− ${inr(totals.discount)}`} accent/>}
                <Row label="Shipping" value={totals.shipping === 0 ? "Free" : inr(totals.shipping)}/>
                <Row label="GST (5%)" value={inr(totals.tax)}/>
              </div>
              <div className="border-t border-[var(--drj-line)] mt-4 pt-4 flex justify-between items-baseline">
                <span className="text-overline text-forest">Total</span>
                <span className="font-serif text-3xl text-forest" data-testid="checkout-total">{inr(totals.total)}</span>
              </div>
              <button type="submit" disabled={placing} className="btn-primary w-full justify-center mt-6" data-testid="place-order-button">
                {placing ? "Processing..." : payment === "cod" ? t.checkout.place_order : "Pay securely"} <ArrowRight size={16}/>
              </button>
              <p className="text-[10px] text-[var(--drj-ink-muted)] text-center mt-3">{t.checkout.terms}</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const Field = ({ label, value, onChange, type = "text", wide, testId, required = true }) => (
  <div className={wide ? "sm:col-span-2" : ""}>
    <div className="text-overline text-[var(--drj-ink-muted)] mb-1">{label}</div>
    <input
      type={type}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input-luxe"
      data-testid={testId}
    />
  </div>
);

const Row = ({ label, value, accent }) => (
  <div className="flex justify-between">
    <span className="text-[var(--drj-ink-muted)]">{label}</span>
    <span className={accent ? "text-forest font-medium" : "text-[var(--drj-ink)]"}>{value}</span>
  </div>
);

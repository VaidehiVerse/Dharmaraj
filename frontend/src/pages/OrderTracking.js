import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Package, CheckCircle2, Box, Truck, Home, Sparkles } from "lucide-react";
import { apiClient, inr } from "@/lib/api";
import { useI18n } from "@/context/I18nContext";
import { toast } from "sonner";

const STATUS_ICONS = {
  confirmed: CheckCircle2,
  processing: Sparkles,
  packed: Package,
  shipped: Box,
  out_for_delivery: Truck,
  delivered: Home,
};

export default function OrderTracking() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const [orderId, setOrderId] = useState(params.get("order_id") || "");
  const [mobile, setMobile] = useState(params.get("mobile") || "");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const allStatuses = Object.keys(STATUS_ICONS).map((key) => ({
    key,
    label: t.track.statuses[key],
    icon: STATUS_ICONS[key],
  }));

  const track = async (e) => {
    if (e) e.preventDefault();
    if (!orderId || !mobile) return;
    setLoading(true);
    try {
      const { data } = await apiClient.get("/orders/track", { params: { order_id: orderId, mobile } });
      setOrder(data);
    } catch (e) {
      toast.error(e?.response?.data?.detail || t.track.not_found);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.get("order_id") && params.get("mobile")) track();
    // eslint-disable-next-line
  }, []);

  const currentIdx = order ? allStatuses.findIndex((s) => s.key === order.status) : -1;

  return (
    <div data-testid="track-page" className="bg-white min-h-screen">
      <section className="bg-cream relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-[var(--drj-gold-soft)] opacity-50 rounded-full blur-3xl"/>
        <div className="container-drj py-6 lg:py-12 relative">
          <div className="text-overline text-gold">{t.track.eyebrow}</div>
          <h1 className="font-serif text-5xl lg:text-6xl mt-3 tracking-tight text-forest">{t.track.title}</h1>
          <p className="text-[var(--drj-ink-muted)] mt-4 max-w-xl font-light">{t.track.desc}</p>
        </div>
      </section>
      <div className="container-drj py-6 lg:py-10 grid lg:grid-cols-3 gap-10">
        <form onSubmit={track} className="bg-white border border-[var(--drj-line)] p-8 lg:col-span-1 self-start space-y-6" data-testid="track-form">
          <div>
            <div className="text-overline text-[var(--drj-ink-muted)] mb-1">{t.track.order_id}</div>
            <input className="input-luxe uppercase" required placeholder="DA12345678" value={orderId} onChange={(e) => setOrderId(e.target.value.toUpperCase())} data-testid="track-order-id"/>
          </div>
          <div>
            <div className="text-overline text-[var(--drj-ink-muted)] mb-1">{t.track.mobile}</div>
            <input className="input-luxe" required placeholder="+91 XXXXX XXXXX" value={mobile} onChange={(e) => setMobile(e.target.value)} data-testid="track-mobile"/>
          </div>
          <button disabled={loading} className="btn-primary w-full justify-center" data-testid="track-submit">{loading ? t.track.looking_up : t.track.submit}</button>
        </form>

        <div className="lg:col-span-2">
          {order ? (
            <div className="bg-white border border-[var(--drj-line)] p-8" data-testid="track-results">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <div className="text-overline text-gold">Order #{order.order_id}</div>
                  <h2 className="font-serif text-3xl text-forest mt-2">{t.track.order_for} {order.address.full_name}</h2>
                  <div className="text-xs text-[var(--drj-ink-muted)] mt-1">{t.track.placed} {new Date(order.created_at).toLocaleString("en-IN")}</div>
                </div>

                <div className="text-right">
                  <div className="text-overline text-[var(--drj-ink-muted)]">{t.track.total}</div>
                  <div className="font-serif text-3xl text-forest" data-testid="track-total">{inr(order.total)}</div>
                </div>
              </div>

              <div className="mt-10 relative" data-testid="track-timeline">
                {allStatuses.map((s, i) => {
                  const reached = i <= Math.max(currentIdx, 0);
                  const Icon = s.icon;
                  return (
                    <div key={s.key} className="flex gap-5 relative pb-8 last:pb-0">
                      {i < allStatuses.length - 1 && (
                        <span className={`absolute left-[19px] top-10 bottom-0 w-px ${reached && i < currentIdx ? "bg-forest" : "bg-[var(--drj-line)]"}`}></span>
                      )}
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center border ${reached ? "bg-forest border-forest text-white" : "bg-white border-[var(--drj-line)] text-[var(--drj-ink-muted)]"}`}>
                        <Icon size={16}/>
                      </div>
                      <div className="pt-1">
                        <div className={`font-serif text-lg ${reached ? "text-forest" : "text-[var(--drj-ink-muted)]"}`}>{s.label}</div>
                        {i === currentIdx && (
                          <div className="text-sm text-[var(--drj-ink-muted)] font-light mt-1">{order.timeline?.[order.timeline.length - 1]?.note}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid sm:grid-cols-2 gap-8 mt-10 pt-8 border-t border-[var(--drj-line)] text-sm">
                <div>
                  <div className="text-overline text-gold mb-2">{t.track.shipping_to}</div>
                  <p className="text-[var(--drj-ink)] font-light">{order.address.full_name}<br/>{order.address.address}{order.address.landmark ? `, ${order.address.landmark}` : ""}<br/>{order.address.city}, {order.address.state} — {order.address.pincode}<br/>{order.address.mobile}</p>
                </div>
                <div>
                  <div className="text-overline text-gold mb-2">{t.track.items}</div>
                  <ul className="space-y-1 text-[var(--drj-ink)]">
                    {order.items.map((it, i) => (<li key={i} className="font-light">{it.name} × {it.quantity}</li>))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-dashed border-[var(--drj-line)] p-12 text-center text-[var(--drj-ink-muted)] font-light">
              <Package size={36} className="mx-auto text-gold mb-4" />
              {t.track.empty}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

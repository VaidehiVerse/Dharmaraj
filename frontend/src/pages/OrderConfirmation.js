import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { CheckCircle2, ArrowRight, Truck } from "lucide-react";
import { useI18n } from "@/context/I18nContext";

export default function OrderConfirmation() {
  const { t } = useI18n();
  const { orderId } = useParams();
  const { state } = useLocation();
  const mobile = state?.mobile;

  return (
    <div data-testid="order-confirmation-page" className="bg-cream min-h-screen">
      <div className="container-drj section text-center max-w-2xl">
        <CheckCircle2 size={80} className="mx-auto text-gold" />
        <div className="drj-divider text-overline mt-8 mb-4">{t.order_confirm.eyebrow}</div>
        <h1 className="font-serif text-5xl text-forest tracking-tight">{t.order_confirm.title}</h1>
        <p className="text-[var(--drj-ink-muted)] mt-5 font-light leading-relaxed text-lg">
          {t.order_confirm.desc}
        </p>
        <div className="bg-white border border-[var(--drj-line)] p-8 mt-10 text-left">
          <div className="text-overline text-gold mb-2">{t.order_confirm.order_number}</div>
          <div className="font-serif text-3xl text-forest tracking-wider" data-testid="confirmation-order-id">{orderId}</div>
          {mobile && (
            <div className="mt-5 pt-5 border-t border-[var(--drj-line)] text-sm text-[var(--drj-ink-muted)]">
              {t.order_confirm.track_note} <span className="text-forest font-medium">{orderId}</span> {t.order_confirm.and_mobile} <span className="text-forest font-medium">{mobile}</span>.
            </div>
          )}
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to={`/track?order_id=${orderId}${mobile ? `&mobile=${mobile}` : ""}`}
            className="btn-primary"
            data-testid="confirmation-track-button"
          >
            <Truck size={16}/> {t.order_confirm.track_order}
          </Link>
          <Link to="/shop" className="btn-outline" data-testid="confirmation-continue-shopping">{t.order_confirm.continue_shopping} <ArrowRight size={16}/></Link>
        </div>
      </div>
    </div>
  );
}

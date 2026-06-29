import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Phone, Mail, MapPin, Send, BadgeCheck } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { apiClient } from "@/lib/api";
import { useI18n } from "@/context/I18nContext";
import { toast } from "sonner";

export default function Footer() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const badges = [
    t.common.badges.udyam,
    t.common.badges.fssai,
    t.common.badges.iso,
    t.common.badges.gst,
  ];

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const { data } = await apiClient.post("/newsletter", { email });
      toast.success(data.message || t.footer.subscribed);
      setEmail("");
    } catch (err) {
      toast.error(err?.response?.data?.detail || t.footer.subscribe_error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-cream border-t-2 border-[var(--drj-gold)] text-[var(--drj-ink)]" data-testid="site-footer">
      <div className="container-drj py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-4 mb-6">
              <img src={BRAND.logo} alt="Dharmaraj Ayurveda" className="h-16 w-16 object-contain" />
              <div>
                <h3 className="font-serif text-3xl text-forest">Dharmaraj</h3>
                <div className="text-overline text-gold">{BRAND.motto}</div>
              </div>
            </div>
            <p className="text-[var(--drj-ink-muted)] max-w-md leading-relaxed font-light">
              {t.common.footer_desc}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {badges.map((b) => (
                <span key={b} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[var(--drj-gold)] text-xs text-forest">
                  <BadgeCheck size={12} className="text-gold" /> {b}
                </span>
              ))}
            </div>
            <form onSubmit={subscribe} className="mt-8 max-w-md" data-testid="newsletter-form">
              <div className="text-overline text-gold mb-3">{t.footer.newsletter}</div>
              <div className="flex items-end gap-3 border-b border-[var(--drj-line-strong)]">
                <input
                  type="email"
                  required
                  placeholder={t.footer.email_placeholder}
                  className="input-luxe flex-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="newsletter-email-input"
                />
                <button type="submit" disabled={loading} className="text-gold hover:text-[var(--drj-forest)] pb-3 transition" data-testid="newsletter-submit-button">
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-2">
            <div className="text-overline text-gold mb-5">{t.footer.discover}</div>
            <ul className="space-y-3 text-sm text-[var(--drj-ink-muted)]">
              <li><Link to="/shop" data-testid="footer-shop-link" className="hover:text-gold transition">{t.nav.shop}</Link></li>
              <li><Link to="/product/1-vajra" data-testid="footer-vajra-link" className="hover:text-gold transition">{t.nav.product}</Link></li>
              <li><Link to="/about" data-testid="footer-about-link" className="hover:text-gold transition">{t.footer.our_story}</Link></li>
              <li><Link to="/track" data-testid="footer-track-link" className="hover:text-gold transition">{t.nav.track}</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <div className="text-overline text-gold mb-5">{t.footer.care}</div>
            <ul className="space-y-3 text-sm text-[var(--drj-ink-muted)]">
              <li><Link to="/contact" data-testid="footer-contact-link" className="hover:text-gold transition">{t.nav.contact}</Link></li>
              <li><Link to="/faq" data-testid="footer-faq-link" className="hover:text-gold transition">{t.footer.faqs}</Link></li>
              <li><Link to="/policy/shipping" data-testid="footer-shipping-link" className="hover:text-gold transition">{t.footer.shipping}</Link></li>
              <li><Link to="/policy/refund" data-testid="footer-refund-link" className="hover:text-gold transition">{t.footer.refunds}</Link></li>
              <li><Link to="/policy/terms" data-testid="footer-terms-link" className="hover:text-gold transition">{t.footer.terms}</Link></li>
              <li><Link to="/policy/privacy" data-testid="footer-privacy-link" className="hover:text-gold transition">{t.footer.privacy}</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <div className="text-overline text-gold mb-5">{t.footer.visit}</div>
            <ul className="space-y-4 text-sm text-[var(--drj-ink-muted)]">
              <li className="flex gap-3"><MapPin size={16} className="text-gold mt-0.5 shrink-0" /><span>{BRAND.address}</span></li>
              <li className="flex gap-3"><Phone size={16} className="text-gold mt-0.5 shrink-0" /><a href={`tel:${BRAND.phone}`} className="hover:text-gold transition" data-testid="footer-phone">{BRAND.phone}</a></li>
              <li className="flex gap-3"><Mail size={16} className="text-gold mt-0.5 shrink-0" /><a href={`mailto:${BRAND.email}`} className="hover:text-gold transition">{BRAND.email}</a></li>
            </ul>
            <a
              href={BRAND.instagram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 mt-6 text-gold hover:text-forest transition"
              data-testid="footer-instagram-link"
            >
              <Instagram size={18} /> @dharmarajayurveda
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--drj-line)] bg-white">
        <div className="container-drj py-5 flex flex-col md:flex-row gap-3 items-center justify-between text-xs text-[var(--drj-ink-muted)]">
          <div>© {new Date().getFullYear()} Dharmaraj Ayurveda™ · {t.common.rights}</div>
          <div className="flex items-center gap-4">
            <span className="opacity-30">|</span>
            <span>{t.common.made_in}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

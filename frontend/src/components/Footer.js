import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Phone, Mail, MapPin, Send } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const { data } = await apiClient.post("/newsletter", { email });
      toast.success(data.message || "Subscribed!");
      setEmail("");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not subscribe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-obsidian text-[var(--drj-bg)] mt-0" data-testid="site-footer">
      <div className="container-drj py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-4 mb-6">
              <img src={BRAND.logo} alt="Dharmaraj Ayurveda" className="h-16 w-16 object-contain bg-white/5 p-1" />
              <div>
                <h3 className="font-serif text-3xl">Dharmaraj</h3>
                <div className="text-overline text-gold">{BRAND.motto}</div>
              </div>
            </div>
            <p className="text-white/60 max-w-md leading-relaxed font-light">
              Pure Ayurvedic formulations crafted in the heart of Gujarat. Every capsule is a quiet act
              of reverence to a 5,000-year-old science of wellness.
            </p>
            <form onSubmit={subscribe} className="mt-8 max-w-md" data-testid="newsletter-form">
              <div className="text-overline text-gold mb-3">Join the Dharmaraj Circle</div>
              <div className="flex items-end gap-3 border-b border-white/15">
                <input
                  type="email"
                  required
                  placeholder="Your email"
                  className="input-luxe-dark flex-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="newsletter-email-input"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="text-gold hover:text-[var(--drj-gold-bright)] pb-3 transition"
                  data-testid="newsletter-submit-button"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-2">
            <div className="text-overline text-gold mb-5">Discover</div>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link to="/shop" data-testid="footer-shop-link" className="hover:text-gold transition">Shop</Link></li>
              <li><Link to="/product/1-vajra" data-testid="footer-vajra-link" className="hover:text-gold transition">1 Vajra</Link></li>
              <li><Link to="/about" data-testid="footer-about-link" className="hover:text-gold transition">Our Story</Link></li>
              <li><Link to="/blog" data-testid="footer-blog-link" className="hover:text-gold transition">Ayurveda Journal</Link></li>
              <li><Link to="/track" data-testid="footer-track-link" className="hover:text-gold transition">Track Order</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <div className="text-overline text-gold mb-5">Care</div>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link to="/contact" data-testid="footer-contact-link" className="hover:text-gold transition">Contact</Link></li>
              <li><Link to="/faq" data-testid="footer-faq-link" className="hover:text-gold transition">FAQs</Link></li>
              <li><Link to="/policy/shipping" data-testid="footer-shipping-link" className="hover:text-gold transition">Shipping</Link></li>
              <li><Link to="/policy/refund" data-testid="footer-refund-link" className="hover:text-gold transition">Refunds</Link></li>
              <li><Link to="/policy/terms" data-testid="footer-terms-link" className="hover:text-gold transition">Terms</Link></li>
              <li><Link to="/policy/privacy" data-testid="footer-privacy-link" className="hover:text-gold transition">Privacy</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <div className="text-overline text-gold mb-5">Visit</div>
            <ul className="space-y-4 text-sm text-white/70">
              <li className="flex gap-3"><MapPin size={16} className="text-gold mt-0.5 shrink-0" /><span>{BRAND.address}</span></li>
              <li className="flex gap-3"><Phone size={16} className="text-gold mt-0.5 shrink-0" /><a href={`tel:${BRAND.phone}`} className="hover:text-gold transition">{BRAND.phone}</a></li>
              <li className="flex gap-3"><Mail size={16} className="text-gold mt-0.5 shrink-0" /><a href={`mailto:${BRAND.email}`} className="hover:text-gold transition">{BRAND.email}</a></li>
            </ul>
            <a
              href={BRAND.instagram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 mt-6 text-gold hover:text-[var(--drj-gold-bright)] transition"
              data-testid="footer-instagram-link"
            >
              <Instagram size={18} /> @dharmarajayurveda
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-drj py-6 flex flex-col md:flex-row gap-3 items-center justify-between text-xs text-white/40">
          <div>© {new Date().getFullYear()} Dharmaraj Ayurveda™ · All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span>FSSAI · ISO · GMP Certified</span>
            <span className="opacity-30">|</span>
            <span>Made with reverence in Surat, India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

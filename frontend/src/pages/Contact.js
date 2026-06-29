import React, { useState } from "react";
import { Phone, Mail, MapPin, Instagram, Clock, Send } from "lucide-react";
import { BRAND, whatsappLink } from "@/lib/brand";
import { apiClient } from "@/lib/api";
import { useI18n } from "@/context/I18nContext";
import { toast } from "sonner";

export default function Contact() {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: "", email: "", mobile: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await apiClient.post("/contact", form);
      toast.success(data.message || t.contact.sent);
      setForm({ name: "", email: "", mobile: "", subject: "", message: "" });
    } catch (e) {
      toast.error(e?.response?.data?.detail || t.contact.send_error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="contact-page" className="bg-white">
      <section className="bg-cream border-b border-[var(--drj-line)] relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[var(--drj-gold-soft)] opacity-40 rounded-full blur-3xl pointer-events-none"/>
        <div className="container-drj page-lead relative">
          <div className="text-overline text-gold">{t.contact.connect}</div>
          <h1 className="font-serif text-4xl lg:text-6xl tracking-tight text-forest mt-2">{t.contact.title}</h1>
          <p className="text-[var(--drj-ink-muted)] mt-3 max-w-xl font-light">{t.contact.desc}</p>
        </div>
      </section>

      <section className="page-content">
        <div className="container-drj grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div className="border-l-2 border-gold pl-6">
              <div className="text-overline text-gold mb-2"><Phone size={14} className="inline mr-2"/>{t.contact.call}</div>
              <a href={`tel:${BRAND.phone}`} className="font-serif text-2xl text-forest hover:text-gold transition" data-testid="contact-phone">{BRAND.phone}</a>
            </div>
            <div className="border-l-2 border-gold pl-6">
              <div className="text-overline text-gold mb-2"><Mail size={14} className="inline mr-2"/>{t.contact.email}</div>
              <a href={`mailto:${BRAND.email}`} className="font-serif text-2xl text-forest hover:text-gold transition break-all" data-testid="contact-email">{BRAND.email}</a>
            </div>
            <div className="border-l-2 border-gold pl-6">
              <div className="text-overline text-gold mb-2"><MapPin size={14} className="inline mr-2"/>{t.contact.visit}</div>
              <p className="text-[var(--drj-ink)] font-light leading-relaxed" data-testid="contact-address">{BRAND.address}</p>
            </div>
            <div className="border-l-2 border-gold pl-6">
              <div className="text-overline text-gold mb-2"><Clock size={14} className="inline mr-2"/>{t.contact.hours}</div>
              <p className="text-[var(--drj-ink)] font-light">{BRAND.hours}</p>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <a href={whatsappLink()} target="_blank" rel="noreferrer" className="btn-gold" data-testid="contact-whatsapp-button"><i className="fa-brands fa-whatsapp"></i> {t.cta.whatsapp}</a>
              <a href={BRAND.instagram} target="_blank" rel="noreferrer" className="btn-outline" data-testid="contact-instagram-button"><Instagram size={16}/> Instagram</a>
            </div>
          </div>

          <form onSubmit={submit} className="lg:col-span-7 bg-white border border-[var(--drj-line)] p-6 lg:p-8 space-y-6" data-testid="contact-form">
            <div>
              <div className="drj-divider text-overline mb-1">{t.contact.form_eyebrow}</div>
              <h2 className="font-serif text-2xl lg:text-3xl text-forest">{t.contact.form_title}</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label={t.contact.your_name} value={form.name} onChange={(v) => setForm({...form, name: v})} testId="contact-name"/>
              <Field label={t.contact.mobile} required={false} value={form.mobile} onChange={(v) => setForm({...form, mobile: v})} testId="contact-mobile"/>
              <Field label={t.auth.email} type="email" value={form.email} onChange={(v) => setForm({...form, email: v})} testId="contact-email-input" wide/>
              <Field label={t.contact.subject} value={form.subject} onChange={(v) => setForm({...form, subject: v})} testId="contact-subject" wide/>
            </div>
            <div>
              <div className="text-overline text-[var(--drj-ink-muted)] mb-1">{t.contact.message}</div>
              <textarea required rows={5} className="input-luxe" value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} data-testid="contact-message"/>
            </div>
            <button disabled={loading} className="btn-primary" data-testid="contact-submit"><Send size={16}/> {loading ? t.contact.sending : t.contact.send}</button>
          </form>
        </div>
      </section>
    </div>
  );
}

const Field = ({ label, value, onChange, type = "text", wide, testId, required = true }) => (
  <div className={wide ? "sm:col-span-2" : ""}>
    <div className="text-overline text-[var(--drj-ink-muted)] mb-1">{label}</div>
    <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} className="input-luxe" data-testid={testId}/>
  </div>
);

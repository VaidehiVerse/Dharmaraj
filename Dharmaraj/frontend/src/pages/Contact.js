import React, { useState } from "react";
import { Phone, Mail, MapPin, Instagram, Clock, Send } from "lucide-react";
import { BRAND, whatsappLink } from "@/lib/brand";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", mobile: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await apiClient.post("/contact", form);
      toast.success(data.message || "Message sent");
      setForm({ name: "", email: "", mobile: "", subject: "", message: "" });
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not send");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="contact-page" className="bg-white">
      

      <section className="section">
        <div className="container-drj grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-8">
            <div className="border-l-2 border-gold pl-6">
              <div className="text-overline text-gold mb-2"><Phone size={14} className="inline mr-2"/>Call</div>
              <a href={`tel:${BRAND.phone}`} className="font-serif text-2xl text-forest hover:text-gold transition" data-testid="contact-phone">{BRAND.phone}</a>
            </div>
            <div className="border-l-2 border-gold pl-6">
              <div className="text-overline text-gold mb-2"><Mail size={14} className="inline mr-2"/>Email</div>
              <a href={`mailto:${BRAND.email}`} className="font-serif text-2xl text-forest hover:text-gold transition break-all" data-testid="contact-email">{BRAND.email}</a>
            </div>
            <div className="border-l-2 border-gold pl-6">
              <div className="text-overline text-gold mb-2"><MapPin size={14} className="inline mr-2"/>Visit</div>
              <p className="text-[var(--drj-ink)] font-light leading-relaxed" data-testid="contact-address">{BRAND.address}</p>
            </div>
            <div className="border-l-2 border-gold pl-6">
              <div className="text-overline text-gold mb-2"><Clock size={14} className="inline mr-2"/>Hours</div>
              <p className="text-[var(--drj-ink)] font-light">{BRAND.hours}</p>
            </div>
            <div className="flex gap-3 pt-4">
              <a href={whatsappLink()} target="_blank" rel="noreferrer" className="btn-gold" data-testid="contact-whatsapp-button"><i className="fa-brands fa-whatsapp"></i> WhatsApp</a>
              <a href={BRAND.instagram} target="_blank" rel="noreferrer" className="btn-outline" data-testid="contact-instagram-button"><Instagram size={16}/> Instagram</a>
            </div>
          </div>

          <form onSubmit={submit} className="lg:col-span-7 bg-white border border-[var(--drj-line)] p-8 lg:p-12 space-y-6" data-testid="contact-form">
            <div>
              <div className="drj-divider text-overline mb-3">Send a Message</div>
              <h2 className="font-serif text-3xl text-forest">We respond within 24 hours.</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <Field label="Your Name" value={form.name} onChange={(v) => setForm({...form, name: v})} testId="contact-name"/>
              <Field label="Mobile" required={false} value={form.mobile} onChange={(v) => setForm({...form, mobile: v})} testId="contact-mobile"/>
              <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({...form, email: v})} testId="contact-email-input" wide/>
              <Field label="Subject" value={form.subject} onChange={(v) => setForm({...form, subject: v})} testId="contact-subject" wide/>
            </div>
            <div>
              <div className="text-overline text-[var(--drj-ink-muted)] mb-1">Message</div>
              <textarea required rows={5} className="input-luxe" value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} data-testid="contact-message"/>
            </div>
            <button disabled={loading} className="btn-primary" data-testid="contact-submit"><Send size={16}/> {loading ? "Sending..." : "Send Message"}</button>
          </form>
        </div>
      </section>
      <section className="bg-cream relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[var(--drj-gold-soft)] opacity-50 rounded-full blur-3xl"/>
        <div className="container-drj py-6 lg:py-10 relative">
          <div className="text-overline text-gold mb-3">Connect</div>
          <h1 className="font-serif text-5xl lg:text-7xl tracking-tight text-forest">We're listening.</h1>
          <p className="text-[var(--drj-ink-muted)] mt-5 max-w-xl font-light text-lg">Questions about your ritual? Wholesale enquiries? A friendly hello? Our wellness desk is here for you.</p>
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

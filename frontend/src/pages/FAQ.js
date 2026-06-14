import React, { useMemo, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search } from "lucide-react";
import { whatsappLink } from "@/lib/brand";
import { useI18n } from "@/context/I18nContext";

const FAQS = [
  { cat: "Product", q: "How long until I feel the benefits of 1 Vajra?", a: "Most customers report noticeable energy and digestion improvements within 14–21 days. For deeper Rasayana effects, we recommend a continuous 60–90 day cycle." },
  { cat: "Product", q: "Is 1 Vajra safe for daily long-term use?", a: "Yes. 1 Vajra is a 100% botanical formulation with classically-used herbs. It is FSSAI-licensed as a health supplement and contains no stimulants or synthetics." },
  { cat: "Product", q: "Can women take 1 Vajra?", a: "Absolutely. Shatavari and Amla make it particularly nourishing for women. Pregnant or lactating women should consult their healthcare provider first." },
  { cat: "Product", q: "Is 1 Vajra vegetarian?", a: "Yes — vegetable HPMC capsule shell. 100% vegetarian and plant-based." },
  { cat: "Product", q: "What is the shelf life?", a: "24 months from manufacturing. Best Before is printed on the label." },
  { cat: "Delivery", q: "Where do you ship?", a: "Pan-India delivery. We also accept international enquiries via WhatsApp." },
  { cat: "Delivery", q: "How long does delivery take?", a: "Metro cities: 2–4 working days. Other locations: 4–7 working days. Free shipping on orders above ₹999." },
  { cat: "Delivery", q: "Do you offer Cash on Delivery?", a: "Yes — COD is available across India. A small handling fee may apply for very remote pincodes." },
  { cat: "Payments", q: "Which payment methods do you support?", a: "UPI (GPay, PhonePe, Paytm), credit & debit cards, net banking, wallets, and Cash on Delivery." },
  { cat: "Payments", q: "Are online payments secure?", a: "Yes. We use industry-standard encryption for all online transactions. We never store card details." },
  { cat: "Refunds", q: "What is your refund policy?", a: "7-Day Return Policy on unopened products. For opened bottles, please reach out via WhatsApp — we'll always find a fair resolution." },
  { cat: "Refunds", q: "How long do refunds take?", a: "Once approved, refunds are processed within 5–7 working days to your original payment method." },
  { cat: "Returns", q: "Can I exchange a product?", a: "Yes. Within 7 days of delivery for damaged or incorrect items. Contact our wellness desk on WhatsApp." },
];

const CATS = ["All", "Product", "Delivery", "Payments", "Refunds", "Returns"];

export default function FAQ() {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const filtered = useMemo(() => {
    let arr = FAQS;
    if (cat !== "All") arr = arr.filter((f) => f.cat === cat);
    if (q) {
      const s = q.toLowerCase();
      arr = arr.filter((f) => f.q.toLowerCase().includes(s) || f.a.toLowerCase().includes(s));
    }
    return arr;
  }, [q, cat]);

  return (
    <div data-testid="faq-page" className="bg-[var(--drj-bg)] min-h-screen">
      <section className="bg-cream relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-[var(--drj-gold-soft)] opacity-50 rounded-full blur-3xl"/>
        <div className="container-drj py-24 lg:py-32 relative">
          <div className="text-overline text-gold mb-3">Frequently Asked</div>
          <h1 className="font-serif text-5xl lg:text-7xl tracking-tight text-forest">Curious minds, answered.</h1>
          <p className="text-[var(--drj-ink-muted)] mt-5 max-w-xl font-light text-lg">Everything you need to know about our products, shipping, payments and returns.</p>
        </div>
      </section>

      <section className="container-drj py-12 lg:py-20">
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
          <div className="flex items-center gap-2 border-b border-[var(--drj-line)] flex-1">
            <Search size={16} className="text-[var(--drj-ink-muted)]"/>
            <input className="input-luxe border-0 py-3 flex-1" placeholder={t.faq.search} value={q} onChange={(e) => setQ(e.target.value)} data-testid="faq-search"/>
          </div>
          <div className="flex flex-wrap gap-2" data-testid="faq-cats">
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`text-xs uppercase tracking-[0.18em] px-4 py-2 border transition ${cat === c ? "bg-forest text-white border-forest" : "border-[var(--drj-line)] text-[var(--drj-ink-muted)] hover:border-forest hover:text-forest"}`}
                data-testid={`faq-cat-${c.toLowerCase()}`}
              >
                {t.faq.categories[c] || c}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 font-light text-[var(--drj-ink-muted)]">No matches. Try a different search or <a href={whatsappLink()} className="text-forest underline">ask us on WhatsApp</a>.</div>
        ) : (
          <Accordion type="single" collapsible className="border-t border-[var(--drj-line)]">
            {filtered.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-b border-[var(--drj-line)]" data-testid={`faq-${i}`}>
                <AccordionTrigger className="text-left font-serif text-xl text-forest hover:no-underline py-6">
                  <span><span className="text-overline text-gold mr-3">{f.cat}</span>{f.q}</span>
                </AccordionTrigger>
                <AccordionContent className="text-[var(--drj-ink-muted)] font-light pb-6 leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </section>

      <section className="bg-forest text-white relative overflow-hidden">
        <div className="absolute -top-20 right-20 w-96 h-96 bg-[var(--drj-gold)] opacity-10 rounded-full blur-3xl"/>
        <div className="container-drj py-16 grid lg:grid-cols-2 gap-6 items-center">
          <div>
            <div className="text-overline text-[var(--drj-gold-bright)] mb-3">{t.faq.cta_title}</div>
            <h2 className="font-serif text-3xl lg:text-4xl">{t.faq.cta_desc}</h2>
          </div>
          <div className="flex flex-wrap gap-4 lg:justify-end">
            <a href={whatsappLink()} target="_blank" rel="noreferrer" className="btn-gold" data-testid="faq-whatsapp"><i className="fa-brands fa-whatsapp"></i> WhatsApp Us</a>
          </div>
        </div>
      </section>
    </div>
  );
}

import React from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { BRAND } from "@/lib/brand";

const POLICIES = {
  privacy: {
    title: "Privacy Policy",
    subtitle: "How we protect, use and respect your data.",
    sections: [
      { h: "Information We Collect", p: "We collect information you provide voluntarily — name, contact details, shipping address, and payment information — to fulfill your orders. We also collect anonymous browsing data via cookies for site analytics." },
      { h: "How We Use Your Information", p: "Your information is used solely to process orders, send order updates, respond to enquiries, send opt-in newsletters, and improve our products and services. We never sell your data." },
      { h: "Data Security", p: "Payments are processed by PCI-DSS compliant gateways. We use SSL encryption across the site. Card details are never stored on our servers." },
      { h: "Third-Party Sharing", p: "We share only the minimum information required with shipping partners, payment gateways and SMS/email providers. All partners are GDPR-compliant or equivalent." },
      { h: "Your Rights", p: `You may request to view, update or delete your personal data at any time by emailing ${BRAND.email}. We honor all such requests within 7 working days.` },
      { h: "Cookies", p: "Our site uses cookies for cart persistence and analytics. You may disable cookies via your browser, though some site features may not function fully." },
      { h: "Updates", p: "This policy may be updated periodically. Material changes will be communicated via email to subscribed customers." },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    subtitle: "The agreement between you and Dharmaraj Ayurveda.",
    sections: [
      { h: "Acceptance of Terms", p: "By accessing or using our website, you agree to be bound by these terms. If you do not agree, please discontinue use." },
      { h: "Product Information", p: "We make every effort to display accurate product, ingredient and pricing information. However, we reserve the right to correct any errors and to limit order quantities." },
      { h: "Health Disclaimer", p: "Our products are health supplements, not medicines. They are not intended to diagnose, treat, cure or prevent any disease. Always consult a qualified healthcare professional before starting any supplement, especially if you are pregnant, lactating, on medication, or have a medical condition." },
      { h: "Pricing & Payment", p: "All prices are in INR and inclusive of applicable taxes (GST). We reserve the right to revise prices at our discretion. Payment must be received before order processing for prepaid orders." },
      { h: "Order Acceptance", p: "An order confirmation email does not constitute acceptance. We reserve the right to refuse or cancel an order at any time for reasons including but not limited to product availability, pricing errors, or suspected fraud." },
      { h: "Intellectual Property", p: "All content — logos, text, images, product names — is the property of Dharmaraj Ayurveda™ and protected under Indian and international law. Unauthorized use is prohibited." },
      { h: "Limitation of Liability", p: "To the maximum extent permitted by law, Dharmaraj Ayurveda is not liable for any indirect, incidental, or consequential damages arising from the use of our products or website." },
      { h: "Governing Law", p: "These terms are governed by the laws of India, with exclusive jurisdiction of the courts of Surat, Gujarat." },
    ],
  },
  shipping: {
    title: "Shipping Policy",
    subtitle: "Crafted with care. Delivered with respect.",
    sections: [
      { h: "Coverage", p: "We deliver to all serviceable pincodes across India. International shipping is currently available on WhatsApp request." },
      { h: "Shipping Charges", p: "FREE shipping on orders above ₹999. A flat fee of ₹49 applies on orders below ₹999. COD orders may carry an additional ₹30 handling fee on select pincodes." },
      { h: "Dispatch & Delivery Times", p: "Orders are dispatched within 24–48 hours (business days). Delivery: Metro cities — 2–4 working days; Tier-II — 3–6 working days; remote pincodes — 5–8 working days." },
      { h: "Tracking", p: "An SMS/Email with tracking link is sent once your order is shipped. You can also track via the Track Order page on our site." },
      { h: "Failed Deliveries", p: "If a delivery attempt fails (incorrect address, unavailable customer), our partners will attempt re-delivery twice. Persistent failure may result in return-to-origin." },
      { h: "Damaged in Transit", p: "If your order arrives damaged, please record an unboxing video and contact us via WhatsApp within 48 hours of delivery for a free replacement." },
    ],
  },
  refund: {
    title: "Refund Policy",
    subtitle: "Our 30-Day Wellness Promise.",
    sections: [
{ 
  h: "7-Day Return Policy", p: "You may initiate a return request within 7 days of delivery. To be eligible, the product must be in its original, unopened, and unused packaging. Our team will verify the condition of the product upon request to determine eligibility for a return or replacement." },      { h: "Opened Products", p: "For opened bottles, we evaluate refunds on a case-by-case basis. Our intent is fairness — we have rarely refused a sincere request." },
      { h: "How to Initiate a Refund", p: `Email ${BRAND.email} or WhatsApp ${BRAND.phone} with your order number and reason. Our team will respond within 24 hours with next steps.` },
      { h: "Refund Timeline", p: "Once approved and the product is received back (if applicable), refunds are processed within 5–7 working days to your original payment method." },
      { h: "Non-Refundable", p: "Shipping fees and COD handling charges (if any) are non-refundable. Promotional gifts and bundle discount items cannot be partially refunded." },
      { h: "Exchanges", p: "Damaged or incorrect items will be exchanged free of charge within 7 days of delivery. Please contact us with an unboxing video for the fastest resolution." },
    ],
  },
};

export default function Policies() {
  const { kind } = useParams();
  const policy = POLICIES[kind];
  if (!policy) return <Navigate to="/" replace />;

  return (
    <div data-testid={`policy-${kind}`} className="bg-white min-h-screen">
      <section className="bg-cream relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-[var(--drj-gold-soft)] opacity-50 rounded-full blur-3xl"/>
        <div className="container-drj py-6 lg:py-10 relative">
          <div className="text-overline text-gold mb-3">Legal</div>
          <h1 className="font-serif text-5xl lg:text-6xl tracking-tight text-forest">{policy.title}</h1>
          <p className="text-[var(--drj-ink-muted)] mt-4 max-w-2xl font-light text-lg">{policy.subtitle}</p>
        </div>
      </section>

      <section className="container-drj py-16 lg:py-24 grid lg:grid-cols-12 gap-12">
        <aside className="lg:col-span-3">
          <div className="text-overline text-gold mb-3">All Policies</div>
          <ul className="space-y-3 text-sm">
            {Object.entries(POLICIES).map(([k, p]) => (
              <li key={k}>
                <Link to={`/policy/${k}`} className={k === kind ? "text-forest font-medium" : "text-[var(--drj-ink-muted)] hover:text-forest"} data-testid={`policy-link-${k}`}>
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <article className="lg:col-span-9 space-y-10">
          {policy.sections.map((s, i) => (
            <div key={i} className="border-l-2 border-gold pl-6">
              <h2 className="font-serif text-2xl lg:text-3xl text-forest">{s.h}</h2>
              <p className="text-[var(--drj-ink-muted)] mt-3 leading-relaxed font-light">{s.p}</p>
            </div>
          ))}
          <div className="pt-8 border-t border-[var(--drj-line)] text-xs text-[var(--drj-ink-muted)]">
            Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} · For questions: <a href={`mailto:${BRAND.email}`} className="text-forest underline">{BRAND.email}</a>
          </div>
        </article>
      </section>
    </div>
  );
}

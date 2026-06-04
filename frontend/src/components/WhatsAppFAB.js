import React from "react";
import { BRAND, whatsappLink } from "@/lib/brand";

export default function WhatsAppFAB() {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-30 h-14 w-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
      title={`Chat with ${BRAND.name}`}
      data-testid="whatsapp-fab"
      aria-label="WhatsApp"
    >
      <i className="fa-brands fa-whatsapp text-2xl"></i>
    </a>
  );
}

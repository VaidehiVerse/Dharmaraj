import React from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import { Toaster } from "@/components/ui/sonner";

export default function Layout() {
  return (
    <div className="min-h-screen bg-[var(--drj-bg)] text-[var(--drj-ink)]">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppFAB />
      <Toaster richColors position="top-center" />
      <ScrollRestoration />
    </div>
  );
}

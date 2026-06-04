import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X, Search, Phone } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { useCart } from "@/context/CartContext";
import { useI18n } from "@/context/I18nContext";
import LangSwitcher from "@/components/LangSwitcher";

export default function Header() {
  const { count, setDrawerOpen } = useCart();
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { to: "/", label: t.nav.home, key: "home" },
    { to: "/shop", label: t.nav.shop, key: "shop" },
    { to: "/product/1-vajra", label: t.nav.product, key: "vajra" },
    { to: "/about", label: t.nav.about, key: "about" },
    { to: "/blog", label: t.nav.blog, key: "blog" },
    { to: "/track", label: t.nav.track, key: "track" },
    { to: "/contact", label: t.nav.contact, key: "contact" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <>
      <div className="bg-forest text-white text-[11px] tracking-[0.18em] uppercase py-2 text-center font-sans" data-testid="announcement-bar">
        <span className="text-[var(--drj-gold-bright)]">{t.announce.shipping}</span>
        <span className="mx-3 opacity-40">•</span>
        <span className="opacity-90">{t.announce.cert}</span>
        <span className="mx-3 opacity-40 hidden sm:inline">•</span>
        <span className="opacity-90 hidden sm:inline">{t.announce.city}</span>
      </div>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-md shadow-[0_4px_24px_-12px_rgba(45,94,62,0.15)]" : "bg-white"
        } border-b border-[var(--drj-line)]`}
        data-testid="site-header"
      >
        <div className="container-drj flex items-center justify-between py-3">
          <Link to="/" className="flex items-center gap-3" data-testid="header-logo-link">
            <img src={BRAND.logo} alt="Dharmaraj Ayurveda" className="h-14 w-14 object-contain" />
            <div className="hidden sm:block leading-tight">
              <div className="font-serif text-xl text-forest tracking-wide">Dharmaraj</div>
              <div className="text-overline text-gold">Ayurveda · Rise & Grow</div>
            </div>
          </Link>
          <nav className="hidden lg:flex items-center gap-8" data-testid="primary-nav">
            {navItems.map((n) => (
              <NavLink
                key={n.key}
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) =>
                  `text-sm font-medium tracking-wide transition-colors ${isActive ? "text-forest" : "text-[var(--drj-ink-muted)] hover:text-gold"}`
                }
                data-testid={`nav-${n.key}`}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={`tel:${BRAND.phone}`}
              className="hidden md:inline-flex items-center gap-2 text-xs text-forest font-medium hover:text-gold transition"
              data-testid="header-phone"
            >
              <Phone size={14} /> {BRAND.phone}
            </a>
            <LangSwitcher />
            <Link to="/shop" className="hidden sm:flex h-9 w-9 items-center justify-center text-forest hover:text-gold transition" data-testid="search-shop-button">
              <Search size={18} />
            </Link>
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative h-9 w-9 flex items-center justify-center text-forest hover:text-gold transition"
              data-testid="open-cart-button"
              aria-label="Open cart"
            >
              <ShoppingBag size={20} />
              {count > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-[var(--drj-gold)] text-white text-[10px] h-4 min-w-4 px-1 flex items-center justify-center rounded-full font-semibold"
                  data-testid="cart-count-badge"
                >
                  {count}
                </span>
              )}
            </button>
            <button
              className="lg:hidden h-9 w-9 flex items-center justify-center text-forest"
              onClick={() => setMobileOpen((v) => !v)}
              data-testid="mobile-menu-toggle"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="lg:hidden border-t border-[var(--drj-line)] bg-white" data-testid="mobile-nav">
            <div className="container-drj py-4 flex flex-col gap-1">
              {navItems.map((n) => (
                <NavLink
                  key={n.key}
                  to={n.to}
                  end={n.to === "/"}
                  className={({ isActive }) =>
                    `py-3 border-b border-[var(--drj-line)] text-sm tracking-wide ${isActive ? "text-forest font-medium" : "text-[var(--drj-ink-muted)]"}`
                  }
                  data-testid={`mobile-nav-${n.key}`}
                >
                  {n.label}
                </NavLink>
              ))}
              <a
                href={`tel:${BRAND.phone}`}
                className="py-3 text-sm text-forest font-medium flex items-center gap-2"
                data-testid="mobile-phone-cta"
              >
                <Phone size={14} /> {BRAND.phone}
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

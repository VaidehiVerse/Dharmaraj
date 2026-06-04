import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { useCart } from "@/context/CartContext";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/product/1-vajra", label: "1 Vajra" },
  { to: "/about", label: "About" },
  { to: "/blog", label: "Journal" },
  { to: "/track", label: "Track Order" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const { count, setDrawerOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <div className="bg-obsidian text-[11px] tracking-[0.22em] uppercase py-2 text-center font-sans" data-testid="announcement-bar">
        <span className="text-gold">Free shipping over ₹999</span>
        <span className="mx-3 opacity-30">•</span>
        <span className="opacity-80">100% Botanical · FSSAI · GMP · ISO</span>
        <span className="mx-3 opacity-30 hidden sm:inline">•</span>
        <span className="opacity-80 hidden sm:inline">Crafted in Surat, Gujarat</span>
      </div>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-md border-b border-[var(--drj-line)]" : "bg-white border-b border-transparent"
        }`}
        data-testid="site-header"
      >
        <div className="container-drj flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-3" data-testid="header-logo-link">
            <img src={BRAND.logo} alt="Dharmaraj Ayurveda" className="h-14 w-14 object-contain" />
            <div className="hidden sm:block leading-tight">
              <div className="font-serif text-xl text-forest tracking-wide">Dharmaraj</div>
              <div className="text-overline text-gold">Ayurveda · Rise & Grow</div>
            </div>
          </Link>
          <nav className="hidden lg:flex items-center gap-9" data-testid="primary-nav">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) =>
                  `text-sm font-medium tracking-wide transition-colors ${
                    isActive ? "text-forest" : "text-[var(--drj-ink-muted)] hover:text-forest"
                  }`
                }
                data-testid={`nav-${n.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-4">
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
                  className="absolute -top-1 -right-1 bg-[var(--drj-gold)] text-[var(--drj-obsidian)] text-[10px] h-4 min-w-4 px-1 flex items-center justify-center rounded-full font-semibold"
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
                  key={n.to}
                  to={n.to}
                  end={n.to === "/"}
                  className={({ isActive }) =>
                    `py-3 border-b border-[var(--drj-line)] text-sm tracking-wide ${
                      isActive ? "text-forest font-medium" : "text-[var(--drj-ink-muted)]"
                    }`
                  }
                  data-testid={`mobile-nav-${n.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {n.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
}

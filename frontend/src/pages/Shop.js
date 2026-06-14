import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { apiClient } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { useI18n } from "@/context/I18nContext";
import { getCustomName } from "@/lib/productConfig"; // Import the name mapper

export default function Shop() {
  const { t } = useI18n();
  const FILTERS = [
    { id: "all", label: t.shop.filters.all },
    { id: "available", label: t.shop.filters.available },
    { id: "coming-soon", label: t.shop.filters.coming_soon },
  ];
  const SORTS = [
    { id: "featured", label: t.shop.sort.featured },
    { id: "price-asc", label: t.shop.sort.price_asc },
    { id: "price-desc", label: t.shop.sort.price_desc },
    { id: "name", label: t.shop.sort.name },
  ];

  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("featured");
  const [q, setQ] = useState("");

  useEffect(() => {
    apiClient.get("/products").then((r) => setItems(r.data));
  }, []);

  const filtered = useMemo(() => {
    let arr = [...items];
    if (filter === "available") arr = arr.filter((p) => !p.is_coming_soon);
    else if (filter === "coming-soon") arr = arr.filter((p) => p.is_coming_soon);
    if (q) {
      const s = q.toLowerCase();
      arr = arr.filter((p) =>
        p.name.toLowerCase().includes(s) ||
        p.tagline.toLowerCase().includes(s) ||
        (p.short_description || "").toLowerCase().includes(s)
      );
    }
    if (sort === "price-asc") arr.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") arr.sort((a, b) => b.price - a.price);
    if (sort === "name") arr.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "featured") arr.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    return arr;
  }, [items, filter, sort, q]);

  return (
    <div data-testid="shop-page" className="bg-white min-h-screen">
      
      {/* Sticky Filter Bar */}
      <section className="border-b border-[var(--drj-line)] bg-white sticky top-[73px] z-20">
        <div className="container-drj py-4 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2 border-b border-[var(--drj-line)] flex-1 max-w-sm">
            <Search size={16} className="text-[var(--drj-ink-muted)]" />
            <input
              placeholder={t.shop.search}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="input-luxe border-0 py-2 w-full text-sm"
              data-testid="shop-search-input"
            />
          </div>
          <div className="flex gap-2" data-testid="shop-filters">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 border transition ${
                  filter === f.id ? "bg-forest text-white border-forest" : "border-[var(--drj-line)] text-[var(--drj-ink-muted)] hover:border-forest hover:text-forest"
                }`}
                data-testid={`filter-${f.id}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product Grid - 3 items per row */}
      <section className="container-drj py-12">
        <div className="text-overline text-[var(--drj-ink-muted)] mb-8" data-testid="shop-count">
          {filtered.length} {t.shop.products}
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-20 font-light text-[var(--drj-ink-muted)]">{t.shop.no_results}</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="shop-grid">
            {filtered.map((p, i) => (
              <ProductCard 
                key={p.id} 
                product={{ ...p, name: getCustomName(p.name) }} 
                index={i}
              />
            ))}
          </div>
        )}
      </section>

      {/* Banner Section moved to bottom */}
      <section className="bg-cream text-forest py-16">
        <div className="container-drj relative">
          <div className="text-overline text-gold">{t.shop.eyebrow}</div>
          <h1 className="font-serif text-4xl mt-2 tracking-tight">{t.shop.title}</h1>
          <p className="text-[var(--drj-ink-muted)] mt-3 max-w-md font-light text-sm">{t.shop.desc}</p>
        </div>
      </section>
    </div>
  );
}
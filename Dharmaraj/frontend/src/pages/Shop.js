import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { apiClient } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { useI18n } from "@/context/I18nContext";

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
      {/* <section className="bg-cream text-forest relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[460px] h-[460px] bg-[var(--drj-gold-soft)] opacity-50 rounded-full blur-3xl" />
        <div className="container-drj py-20 lg:py-28 relative">
          <div className="text-overline text-gold">{t.shop.eyebrow}</div>
          <h1 className="font-serif text-5xl lg:text-7xl mt-3 tracking-tight">{t.shop.title}</h1>
          <p className="text-[var(--drj-ink-muted)] mt-4 max-w-xl font-light">{t.shop.desc}</p>
        </div>
      </section> */}

 <div className="container-drj py-2 lg:py-2 relative"></div>
      <section className="border-b border-[var(--drj-line)] bg-white sticky top-[73px] z-20">
        <div className="container-drj py-5 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2 border-b border-[var(--drj-line)] flex-1 max-w-md">
            <Search size={16} className="text-[var(--drj-ink-muted)]" />
            <input
              placeholder={t.shop.search}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="input-luxe border-0 py-3"
              data-testid="shop-search-input"
            />
          </div>
          <div className="flex gap-2" data-testid="shop-filters">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`text-xs uppercase tracking-[0.18em] px-4 py-2 border transition ${
                  filter === f.id ? "bg-forest text-white border-forest" : "border-[var(--drj-line)] text-[var(--drj-ink-muted)] hover:border-forest hover:text-forest"
                }`}
                data-testid={`filter-${f.id}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-transparent border border-[var(--drj-line)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-forest"
            data-testid="shop-sort"
          >
            {SORTS.map((s) => (<option key={s.id} value={s.id}>{s.label}</option>))}
          </select>
        </div>
      </section>

      <section className="container-drj py-12 lg:py-16">
        <div className="text-overline text-[var(--drj-ink-muted)] mb-6" data-testid="shop-count">{filtered.length} {t.shop.products}</div>
        {filtered.length === 0 ? (
          <div className="text-center py-20 font-light text-[var(--drj-ink-muted)]">{t.shop.no_results}</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8" data-testid="shop-grid">
            {filtered.map((p, i) => (<ProductCard key={p.id} product={p} index={i}/>))}
          </div>
        )}
      </section>
    </div>
  );
}

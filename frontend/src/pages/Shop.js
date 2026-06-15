import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { apiClient } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { useI18n } from "@/context/I18nContext";
import { getCustomName } from "@/lib/productConfig";

export default function Shop() {
  const { t } = useI18n();
  const FILTERS = [
    { id: "all", label: t.shop.filters.all },
    { id: "available", label: t.shop.filters.available },
    { id: "coming-soon", label: t.shop.filters.coming_soon },
  ];
  
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("featured");
  const [q, setQ] = useState("");

  useEffect(() => {
    apiClient.get("/products").then((r) => setItems(r.data));
  }, []);

  const filtered = useMemo(() => {
    let arr = items.map(p => {
      const mapped = getCustomName(p.name);
      // DEBUG: This will show in your browser console exactly what is happening
      console.log(`DEBUG: API Name: "${p.name}" -> Mapped to: "${mapped}"`);
      
      return {
        ...p,
        displayName: mapped
      };
    });

    if (filter === "available") arr = arr.filter((p) => !p.is_coming_soon);
    else if (filter === "coming-soon") arr = arr.filter((p) => p.is_coming_soon);

    if (q) {
      const s = q.toLowerCase();
      arr = arr.filter((p) =>
        p.displayName.toLowerCase().includes(s) ||
        p.tagline.toLowerCase().includes(s) ||
        (p.short_description || "").toLowerCase().includes(s)
      );
    }

    if (sort === "price-asc") arr.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") arr.sort((a, b) => b.price - a.price);
    if (sort === "name") arr.sort((a, b) => a.displayName.localeCompare(b.displayName));
    if (sort === "featured") arr.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    
    return arr;
  }, [items, filter, sort, q]);

  return (
    <div data-testid="shop-page" className="bg-white min-h-screen">
      {/* (Filter UI omitted for brevity) */}
      
      <section className="container-drj py-12">
        <div className="text-overline text-[var(--drj-ink-muted)] mb-8">
          {filtered.length} {t.shop.products}
        </div>
        
        {filtered.length === 0 ? (
          <div className="text-center py-20 font-light text-[var(--drj-ink-muted)]">{t.shop.no_results}</div>
        ) : (
          <div className="grid sm:grid-cols-4 lg:grid-cols-3 gap-5" data-testid="shop-grid">
            {filtered.map((p, i) => (
              <div key={p.id} className="h-full">
                <ProductCard 
                  product={{ ...p, name: p.displayName }} 
                  index={i}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
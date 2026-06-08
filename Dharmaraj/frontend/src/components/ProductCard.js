import React from "react";
import { Link } from "react-router-dom";
import { inr } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { Star } from "lucide-react";

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart();
  const comingSoon = product.is_coming_soon;
  return (
    <div
      className="group bg-white border border-[var(--drj-line)] product-hover flex flex-col"
      style={{ animationDelay: `${index * 80}ms` }}
      data-testid={`product-card-${product.slug}`}
    >
      <Link to={comingSoon ? "#" : `/product/${product.slug}`} className="relative block overflow-hidden bg-[var(--drj-bg)] aspect-[4/5]">
        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        {comingSoon && (
          <span className="absolute top-4 left-4 bg-obsidian text-gold px-3 py-1 text-[10px] tracking-[0.2em] uppercase">
            Coming Soon
          </span>
        )}
        {!comingSoon && product.is_featured && (
          <span className="absolute top-4 left-4 bg-[var(--drj-gold)] text-obsidian px-3 py-1 text-[10px] tracking-[0.2em] uppercase font-semibold">
            Flagship
          </span>
        )}
      </Link>
      <div className="p-6 flex-1 flex flex-col">
        <div className="text-overline text-gold mb-2">{product.tagline}</div>
        <h3 className="font-serif text-2xl text-forest leading-tight">{product.name}</h3>
        <p className="text-sm text-[var(--drj-ink-muted)] mt-2 line-clamp-2 flex-1">{product.short_description}</p>
        <div className="flex items-center gap-1 mt-3 text-xs">
          <Star size={12} className="fill-gold text-gold" />
          <span className="text-forest font-medium">{product.rating}</span>
          <span className="text-[var(--drj-ink-muted)]">({product.review_count} reviews)</span>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="font-serif text-2xl text-forest">{inr(product.price)}</span>
            {product.mrp > product.price && (
              <span className="ml-2 text-sm line-through text-[var(--drj-ink-muted)]">{inr(product.mrp)}</span>
            )}
          </div>
          {comingSoon ? (
            <button
              disabled
              className="text-xs tracking-[0.18em] uppercase text-[var(--drj-ink-muted)] cursor-not-allowed"
              data-testid={`notify-${product.slug}`}
            >
              Notify Me
            </button>
          ) : (
            <button
              onClick={() => addItem(product, 1)}
              className="text-xs tracking-[0.18em] uppercase text-forest hover:text-gold transition"
              data-testid={`add-${product.slug}`}
            >
              Add → Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

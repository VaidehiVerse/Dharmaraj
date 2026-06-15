import React from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { inr } from "@/lib/api";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart();
  const comingSoon = product.is_coming_soon;
  
  return (
    <div
      className="group bg-white border border-[var(--drj-line)] flex flex-col transition-all duration-500 hover:border-gold hover:shadow-xl"
      style={{ animationDelay: `${index * 80}ms` }}
      data-testid={`product-card-${product.slug}`}
    >
      <Link to={comingSoon ? "#" : `/product/${product.slug}`} className="relative block overflow-hidden bg-[var(--drj-bg)] aspect-[4/5]">
        <img 
          src={product.images[0]} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          loading="lazy" 
        />
        {comingSoon && (
          <span className="absolute top-4 left-4 bg-obsidian text-gold px-4 py-1.5 text-[11px] tracking-[0.2em] uppercase">
            Coming Soon
          </span>
        )}
        {!comingSoon && product.is_featured && (
          <span className="absolute top-4 left-4 bg-[var(--drj-gold)] text-obsidian px-4 py-1.5 text-[11px] tracking-[0.2em] uppercase font-semibold">
            Flagship
          </span>
        )}
      </Link>
      
      <div className="p-10 flex-1 flex flex-col">
        {/* Tagline from Database */}
        <div className="text-[11px] uppercase tracking-[0.2em] text-gold mb-3">
          {product.tagline}
        </div>
        
        {/* Name from Database */}
        <h3 className="font-serif text-3xl text-forest leading-tight mb-3">
          {product.name}
        </h3>
        
        {/* Description from Database */}
        <p className="text-base text-[var(--drj-ink-muted)] mt-2 line-clamp-3 flex-1 mb-6">
          {product.short_description}
        </p>
        
        <div className="flex items-center gap-1 mb-6 text-sm">
          <Star size={14} className="fill-gold text-gold" />
          <span className="text-forest font-medium">{product.rating}</span>
          <span className="text-[var(--drj-ink-muted)]">({product.review_count} reviews)</span>
        </div>
        
        <div className="flex items-end justify-between mt-auto border-t border-[var(--drj-line)] pt-6">
          <div>
            <span className="font-serif text-3xl text-forest">{inr(product.price)}</span>
            {product.mrp > product.price && (
              <span className="ml-3 text-base line-through text-[var(--drj-ink-muted)]">{inr(product.mrp)}</span>
            )}
          </div>
          {comingSoon ? (
            <button
              disabled
              className="text-sm tracking-[0.18em] uppercase text-[var(--drj-ink-muted)] cursor-not-allowed"
              data-testid={`notify-${product.slug}`}
            >
              Notify Me
            </button>
          ) : (
            <button
              onClick={() => addItem(product, 1)}
              className="text-sm tracking-[0.18em] uppercase text-forest hover:text-gold transition font-bold"
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
import React from "react";
import { Link } from "react-router-dom";
import { inr } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { Star } from "lucide-react";

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart();
  const comingSoon = product.is_coming_soon;
  const imagePath = `/images/ai-bottle-${(index % 5) + 1}.jpeg`;

  // Custom mapping for names
  // Ensure these keys match the exact names coming from your API
  const customNames = {
    "Original Name 1": "Vajra",
    "Original Name 2": "Tejas Elixir",
    "Original Name 3": "Prana Herbs",
    "Original Name 4": "Soma Oil",
    "Original Name 5": "Medha Ghrutam",
  };

  return (
    <div
      // w-80 or w-96 are standard Tailwind widths; w-92 is not standard
      className="group bg-white border border-[var(--drj-line)] product-hover flex flex-col w-80"
      style={{ animationDelay: `${index * 80}ms` }}
      data-testid={`product-card-${product.slug}`}
    >
      <Link to={comingSoon ? "#" : `/product/${product.slug}`} className="relative block overflow-hidden bg-[var(--drj-bg)]">
        {/* Changed h-64.1 to h-64, a standard Tailwind height class */}
        <img 
          src={imagePath} 
          alt={product.name} 
          className="w-full h-64 object-cover -mt-1" 
          loading="lazy" 
        />
        
        {comingSoon && (
          <span className="absolute top-4 left-4 bg-obsidian text-gold px-3 py-1 text-[10px] tracking-[0.2em] uppercase">
            Coming Soon
          </span>
        )}
      </Link>

      <div className="p-4 flex-1 flex flex-col">
        <div className="text-[10px] text-gold uppercase tracking-widest">{product.tagline}</div>
        
        {/* Using the customNames map */}
        <h3 className="font-serif text-xl text-forest mt-1 leading-tight">
          {customNames[product.name] || product.name}
        </h3>
        
        <p className="text-xs text-[var(--drj-ink-muted)] mt-1 line-clamp-1">
          {product.short_description}
        </p>

        <div className="flex items-end justify-between mt-4">
          <span className="font-serif text-lg text-forest">{inr(product.price)}</span>
          
          {comingSoon ? (
            <button disabled className="text-[10px] tracking-[0.18em] uppercase text-[var(--drj-ink-muted)] cursor-not-allowed">
              Notify Me
            </button>
          ) : (
            <button
              onClick={() => addItem(product, 1)}
              className="text-[10px] tracking-[0.18em] uppercase text-forest hover:text-gold transition"
            >
              Add → Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
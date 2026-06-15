import React from "react";
import { Link } from "react-router-dom";
import { inr } from "@/lib/api";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart();
  const comingSoon = product.is_coming_soon;
  
  // Logic to cycle through 6 images
  const imagePath = `/images/ai-bottle-${(index % 6) + 1}.jpeg`;

  return (
    <div
      className="group bg-white border border-[var(--drj-line)] product-hover flex flex-col w-80"
      style={{ animationDelay: `${index * 80}ms` }}
      data-testid={`product-card-${product.slug}`}
    >
      <Link 
        to={comingSoon ? "#" : `/product/${product.slug}`} 
        className="relative block overflow-hidden bg-[var(--drj-bg)] aspect-[4/5] flex items-center justify-center"
      >
        <img 
          src={imagePath} 
          alt={product.name} 
          className="max-h-[90%] w-auto object-contain p-4 transition-transform duration-700 group-hover:scale-105" 
          loading="lazy" 
        />
        
        {comingSoon && (
          <span 
            className="absolute top-4 left-4 text-white px-3 py-1 text-[10px] tracking-[0.2em] uppercase z-10"
            style={{ backgroundColor: '#D4AF37' }}
          >
            Coming Soon
          </span>
        )}
      </Link>

      <div className="p-4 flex-1 flex flex-col">
        <div className="text-[10px] text-gold uppercase tracking-widest">{product.tagline}</div>
        
        {/* Uses the product.name prop directly, which is already transformed in Shop.js */}
        <h3 className="font-serif text-xl text-forest mt-1 leading-tight">
          {product.name}
        </h3>
        
        <p className="text-xs text-[var(--drj-ink-muted)] mt-1 line-clamp-1">
          {product.short_description}
        </p>

        <div className="flex items-end justify-between mt-4">
          <span className="font-serif text-lg text-forest">{inr(product.price)}</span>
          
          {comingSoon ? (
            <button 
              disabled 
              className="text-[10px] tracking-[0.18em] uppercase text-[var(--drj-ink-muted)] cursor-not-allowed"
            >
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
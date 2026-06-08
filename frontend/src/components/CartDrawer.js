import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { inr } from "@/lib/api";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";

export default function CartDrawer() {
  const { items, drawerOpen, setDrawerOpen, updateQty, removeItem, subtotal } = useCart();
  const navigate = useNavigate();

  return (
    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 bg-white border-l border-[var(--drj-line)]"
        data-testid="cart-drawer"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-[var(--drj-line)]">
          <SheetTitle className="font-serif text-2xl text-forest">Your Ritual Cart</SheetTitle>
          <SheetDescription className="text-xs text-[var(--drj-ink-muted)]">
            {items.length === 0 ? "Empty for now" : `${items.length} item${items.length > 1 ? "s" : ""}`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 max-h-[55vh]">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl text-gold mb-4">☘</div>
              <h3 className="font-serif text-2xl text-forest mb-2">Your cart awaits</h3>
              <p className="text-sm text-[var(--drj-ink-muted)] mb-6">Begin with our flagship 1 Vajra.</p>
              <Link
                to="/product/1-vajra"
                onClick={() => setDrawerOpen(false)}
                className="btn-primary"
                data-testid="cart-empty-shop-button"
              >
                Discover 1 Vajra
              </Link>
            </div>
          ) : (
            items.map((it) => (
              <div key={it.product_id} className="flex gap-4" data-testid={`cart-item-${it.product_id}`}>
                <div className="w-20 h-24 bg-[var(--drj-bg)] flex items-center justify-center shrink-0 overflow-hidden">
                  {it.image && <img src={it.image} alt={it.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-lg text-forest leading-tight">{it.name}</div>
                  <div className="text-xs text-gold mt-1">{inr(it.price)} each</div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-[var(--drj-line)]">
                      <button
                        onClick={() => updateQty(it.product_id, it.quantity - 1)}
                        className="px-2 py-1 text-forest"
                        data-testid={`cart-decrease-${it.product_id}`}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 text-sm" data-testid={`cart-qty-${it.product_id}`}>
                        {it.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(it.product_id, it.quantity + 1)}
                        className="px-2 py-1 text-forest"
                        data-testid={`cart-increase-${it.product_id}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(it.product_id)}
                      className="text-[var(--drj-ink-muted)] hover:text-red-700 transition"
                      data-testid={`cart-remove-${it.product_id}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="font-medium text-forest">{inr(it.price * it.quantity)}</div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[var(--drj-line)] px-6 py-6 space-y-4 bg-[var(--drj-bg)]">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--drj-ink-muted)]">Subtotal</span>
              <span className="font-medium text-forest" data-testid="cart-subtotal">{inr(subtotal)}</span>
            </div>
            <p className="text-xs text-[var(--drj-ink-muted)]">Shipping, taxes & coupons calculated at checkout.</p>
            <button
              onClick={() => {
                setDrawerOpen(false);
                navigate("/cart");
              }}
              className="btn-outline w-full justify-center"
              data-testid="cart-view-button"
            >
              View Cart
            </button>
            <button
              onClick={() => {
                setDrawerOpen(false);
                navigate("/checkout");
              }}
              className="btn-primary w-full justify-center"
              data-testid="cart-checkout-button"
            >
              Checkout <ArrowRight size={16} />
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

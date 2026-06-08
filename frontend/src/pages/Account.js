import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { apiClient, inr } from "@/lib/api";
import { Package, Heart, User as UserIcon, LogOut, ArrowRight, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Account() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    apiClient.get("/me/orders").then((r) => setOrders(r.data)).catch(() => {});
    apiClient.get("/me/wishlist").then((r) => setWishlist(r.data)).catch(() => {});
  }, []);

  const removeWish = async (slug) => {
    try {
      await apiClient.delete(`/me/wishlist/${slug}`);
      setWishlist((w) => w.filter((p) => p.slug !== slug));
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Could not remove");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="bg-cream min-h-[calc(100vh-200px)]" data-testid="account-page">
      <section className="bg-white border-b border-[var(--drj-line)]">
        <div className="container-drj py-10 lg:py-14 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-overline text-gold mb-2">{t.auth.account}</div>
            <h1 className="font-serif text-4xl lg:text-5xl text-forest tracking-tight">Namaste, {user.name.split(" ")[0]} 🙏</h1>
            <p className="text-sm text-[var(--drj-ink-muted)] mt-1">{user.email} {user.mobile ? `· ${user.mobile}` : ""}</p>
          </div>
          <button onClick={handleLogout} className="btn-outline" data-testid="account-logout">
            <LogOut size={14}/> {t.auth.logout}
          </button>
        </div>
      </section>

      <div className="container-drj py-10 lg:py-16 grid lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="bg-white border border-[var(--drj-line)] p-2 flex lg:flex-col gap-1">
            <Tab id="orders" icon={Package} label={t.auth.orders} count={orders.length} tab={tab} setTab={setTab}/>
            <Tab id="wishlist" icon={Heart} label={t.auth.wishlist} count={wishlist.length} tab={tab} setTab={setTab}/>
            <Tab id="profile" icon={UserIcon} label={t.auth.profile} tab={tab} setTab={setTab}/>
            {user.role === "admin" && (
              <Link to="/admin" className="px-4 py-3 text-sm flex items-center gap-3 hover:bg-[var(--drj-gold-soft)] transition" data-testid="account-admin-link">
                <span className="w-2 h-2 bg-gold rounded-full"/> Admin Dashboard <ArrowRight size={12} className="ml-auto"/>
              </Link>
            )}
          </div>
        </aside>

        <main className="lg:col-span-3">
          {tab === "orders" && (
            <div className="space-y-4" data-testid="orders-list">
              {orders.length === 0 ? (
                <Empty icon={Package} title="No orders yet" desc="Your wellness rituals will appear here." cta="Browse Shop" to="/shop"/>
              ) : (
                orders.map((o) => (
                  <div key={o.order_id} className="bg-white border border-[var(--drj-line)] p-6" data-testid={`order-${o.order_id}`}>
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div>
                        <div className="text-overline text-gold">#{o.order_id}</div>
                        <div className="text-xs text-[var(--drj-ink-muted)] mt-1">{new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
                      </div>
                      <span className="text-overline px-3 py-1 bg-[var(--drj-gold-soft)] text-forest border border-[var(--drj-gold)] capitalize">{o.status?.replace(/_/g, " ")}</span>
                    </div>
                    <div className="mt-4 text-sm text-[var(--drj-ink)] space-y-1">
                      {o.items.map((it, i) => (<div key={i} className="font-light">{it.name} × {it.quantity}</div>))}
                    </div>
                    <div className="mt-5 pt-4 border-t border-[var(--drj-line)] flex items-center justify-between">
                      <span className="font-serif text-2xl text-forest">{inr(o.total)}</span>
                      <Link to={`/track?order_id=${o.order_id}&mobile=${o.address?.mobile || ""}`} className="text-overline text-gold hover:text-forest" data-testid={`order-track-${o.order_id}`}>Track →</Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "wishlist" && (
            <div data-testid="wishlist-list">
              {wishlist.length === 0 ? (
                <Empty icon={Heart} title="Your wishlist is quiet" desc="Save your favourites and revisit them anytime." cta="Discover Products" to="/shop"/>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {wishlist.map((p) => (
                    <div key={p.id} className="bg-white border border-[var(--drj-line)] p-5 flex gap-4">
                      <div className="w-24 h-28 bg-cream overflow-hidden flex-shrink-0">
                        {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover"/>}
                      </div>
                      <div className="flex-1">
                        <div className="font-serif text-lg text-forest">{p.name}</div>
                        <div className="text-overline text-gold mt-1">{inr(p.price)}</div>
                        <div className="mt-3 flex gap-3">
                          <Link to={`/product/${p.slug}`} className="text-overline text-forest hover:text-gold">View →</Link>
                          <button onClick={() => removeWish(p.slug)} className="text-[var(--drj-ink-muted)] hover:text-red-700" data-testid={`wishlist-remove-${p.slug}`}>
                            <Trash2 size={14}/>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "profile" && (
            <div className="bg-white border border-[var(--drj-line)] p-8" data-testid="profile-tab">
              <div className="text-overline text-gold mb-3">Profile</div>
              <h2 className="font-serif text-3xl text-forest">{user.name}</h2>
              <div className="mt-6 space-y-3 text-sm">
                <Row label="Email" value={user.email}/>
                <Row label="Mobile" value={user.mobile || "—"}/>
                <Row label="Role" value={<span className="capitalize">{user.role}</span>}/>
                <Row label="Member since" value={new Date(user.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}/>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const Tab = ({ id, icon: Icon, label, count, tab, setTab }) => (
  <button
    onClick={() => setTab(id)}
    className={`px-4 py-3 text-sm flex items-center gap-3 transition ${tab === id ? "bg-[var(--drj-gold-soft)] text-forest" : "text-[var(--drj-ink-muted)] hover:text-forest"}`}
    data-testid={`account-tab-${id}`}
  >
    <Icon size={16}/>
    <span className="flex-1 text-left">{label}</span>
    {count != null && <span className="text-xs text-gold">{count}</span>}
  </button>
);

const Empty = ({ icon: Icon, title, desc, cta, to }) => (
  <div className="bg-white border border-[var(--drj-line)] p-12 text-center">
    <Icon size={36} className="mx-auto text-gold mb-4"/>
    <h3 className="font-serif text-2xl text-forest">{title}</h3>
    <p className="text-sm text-[var(--drj-ink-muted)] mt-2 font-light">{desc}</p>
    <Link to={to} className="btn-outline mt-6 inline-flex"><ArrowRight size={14}/> {cta}</Link>
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between border-b border-[var(--drj-line)] pb-2">
    <span className="text-[var(--drj-ink-muted)]">{label}</span>
    <span className="text-forest font-medium">{value}</span>
  </div>
);

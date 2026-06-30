import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient, inr } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, ShoppingBag, Package, Tag, Users, Mail, LogOut, RefreshCw, Plus, Trash2, Edit, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { BRAND } from "@/lib/brand";

const STATUS_OPTIONS = ["confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"];

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("dashboard");

  const handleLogout = async () => { await logout(); navigate("/login"); };

  return (
    <div className="bg-[#f5f1e6] min-h-screen" data-testid="admin-page">
      <header className="bg-white border-b border-[var(--drj-line)] sticky top-0 z-30">
        <div className="container-drj py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={BRAND.logo} alt="Dharmaraj Ayurveda" className="h-10 w-10 object-contain"/>
            <div>
              <div className="font-serif text-lg text-forest leading-tight">Dharmaraj</div>
              <div className="text-overline text-gold">Admin Console</div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--drj-ink-muted)] hidden md:inline">{user?.email}</span>
            <Link to="/" className="text-overline text-forest hover:text-gold flex items-center gap-1.5"><ArrowUpRight size={14}/> Storefront</Link>
            <button onClick={handleLogout} className="btn-outline" data-testid="admin-logout"><LogOut size={14}/> Sign Out</button>
          </div>
        </div>
      </header>

      <div className="container-drj py-8 grid lg:grid-cols-5 gap-6">
        <aside className="lg:col-span-1">
          <nav className="bg-white border border-[var(--drj-line)] p-2 flex lg:flex-col gap-1 overflow-x-auto" data-testid="admin-sidebar">
            <NavTab id="dashboard" icon={LayoutDashboard} label="Dashboard" tab={tab} setTab={setTab}/>
            <NavTab id="orders" icon={ShoppingBag} label="Orders" tab={tab} setTab={setTab}/>
            <NavTab id="products" icon={Package} label="Products" tab={tab} setTab={setTab}/>
            <NavTab id="coupons" icon={Tag} label="Coupons" tab={tab} setTab={setTab}/>
            <NavTab id="customers" icon={Users} label="Customers" tab={tab} setTab={setTab}/>
            <NavTab id="inbox" icon={Mail} label="Inbox" tab={tab} setTab={setTab}/>
          </nav>
        </aside>

        <main className="lg:col-span-4 min-w-0">
          {tab === "dashboard" && <Dashboard/>}
          {tab === "orders" && <Orders/>}
          {tab === "products" && <Products/>}
          {tab === "coupons" && <Coupons/>}
          {tab === "customers" && <Customers/>}
          {tab === "inbox" && <Inbox/>}
        </main>
      </div>
    </div>
  );
}

const NavTab = ({ id, icon: Icon, label, tab, setTab }) => (
  <button
    onClick={() => setTab(id)}
    className={`px-4 py-3 text-sm flex items-center gap-3 transition whitespace-nowrap ${tab === id ? "bg-[var(--drj-gold-soft)] text-forest border-l-2 border-[var(--drj-gold)]" : "text-[var(--drj-ink-muted)] hover:text-forest"}`}
    data-testid={`admin-tab-${id}`}
  >
    <Icon size={16}/> {label}
  </button>
);

// ---------------- DASHBOARD ----------------
const Dashboard = () => {
  const [d, setD] = useState(null);
  useEffect(() => { apiClient.get("/admin/dashboard").then((r) => setD(r.data)); }, []);
  if (!d) return <Loading/>;
  const maxRev = Math.max(...d.daily_revenue.map(x => x.revenue), 1);
  return (
    <div className="space-y-6" data-testid="admin-dashboard">
      <h1 className="font-serif text-4xl text-forest tracking-tight">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total Orders" value={d.stats.total_orders} testId="stat-orders"/>
        <Stat label="Revenue" value={inr(d.stats.revenue)} testId="stat-revenue"/>
        <Stat label="Customers" value={d.stats.total_customers} testId="stat-customers"/>
        <Stat label="Products" value={d.stats.total_products} testId="stat-products"/>
      </div>

      <div className="bg-white border border-[var(--drj-line)] p-6" data-testid="daily-revenue-chart">
        <div className="text-overline text-gold mb-4">Daily Revenue · Last 14 days</div>
        <div className="flex items-end gap-2 h-40">
          {d.daily_revenue.map((day) => (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-1" title={`${day.day}: ${inr(day.revenue)} · ${day.orders} orders`}>
              <div className="w-full bg-[var(--drj-gold)] hover:bg-[var(--drj-forest)] transition" style={{ height: `${Math.max(4, (day.revenue / maxRev) * 100)}%` }}/>
              <div className="text-[9px] text-[var(--drj-ink-muted)]">{day.day.slice(8)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[var(--drj-line)] p-6">
          <div className="text-overline text-gold mb-4">Status Breakdown</div>
          <ul className="space-y-2 text-sm">
            {Object.entries(d.status_breakdown).map(([s, n]) => (
              <li key={s} className="flex justify-between border-b border-[var(--drj-line)] pb-2">
                <span className="capitalize">{s.replace(/_/g, " ")}</span>
                <span className="text-forest font-medium">{n}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white border border-[var(--drj-line)] p-6">
          <div className="text-overline text-gold mb-4">Recent Orders</div>
          <ul className="space-y-2 text-sm">
            {d.recent_orders.map((o) => (
              <li key={o.order_id} className="flex justify-between border-b border-[var(--drj-line)] pb-2">
                <span>{o.order_id} <span className="text-[var(--drj-ink-muted)] text-xs">· {o.address.full_name}</span></span>
                <span className="text-forest font-medium">{inr(o.total)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value, testId }) => (
  <div className="bg-white border border-[var(--drj-line)] p-5" data-testid={testId}>
    <div className="text-overline text-[var(--drj-ink-muted)]">{label}</div>
    <div className="font-serif text-3xl text-forest mt-2">{value}</div>
  </div>
);

const Loading = () => <div className="py-20 text-center text-[var(--drj-ink-muted)]">Loading...</div>;

// ---------------- ORDERS ----------------
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");
  const load = useCallback(
    () => apiClient.get("/admin/orders", { params: filter ? { status: filter } : {} }).then((r) => setOrders(r.data)),
    [filter],
  );
  useEffect(() => { load(); }, [load]);

  const updateStatus = async (orderId, status) => {
    try {
      await apiClient.patch(`/admin/orders/${orderId}`, { status });
      toast.success(`Updated to ${status}`);
      load();
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div className="space-y-4" data-testid="admin-orders">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-serif text-4xl text-forest tracking-tight">Orders</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-white border border-[var(--drj-line)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-forest" data-testid="admin-orders-filter">
          <option value="">All</option>
          {STATUS_OPTIONS.map((s) => (<option key={s} value={s}>{s.replace(/_/g, " ")}</option>))}
        </select>
      </div>
      <div className="bg-white border border-[var(--drj-line)] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--drj-gold-soft)] text-overline text-forest">
            <tr><th className="text-left p-3">Order</th><th className="text-left p-3">Customer</th><th className="text-left p-3">Items</th><th className="text-right p-3">Total</th><th className="text-left p-3">Status</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.order_id} className="border-t border-[var(--drj-line)]" data-testid={`admin-order-row-${o.order_id}`}>
                <td className="p-3 font-mono text-xs">{o.order_id}<div className="text-[10px] text-[var(--drj-ink-muted)]">{new Date(o.created_at).toLocaleDateString("en-IN")}</div></td>
                <td className="p-3"><div className="font-medium">{o.address.full_name}</div><div className="text-xs text-[var(--drj-ink-muted)]">{o.address.mobile}</div></td>
                <td className="p-3 text-xs">{o.items.map((it) => `${it.name} ×${it.quantity}`).join(", ")}</td>
                <td className="p-3 text-right font-serif text-lg text-forest">{inr(o.total)}</td>
                <td className="p-3">
                  <select value={o.status} onChange={(e) => updateStatus(o.order_id, e.target.value)} className="text-xs border border-[var(--drj-line)] px-2 py-1" data-testid={`order-status-${o.order_id}`}>
                    {STATUS_OPTIONS.map((s) => (<option key={s} value={s}>{s.replace(/_/g, " ")}</option>))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <div className="p-10 text-center text-[var(--drj-ink-muted)] font-light">No orders.</div>}
      </div>
    </div>
  );
};

// ---------------- PRODUCTS ----------------
const Products = () => {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const load = () => apiClient.get("/admin/products").then((r) => setProducts(r.data));
  useEffect(() => { load(); }, []);

  const blank = { slug: "", name: "", tagline: "", short_description: "", description: "", price: 0, mrp: 0, images: [], ingredients: [], benefits: [], dosage: "", storage: "", pack_size: "", is_available: true, is_featured: false, is_coming_soon: false, stock: 100 };

  const save = async (data) => {
    try {
      if (editing?.id) await apiClient.put(`/admin/products/${editing.id}`, data);
      else await apiClient.post("/admin/products", data);
      toast.success("Saved"); setEditing(null); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Save failed"); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await apiClient.delete(`/admin/products/${id}`); toast.success("Deleted"); load();
  };

  return (
    <div className="space-y-4" data-testid="admin-products">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl text-forest tracking-tight">Products</h1>
        <button onClick={() => setEditing(blank)} className="btn-primary" data-testid="admin-new-product"><Plus size={14}/> New Product</button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id} className="bg-white border border-[var(--drj-line)] p-4" data-testid={`admin-product-${p.slug}`}>
            <div className="aspect-square bg-[var(--drj-gold-soft)] overflow-hidden mb-3 flex items-center justify-center">
              {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="max-h-[80%] object-contain"/>}
            </div>
            <div className="font-serif text-xl text-forest">{p.name}</div>
            <div className="text-overline text-gold mt-1">{p.slug}</div>
            <div className="mt-2 text-sm">{inr(p.price)} <span className="text-[var(--drj-ink-muted)] text-xs line-through ml-1">{inr(p.mrp)}</span></div>
            <div className="flex gap-2 text-xs mt-3 flex-wrap">
              {p.is_featured && <span className="px-2 py-0.5 bg-[var(--drj-gold)] text-white">Flagship</span>}
              {p.is_coming_soon && <span className="px-2 py-0.5 bg-forest text-white">Soon</span>}
              <span className="px-2 py-0.5 border border-[var(--drj-line)]">{p.stock} in stock</span>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setEditing(p)} className="text-overline text-forest hover:text-gold" data-testid={`product-edit-${p.slug}`}><Edit size={12} className="inline"/> Edit</button>
              <button onClick={() => del(p.id)} className="text-overline text-red-700 hover:text-red-900 ml-auto" data-testid={`product-delete-${p.slug}`}><Trash2 size={12} className="inline"/> Delete</button>
            </div>
          </div>
        ))}
      </div>
      {editing && <ProductForm initial={editing} onSave={save} onClose={() => setEditing(null)}/>}
    </div>
  );
};

const ProductForm = ({ initial, onSave, onClose }) => {
  const [form, setForm] = useState({
    ...initial,
    images_text: (initial.images || []).join("\n"),
    benefits_text: (initial.benefits || []).join("\n"),
    ingredients_text: JSON.stringify(initial.ingredients || [], null, 2),
  });
  const setF = (k, v) => setForm({ ...form, [k]: v });
  const submit = (e) => {
    e.preventDefault();
    let ingredients = [];
    try { ingredients = JSON.parse(form.ingredients_text || "[]"); } catch { toast.error("Ingredients JSON is invalid"); return; }
    const data = {
      slug: form.slug, name: form.name, tagline: form.tagline, short_description: form.short_description, description: form.description,
      price: Number(form.price), mrp: Number(form.mrp),
      images: form.images_text.split("\n").map(s => s.trim()).filter(Boolean),
      ingredients, benefits: form.benefits_text.split("\n").map(s => s.trim()).filter(Boolean),
      dosage: form.dosage, storage: form.storage, pack_size: form.pack_size,
      is_available: !!form.is_available, is_featured: !!form.is_featured, is_coming_soon: !!form.is_coming_soon,
      stock: Number(form.stock),
    };
    onSave(data);
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="bg-white max-w-2xl w-full p-6 mt-12" data-testid="admin-product-form">
        <h2 className="font-serif text-2xl text-forest mb-6">{initial.id ? "Edit Product" : "New Product"}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <In label="Slug" v={form.slug} on={(v) => setF("slug", v)} testId="pf-slug"/>
          <In label="Name" v={form.name} on={(v) => setF("name", v)} testId="pf-name"/>
          <In label="Tagline" v={form.tagline} on={(v) => setF("tagline", v)} wide testId="pf-tagline"/>
          <In label="Short Description" v={form.short_description} on={(v) => setF("short_description", v)} wide testId="pf-short"/>
          <In label="Price (₹)" type="number" v={form.price} on={(v) => setF("price", v)} testId="pf-price"/>
          <In label="MRP (₹)" type="number" v={form.mrp} on={(v) => setF("mrp", v)} testId="pf-mrp"/>
          <In label="Stock" type="number" v={form.stock} on={(v) => setF("stock", v)} testId="pf-stock"/>
          <In label="Pack Size" v={form.pack_size} on={(v) => setF("pack_size", v)} testId="pf-pack"/>
          <Ta label="Description" v={form.description} on={(v) => setF("description", v)} testId="pf-desc"/>
          <Ta label="Image URLs (one per line)" v={form.images_text} on={(v) => setF("images_text", v)} testId="pf-images"/>
          <Ta label="Benefits (one per line)" v={form.benefits_text} on={(v) => setF("benefits_text", v)} testId="pf-benefits"/>
          <Ta label="Ingredients (JSON array)" v={form.ingredients_text} on={(v) => setF("ingredients_text", v)} testId="pf-ingredients"/>
          <In label="Dosage" v={form.dosage} on={(v) => setF("dosage", v)} wide testId="pf-dosage"/>
          <In label="Storage" v={form.storage} on={(v) => setF("storage", v)} wide testId="pf-storage"/>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_available} onChange={(e) => setF("is_available", e.target.checked)}/> Available</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_featured} onChange={(e) => setF("is_featured", e.target.checked)}/> Featured</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_coming_soon} onChange={(e) => setF("is_coming_soon", e.target.checked)}/> Coming Soon</label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-outline" data-testid="pf-cancel">Cancel</button>
          <button className="btn-primary" data-testid="pf-save">Save</button>
        </div>
      </form>
    </div>
  );
};

const In = ({ label, v, on, type = "text", wide, testId }) => (
  <div className={wide ? "sm:col-span-2" : ""}>
    <div className="text-overline text-[var(--drj-ink-muted)] mb-1">{label}</div>
    <input type={type} value={v} onChange={(e) => on(e.target.value)} className="input-luxe" data-testid={testId} required={["slug","name","tagline","short_description"].includes(label.toLowerCase().split(" ")[0])}/>
  </div>
);
const Ta = ({ label, v, on, testId }) => (
  <div className="sm:col-span-2">
    <div className="text-overline text-[var(--drj-ink-muted)] mb-1">{label}</div>
    <textarea value={v} onChange={(e) => on(e.target.value)} className="input-luxe min-h-[80px]" rows={3} data-testid={testId}/>
  </div>
);

// ---------------- COUPONS ----------------
const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({ code: "", type: "percent", value: 10, min_subtotal: 0, description: "", active: true });
  const load = () => apiClient.get("/admin/coupons").then((r) => setCoupons(r.data));
  useEffect(() => { load(); }, []);
  const save = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post("/admin/coupons", { ...form, value: Number(form.value), min_subtotal: Number(form.min_subtotal) });
      toast.success("Coupon created");
      setForm({ code: "", type: "percent", value: 10, min_subtotal: 0, description: "", active: true });
      load();
    } catch (e2) { toast.error(e2.response?.data?.detail || "Failed"); }
  };
  const del = async (code) => { await apiClient.delete(`/admin/coupons/${code}`); toast.success("Deleted"); load(); };
  return (
    <div className="space-y-6" data-testid="admin-coupons">
      <h1 className="font-serif text-4xl text-forest tracking-tight">Coupons</h1>
      <form onSubmit={save} className="bg-white border border-[var(--drj-line)] p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="coupon-form">
        <In label="Code" v={form.code} on={(v) => setForm({...form, code: v.toUpperCase()})} testId="cp-code"/>
        <div>
          <div className="text-overline text-[var(--drj-ink-muted)] mb-1">Type</div>
          <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="input-luxe" data-testid="cp-type">
            <option value="percent">Percent</option><option value="flat">Flat ₹</option>
          </select>
        </div>
        <In label="Value" type="number" v={form.value} on={(v) => setForm({...form, value: v})} testId="cp-value"/>
        <In label="Min Subtotal" type="number" v={form.min_subtotal} on={(v) => setForm({...form, min_subtotal: v})} testId="cp-min"/>
        <In label="Description" v={form.description} on={(v) => setForm({...form, description: v})} wide testId="cp-desc"/>
        <div className="lg:col-span-3 flex justify-end"><button className="btn-primary" data-testid="cp-save"><Plus size={14}/> Create Coupon</button></div>
      </form>
      <div className="bg-white border border-[var(--drj-line)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--drj-gold-soft)] text-overline text-forest"><tr><th className="text-left p-3">Code</th><th className="text-left p-3">Type</th><th className="text-right p-3">Value</th><th className="text-right p-3">Min Order</th><th></th></tr></thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.code} className="border-t border-[var(--drj-line)]" data-testid={`coupon-row-${c.code}`}>
                <td className="p-3 font-mono">{c.code}</td>
                <td className="p-3 capitalize">{c.type}</td>
                <td className="p-3 text-right">{c.type === "percent" ? `${c.value}%` : inr(c.value)}</td>
                <td className="p-3 text-right">{inr(c.min_subtotal)}</td>
                <td className="p-3 text-right"><button onClick={() => del(c.code)} className="text-red-700" data-testid={`coupon-delete-${c.code}`}><Trash2 size={14}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && <div className="p-8 text-center text-[var(--drj-ink-muted)]">No coupons yet.</div>}
      </div>
    </div>
  );
};

// ---------------- CUSTOMERS ----------------
const Customers = () => {
  const [list, setList] = useState([]);
  useEffect(() => { apiClient.get("/admin/customers").then((r) => setList(r.data)); }, []);
  return (
    <div className="space-y-4" data-testid="admin-customers">
      <h1 className="font-serif text-4xl text-forest tracking-tight">Customers</h1>
      <div className="bg-white border border-[var(--drj-line)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--drj-gold-soft)] text-overline text-forest"><tr><th className="text-left p-3">Name</th><th className="text-left p-3">Email</th><th className="text-left p-3">Mobile</th><th className="text-left p-3">Joined</th></tr></thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-t border-[var(--drj-line)]" data-testid={`customer-row-${c.id}`}>
                <td className="p-3">{c.name}</td>
                <td className="p-3">{c.email}</td>
                <td className="p-3">{c.mobile || "—"}</td>
                <td className="p-3 text-xs">{new Date(c.created_at).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <div className="p-8 text-center text-[var(--drj-ink-muted)]">No customers yet.</div>}
      </div>
    </div>
  );
};

// ---------------- INBOX ----------------
const Inbox = () => {
  const [tab, setTab] = useState("contacts");
  const [contacts, setContacts] = useState([]);
  const [newsletter, setNewsletter] = useState([]);
  useEffect(() => {
    apiClient.get("/admin/contacts").then((r) => setContacts(r.data));
    apiClient.get("/admin/newsletter").then((r) => setNewsletter(r.data));
  }, []);
  return (
    <div className="space-y-4" data-testid="admin-inbox">
      <h1 className="font-serif text-4xl text-forest tracking-tight">Inbox</h1>
      <div className="flex gap-2">
        <button onClick={() => setTab("contacts")} className={`text-overline px-4 py-2 border ${tab === "contacts" ? "bg-forest text-white border-forest" : "border-[var(--drj-line)] text-[var(--drj-ink-muted)]"}`} data-testid="inbox-tab-contacts">Contacts ({contacts.length})</button>
        <button onClick={() => setTab("newsletter")} className={`text-overline px-4 py-2 border ${tab === "newsletter" ? "bg-forest text-white border-forest" : "border-[var(--drj-line)] text-[var(--drj-ink-muted)]"}`} data-testid="inbox-tab-newsletter">Newsletter ({newsletter.length})</button>
      </div>
      {tab === "contacts" && (
        <div className="space-y-3">
          {contacts.map((c) => (
            <div key={c.id} className="bg-white border border-[var(--drj-line)] p-5" data-testid={`contact-${c.id}`}>
              <div className="flex justify-between flex-wrap gap-2">
                <div className="font-medium text-forest">{c.name} <span className="text-[var(--drj-ink-muted)] text-xs">· {c.email}{c.mobile ? ` · ${c.mobile}` : ""}</span></div>
                <div className="text-xs text-[var(--drj-ink-muted)]">{new Date(c.created_at).toLocaleString("en-IN")}</div>
              </div>
              <div className="text-overline text-gold mt-2">{c.subject}</div>
              <p className="text-sm font-light mt-1 leading-relaxed">{c.message}</p>
            </div>
          ))}
          {contacts.length === 0 && <div className="bg-white border border-[var(--drj-line)] p-8 text-center text-[var(--drj-ink-muted)]">No contact submissions.</div>}
        </div>
      )}
      {tab === "newsletter" && (
        <div className="bg-white border border-[var(--drj-line)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--drj-gold-soft)] text-overline text-forest"><tr><th className="text-left p-3">Email</th><th className="text-left p-3">Subscribed</th></tr></thead>
            <tbody>
              {newsletter.map((n, i) => (<tr key={i} className="border-t border-[var(--drj-line)]"><td className="p-3">{n.email}</td><td className="p-3 text-xs">{new Date(n.subscribed_at).toLocaleString("en-IN")}</td></tr>))}
            </tbody>
          </table>
          {newsletter.length === 0 && <div className="p-8 text-center text-[var(--drj-ink-muted)]">No subscribers yet.</div>}
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@/lib/api";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/context/I18nContext";

const CATEGORIES = ["All", "Ayurveda", "Immunity", "Digestion", "Fitness", "Herbal Supplements", "Lifestyle"];

export default function Blog() {
  const { t } = useI18n();
  const [posts, setPosts] = useState([]);
  const [cat, setCat] = useState("All");

  useEffect(() => {
    apiClient.get("/blogs", { params: cat !== "All" ? { category: cat } : {} }).then((r) => setPosts(r.data));
  }, [cat]);

  return (
    <div data-testid="blog-page" className="bg-white min-h-screen">
      <section className="bg-cream relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[var(--drj-gold-soft)] opacity-50 rounded-full blur-3xl"/>
        <div className="container-drj py-24 lg:py-32 relative">
          <div className="text-overline text-gold mb-3">{t.blog.eyebrow}</div>
          <h1 className="font-serif text-5xl lg:text-7xl tracking-tight text-forest">{t.blog.title}</h1>
          <p className="text-[var(--drj-ink-muted)] mt-5 max-w-xl font-light text-lg">{t.blog.desc}</p>
        </div>
      </section>

      <section className="border-b border-[var(--drj-line)] bg-white sticky top-[73px] z-20">
        <div className="container-drj py-5 flex flex-wrap gap-2" data-testid="blog-categories">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`text-xs uppercase tracking-[0.18em] px-4 py-2 border transition ${
                cat === c ? "bg-forest text-white border-forest" : "border-[var(--drj-line)] text-[var(--drj-ink-muted)] hover:border-forest hover:text-forest"
              }`}
              data-testid={`blog-cat-${c.toLowerCase().replace(/\s/g, "-")}`}
            >
              {t.blog.categories[c] || c}
            </button>
          ))}
        </div>
      </section>

      <section className="container-drj py-12 lg:py-20">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-[var(--drj-ink-muted)] font-light">{t.blog.no_articles}</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="blog-grid">
            {posts.map((p) => (
              <Link to={`/blog/${p.slug}`} key={p.id} className="group block bg-white border border-[var(--drj-line)] product-hover" data-testid={`blog-card-${p.slug}`}>
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover"/>
                </div>
                <div className="p-7">
                  <div className="text-overline text-gold">{p.category} · {p.read_minutes} min read</div>
                  <h2 className="font-serif text-2xl text-forest mt-3 leading-tight group-hover:text-gold transition-colors">{p.title}</h2>
                  <p className="text-sm text-[var(--drj-ink-muted)] mt-3 font-light line-clamp-3">{p.excerpt}</p>
                  <div className="mt-5 text-overline text-forest flex items-center gap-2">{t.blog.read_article} <ArrowRight size={14}/></div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

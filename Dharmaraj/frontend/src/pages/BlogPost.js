import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { apiClient } from "@/lib/api";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    apiClient.get(`/blogs/${slug}`).then((r) => setPost(r.data));
  }, [slug]);

  if (!post) return <div className="container-drj section text-center text-[var(--drj-ink-muted)]">Loading...</div>;

  return (
    <div data-testid="blog-post-page" className="bg-[var(--drj-bg)]">
      <section className="bg-obsidian text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url('${post.cover_image}')`, backgroundSize: "cover", backgroundPosition: "center" }}/>
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/60 via-obsidian/80 to-obsidian"/>
        <div className="container-drj relative py-24 lg:py-32 max-w-3xl">
          <Link to="/blog" className="text-overline text-gold mb-6 inline-flex items-center gap-2"><ArrowLeft size={14}/> Back to Journal</Link>
          <div className="text-overline text-gold mt-6">{post.category} · {post.read_minutes} min read</div>
          <h1 className="font-serif text-4xl lg:text-6xl mt-3 tracking-tight leading-tight">{post.title}</h1>
          <div className="text-white/60 mt-5 font-light">By {post.author} · {new Date(post.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
        </div>
      </section>

      <section className="section">
        <article className="container-drj max-w-3xl prose-luxe">
          <p className="text-xl text-forest font-serif italic leading-relaxed">{post.excerpt}</p>
          <div className="h-px bg-gold w-16 my-8"></div>
          <div className="text-[var(--drj-ink)] leading-loose font-light text-lg whitespace-pre-line">{post.content}</div>

          <div className="mt-16 border-t border-[var(--drj-line)] pt-10 flex items-center justify-between flex-wrap gap-4">
            <Link to="/blog" className="btn-outline" data-testid="blog-back-link"><ArrowLeft size={16}/> All Articles</Link>
            <Link to="/product/1-vajra" className="btn-primary" data-testid="blog-product-cta">Shop 1 Vajra <ArrowRight size={16}/></Link>
          </div>
        </article>
      </section>
    </div>
  );
}

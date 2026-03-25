import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import Button from "../components/Button";
import {
  ChevronRight, ChevronLeft, Shield, Truck, Award, Star,
  Leaf, Heart, Sparkles, ArrowRight, Droplets, Flower2, Sprout, Activity
} from "lucide-react";

/* ── Hero slides ─────────────────────────────────────────── */
const SLIDES = [
  {
    id: 1,
    badge: "🌿 100% Natural",
    title: "Nature's Healing Power",
    titleAccent: "at Your Doorstep",
    sub: "Discover the healing power of authentic Ayurvedic herbs, crafted for today's lifestyle.",
    cta: "Shop Now",
    ctaLink: "/products",
    bg: "from-[#0a2e1a] via-[#0d3b22] to-[#0a2e1a]",
    accentColor: "hsl(var(--secondary))",
    image: "/images/hero-bg.png",
  },
  {
    id: 2,
    badge: "⭐ Best Sellers",
    title: "Nature's Finest",
    titleAccent: "Herbal Remedies",
    sub: "Thousands of happy customers trust Divyaveda for their daily wellness routine.",
    cta: "Explore Products",
    ctaLink: "/products",
    bg: "from-[#1a1a2e] via-[#16213e] to-[#0f3460]",
    accentColor: "#818cf8",
    image: "https://images.unsplash.com/photo-1609358905581-e5381612486e?w=800&q=80",
  },
  {
    id: 3,
    badge: "🎉 New Launches",
    title: "Fresh Arrivals",
    titleAccent: "Hand-Curated",
    sub: "Explore our latest collection of premium Ayurvedic products, freshly sourced and certified.",
    cta: "View New Arrivals",
    ctaLink: "/products",
    bg: "from-[#2d1b00] via-[#3d2600] to-[#4a2f00]",
    accentColor: "#fbbf24",
    image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80",
  },
];

/* ── Trust badges ─────────────────────────────────────────── */
const TRUST = [
  { icon: Shield,   text: "100% Authentic" },
  { icon: Truck,    text: "Free Shipping ₹500+" },
  { icon: Award,    text: "Certified Quality" },
  { icon: Star,     text: "10,000+ Customers" },
  { icon: Leaf,     text: "Natural Ingredients" },
  { icon: Heart,    text: "Made with Love" },
  { icon: Sparkles, text: "Premium Grade" },
  { icon: Shield,   text: "100% Authentic" },
  { icon: Truck,    text: "Free Shipping ₹500+" },
  { icon: Award,    text: "Certified Quality" },
  { icon: Star,     text: "10,000+ Customers" },
  { icon: Leaf,     text: "Natural Ingredients" },
  { icon: Heart,    text: "Made with Love" },
  { icon: Sparkles, text: "Premium Grade" },
];

/* ── Category Styles ─────────────────────────────────── */
const CAT_STYLES = [
  { bg: "bg-emerald-50", icon: Leaf, color: "text-emerald-600", border: "border-emerald-100", glow: "from-emerald-400/20" },
  { bg: "bg-amber-50", icon: Sparkles, color: "text-amber-600", border: "border-amber-100", glow: "from-amber-400/20" },
  { bg: "bg-rose-50", icon: Flower2, color: "text-rose-600", border: "border-rose-100", glow: "from-rose-400/20" },
  { bg: "bg-blue-50", icon: Droplets, color: "text-blue-600", border: "border-blue-100", glow: "from-blue-400/20" },
  { bg: "bg-purple-50", icon: Activity, color: "text-purple-600", border: "border-purple-100", glow: "from-purple-400/20" },
  { bg: "bg-teal-50", icon: Sprout, color: "text-teal-600", border: "border-teal-100", glow: "from-teal-400/20" },
];

/* ════════════════════════════════════════════════════════════ */

export default function Home() {
  const [categories, setCategories]       = useState([]);
  const [featuredProducts, setFeatured]   = useState([]);
  const [bestSellers, setBestSellers]     = useState([]);
  const [loading, setLoading]             = useState(true);
  const [slide, setSlide]                 = useState(0);
  const [sliding, setSliding]             = useState(false);
  const navigate = useNavigate();

  /* ── data ───────────────────────────────────────────────── */
  useEffect(() => {
    const base = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/api$/, "");
    const load = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch(`${base}/api/categories`),
          fetch(`${base}/api/products?limit=12`),
        ]);
        const catData  = await catRes.json();
        const prodData = await prodRes.json();
        setCategories((catData.categories || catData || []).slice(0, 6));
        const all = prodData.products || prodData || [];
        setFeatured(all.filter(p => p.is_new_launch).slice(0, 8));
        setBestSellers(all.slice(0, 8));
      } catch (e) {
        console.error("Home data error:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ── carousel auto-advance ──────────────────────────────── */
  const goToSlide = useCallback((next) => {
    if (sliding) return;
    setSliding(true);
    setSlide(next);
    setTimeout(() => setSliding(false), 600);
  }, [sliding]);

  useEffect(() => {
    const t = setInterval(() => goToSlide((slide + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, [slide, goToSlide]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a2e1a]">
      <div className="text-center space-y-4">
        <div className="h-14 w-14 mx-auto animate-spin rounded-full border-4 border-green-400 border-t-transparent" />
        <p className="text-green-300 text-sm font-medium tracking-widest uppercase">Loading...</p>
      </div>
    </div>
  );

  const cur = SLIDES[slide];

  return (
    <div className="bg-white overflow-x-hidden">

      {/* ══════════════ HERO CAROUSEL ══════════════ */}
      <section className="relative h-[88vh] min-h-[580px] overflow-hidden">
        {SLIDES.map((s, i) => (
          <div
            key={s.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === slide ? 1 : 0, zIndex: i === slide ? 1 : 0 }}
          >
            {/* BG image */}
            <div
              className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-[8000ms]"
              style={{ backgroundImage: `url('${s.image}')`, transform: i === slide ? "scale(1.05)" : "scale(1)" }}
            />
            {/* gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${s.bg} opacity-90`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        ))}

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">
            <div className="max-w-2xl">
              {/* Badge */}
              <div
                key={`badge-${slide}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6 backdrop-blur-sm
                           animate-[fadeInUp_0.5s_ease_forwards]"
                style={{ background: `${cur.accentColor}22`, border: `1px solid ${cur.accentColor}66`, color: cur.accentColor }}
              >
                {cur.badge}
              </div>

              {/* Title */}
              <h1
                key={`h1-${slide}`}
                className="text-4xl sm:text-5xl md:text-7xl font-serif font-black text-white mb-3 leading-[1.1]
                           animate-[fadeInUp_0.6s_0.1s_ease_forwards] opacity-0"
                style={{ animationFillMode: "forwards" }}
              >
                {cur.title}
                <br />
                <span style={{ color: cur.accentColor }}>{cur.titleAccent}</span>
              </h1>

              {/* Subtitle */}
              <p
                key={`sub-${slide}`}
                className="text-base sm:text-lg md:text-xl text-white/75 mb-8 sm:mb-10 max-w-lg leading-relaxed
                           animate-[fadeInUp_0.6s_0.2s_ease_forwards] opacity-0"
                style={{ animationFillMode: "forwards" }}
              >
                {cur.sub}
              </p>

              {/* CTAs */}
              <div
                key={`cta-${slide}`}
                className="flex flex-wrap gap-4 animate-[fadeInUp_0.6s_0.3s_ease_forwards] opacity-0"
                style={{ animationFillMode: "forwards" }}
              >
                <Link to={cur.ctaLink}>
                  <button
                    className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                    style={{ background: cur.accentColor, color: "#0a1a0a" }}
                  >
                    {cur.cta} <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link to="/products">
                  <button className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base text-white border-2 border-white/30 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                    Browse All
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Arrows */}
        <button
          onClick={() => goToSlide((slide - 1 + SLIDES.length) % SLIDES.length)}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all hover:scale-110"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => goToSlide((slide + 1) % SLIDES.length)}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all hover:scale-110"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === slide ? "2rem" : "0.5rem",
                background: i === slide ? cur.accentColor : "rgba(255,255,255,0.35)",
              }}
            />
          ))}
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 right-8 z-20 flex flex-col items-center gap-1 opacity-50">
          <div className="h-8 w-[1px] bg-white/50 animate-pulse" />
          <span className="text-white/60 text-[10px] tracking-widest uppercase rotate-90 origin-center mt-4">Scroll</span>
        </div>
      </section>

      {/* ══════════════ TRUST BADGE MARQUEE ══════════════ */}
      <div className="bg-gradient-to-r from-green-900 to-emerald-800 py-4 overflow-hidden">
        <div
          className="flex gap-12 whitespace-nowrap"
          style={{ animation: "marquee 28s linear infinite" }}
        >
          {TRUST.map((t, i) => (
            <div key={i} className="flex items-center gap-2 text-white/90 shrink-0">
              <t.icon className="h-4 w-4 text-green-300" />
              <span className="text-sm font-semibold tracking-wide">{t.text}</span>
              <span className="ml-6 text-green-600">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════ CATEGORIES ══════════════ */}
      {categories.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-2">Collections</p>
                <h2 className="text-4xl md:text-5xl font-serif font-black text-slate-900 leading-tight">
                  Shop by<br /><span className="text-primary">Category</span>
                </h2>
              </div>
              <Link to="/products" className="hidden md:flex items-center gap-1 text-primary font-semibold hover:gap-3 transition-all">
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
              {categories.map((cat, i) => {
                const style = CAT_STYLES[i % CAT_STYLES.length];
                const Icon = style.icon;
                return (
                  <Link
                    key={cat._id}
                    to={`/products?category=${cat._id}`}
                    className="group relative block w-full outline-none"
                  >
                    <div className={`relative aspect-[4/5] rounded-3xl bg-white border ${style.border} overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-transparent flex flex-col items-center justify-center p-6 text-center z-10`}>
                      
                      {/* Soft background glow on hover */}
                      <div className={`absolute -inset-px opacity-0 group-hover:opacity-100 bg-gradient-to-b ${style.glow} to-transparent transition-opacity duration-500 -z-10`} />
                      
                      {/* Icon container */}
                      <div className={`relative h-20 w-20 rounded-full ${style.bg} flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 shadow-sm border ${style.border}`}>
                         <Icon className={`h-8 w-8 ${style.color} transition-transform duration-500 group-hover:rotate-12`} strokeWidth={1.5} />
                      </div>
                      
                      {/* Name */}
                      <h3 className="font-serif font-black text-slate-900 text-[15px] sm:text-base leading-snug group-hover:text-primary transition-colors">
                        {cat.name}
                      </h3>
                      
                      {/* Floating arrow */}
                      <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500 text-slate-400 group-hover:text-primary">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════ NEW LAUNCHES — AUTO SCROLL CAROUSEL ══════════════ */}
      {featuredProducts.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-10">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-2">Just Arrived</p>
                <h2 className="text-4xl md:text-5xl font-serif font-black text-slate-900">
                  New <span className="text-primary">Launches</span>
                </h2>
              </div>
              <Link to="/products" className="hidden md:flex items-center gap-1 text-primary font-semibold hover:gap-3 transition-all">
                Shop All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Horizontal scroll strip */}
          <div className="flex gap-6 px-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
               style={{ scrollbarWidth: "none" }}>
            {featuredProducts.map(product => (
              <div key={product._id} className="shrink-0 w-64 snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════ PROMO BANNER ══════════════ */}
      <section className="py-20 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, #064e3b 0%, #065f46 40%, #0a7c56 70%, #064e3b 100%)",
          }}
        />
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-green-400/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="absolute top-0 right-0 h-full w-1/3">
          <div className="h-full w-full opacity-10" style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #4ade80 0%, transparent 60%)" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-5 py-2 rounded-full bg-green-400/20 text-green-300 text-sm font-bold border border-green-400/30 mb-6">
                💝 Limited Time Offer
              </span>
              <h2 className="text-4xl md:text-6xl font-serif font-black text-white mb-6 leading-tight">
                Ayurvedic Gold<br />
                <span className="text-green-300">Collection</span>
              </h2>
              <p className="text-xl text-white/70 mb-8">
                Premium herbal formulations starting at <span className="text-green-300 font-bold">₹299</span>. Limited stock available.
              </p>
              <Link to="/products">
                <button className="flex items-center gap-3 px-10 py-5 bg-green-400 hover:bg-green-300 text-green-950 font-black rounded-full text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(74,222,128,0.4)]">
                  SHOP THE COLLECTION <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { n: "10K+", label: "Happy Customers", icon: "😊" },
                { n: "500+", label: "Products", icon: "🌿" },
                { n: "100%", label: "Natural", icon: "✅" },
                { n: "5 ★",  label: "Avg Rating", icon: "⭐" },
              ].map((s, i) => (
                <div
                  key={i}
                  className="p-6 rounded-3xl backdrop-blur-sm border border-white/10 hover:border-green-400/30 transition-all duration-300 hover:-translate-y-1"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="text-3xl font-black text-white mb-1">{s.n}</div>
                  <div className="text-white/50 text-sm">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ BEST SELLERS ══════════════ */}
      {bestSellers.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-2">⭐ Customer Favorites</p>
                <h2 className="text-4xl md:text-5xl font-serif font-black text-slate-900">
                  Best <span className="text-primary">Sellers</span>
                </h2>
              </div>
              <Link to="/products" className="hidden md:flex items-center gap-1 text-primary font-semibold hover:gap-3 transition-all">
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {bestSellers.slice(0, 8).map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/products">
                <button className="inline-flex items-center gap-3 px-12 py-4 bg-slate-900 hover:bg-primary text-white font-bold rounded-full text-base transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  View All Products <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════ WHY DIVYAVEDA ══════════════ */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-2">Our Promise</p>
            <h2 className="text-4xl md:text-5xl font-serif font-black text-slate-900">
              Why Choose <span className="text-primary">Divyaveda?</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { Icon: Shield,   col: "#064e3b", light: "#d1fae5", title: "100% Authentic",   desc: "All products certified and sourced from trusted Ayurvedic manufacturers." },
              { Icon: Truck,    col: "#1e3a5f", light: "#dbeafe", title: "Fast Delivery",    desc: "Free shipping on orders above ₹500. Delivered in 3–5 business days." },
              { Icon: Sparkles, col: "#713f12", light: "#fef3c7", title: "Premium Quality",  desc: "Rigorous quality checks on every product before it reaches you." },
              { Icon: Heart,    col: "#4a044e", light: "#fae8ff", title: "Made with Love",   desc: "Ancient Ayurvedic wisdom meets modern science in every product." },
            ].map(({ Icon, col, light, title, desc }, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl bg-white border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div
                  className="h-14 w-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: light }}
                >
                  <Icon className="h-7 w-7" style={{ color: col }} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ NEWSLETTER ══════════════ */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-green-950 to-emerald-900">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, #4ade80 0%, transparent 50%), radial-gradient(circle at 80% 20%, #34d399 0%, transparent 50%)" }} />
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <Leaf className="h-10 w-10 text-green-400 mx-auto mb-6 opacity-80" />
          <h2 className="text-4xl md:text-5xl font-serif font-black text-white mb-4">
            Start Your Wellness Journey
          </h2>
          <p className="text-white/60 text-lg mb-10">
            Get exclusive offers, wellness tips, and new product alerts — straight to your inbox.
          </p>
          <form
            onSubmit={e => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-green-400 backdrop-blur-sm transition-all"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-green-400 hover:bg-green-300 text-green-950 font-black rounded-full whitespace-nowrap transition-all duration-300 hover:scale-105"
            >
              Subscribe
            </button>
          </form>
          <p className="text-white/30 text-xs mt-4">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* CSS for marquee + fade animations */}
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
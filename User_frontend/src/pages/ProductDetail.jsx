import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import {
  ChevronLeft, ChevronRight, ShoppingCart, Zap,
  Truck, ShieldCheck, RefreshCw, Star, Package,
  CheckCircle2, ChevronDown, ChevronUp, Plus, Minus,
  Heart, Share2, Tag, Info,
} from "lucide-react";

/* ─── Reusable mini-components ───────────────────────────── */

const RatingBadge = ({ rating = 4.3, count = 124 }) => (
  <div className="flex items-center gap-2 flex-wrap">
    <div className="flex items-center gap-1 bg-primary text-white text-white text-xs font-bold px-2 py-0.5 rounded">
      <span>{rating}</span>
      <Star className="h-3 w-3 fill-white" />
    </div>
    <span className="text-slate-400 text-xs sm:text-sm">{count.toLocaleString()} ratings &amp; reviews</span>
  </div>
);

/* Desktop hover-zoom image (hidden on mobile) */
const ZoomImage = ({ src, alt }) => {
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const ref = useRef(null);
  return (
    <div
      ref={ref}
      className="relative w-full aspect-square overflow-hidden bg-white rounded-xl border border-slate-100"
      style={{ cursor: zoom ? "crosshair" : "default" }}
      onMouseEnter={() => setZoom(true)}
      onMouseLeave={() => setZoom(false)}
      onMouseMove={(e) => {
        const r = ref.current.getBoundingClientRect();
        setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
    >
      <img
        src={src || "https://placehold.co/600x600?text=No+Image"}
        alt={alt}
        className="w-full h-full object-contain p-4 select-none"
        style={zoom ? { transform: "scale(2.4)", transformOrigin: `${pos.x}% ${pos.y}%`, transition: "none" } : { transition: "transform 0.1s" }}
        draggable={false}
      />
      <span className="absolute bottom-2 right-2 text-[10px] bg-slate-800/60 text-white px-1.5 py-0.5 rounded">
        Hover to zoom
      </span>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════ */
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [quantity, setQuantity]       = useState(1);
  const [isAdding, setIsAdding]       = useState(false);
  const [isBuying, setIsBuying]       = useState(false);
  const [activeImg, setActiveImg]     = useState(0);
  const [related, setRelated]         = useState([]);
  const [activeTab, setActiveTab]     = useState("desc");
  const [showAllAdv, setShowAllAdv]   = useState(false);
  const [wishlisted, setWishlisted]   = useState(false);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [id]);

  useEffect(() => {
    setLoading(true); setActiveImg(0); setQuantity(1);
    api.get(`/products/${id}`)
      .then(res => {
        setProduct(res.data.product || res.data.data || res.data);
        api.get(`/products/${id}/related`).then(r => setRelated(r.data || [])).catch(() => {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  /* ── Loading skeleton ── */
  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="space-y-3 text-center">
        <div className="h-10 w-10 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-slate-400 text-sm">Loading…</p>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
      <Package size={56} className="text-slate-200" />
      <h2 className="text-xl font-bold text-slate-800">Product not found</h2>
      <button onClick={() => navigate("/products")} className="px-6 py-2.5 rounded-full bg-primary text-white text-white font-semibold text-sm">
        Browse Products
      </button>
    </div>
  );

  /* ── Build images array (main_image + images[]) ── */
  const imgs = (() => {
    const a = [];
    if (product.main_image) a.push(product.main_image);
    (product.images || []).forEach(u => { if (u && !a.includes(u)) a.push(u); });
    (product.productImages || []).forEach(u => { if (u && !a.includes(u)) a.push(u); });
    return a.length ? a : ["https://placehold.co/600x600?text=No+Image"];
  })();

  const price    = product.diplayPrice || product.price || 0;
  const mrp      = product.mrp || 0;
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const inStock  = product.stock_quantity > 0;
  const lowStock = inStock && product.stock_quantity <= 10;
  const advantages = product.advantages || [];

  const handleAddToCart = async () => {
    if (isAdding) return;
    setIsAdding(true);
    await addToCart(product._id, quantity, product);
    setIsAdding(false);
  };

  const handleBuyNow = async () => {
    if (isBuying) return;
    setIsBuying(true);
    const ok = await addToCart(product._id, quantity, product);
    setIsBuying(false);
    if (ok) navigate("/checkout");
  };

  const prevImg = () => setActiveImg(i => (i - 1 + imgs.length) % imgs.length);
  const nextImg = () => setActiveImg(i => (i + 1) % imgs.length);

  const TABS = [
    { id: "desc", label: "Description" },
    { id: "feat", label: "Features" },
    { id: "info", label: "Product Info" },
  ];

  /* ══════════════════════════════════════ RENDER ══════════════ */
  return (
    <div className="bg-slate-50 min-h-screen">

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-slate-100 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-1 text-xs text-slate-400 flex-wrap">
            <Link to="/" className="hover:text-primary shrink-0">Home</Link>
            <ChevronRight size={11} className="shrink-0" />
            <Link to="/products" className="hover:text-primary shrink-0">Products</Link>
            {product.category_id?.name && (
              <>
                <ChevronRight size={11} className="shrink-0" />
                <Link to={`/products?category=${product.category_id._id}`} className="hover:text-primary capitalize shrink-0">
                  {product.category_id.name}
                </Link>
              </>
            )}
            <ChevronRight size={11} className="shrink-0" />
            <span className="text-slate-700 font-medium truncate max-w-[140px] sm:max-w-xs">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-8">

        {/* ══════ MAIN PRODUCT CARD ══════ */}
        <div className="bg-white sm:mt-4 sm:rounded-2xl sm:shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* ────── LEFT: Gallery ────── */}
            <div className="lg:border-r border-slate-100 lg:sticky lg:top-[64px] lg:self-start">

              {/* ── MOBILE gallery: full-width image + thumbnail strip ── */}
              <div className="lg:hidden">
                {/* Badges row */}
                {(product.is_new_launch || discount > 0) && (
                  <div className="flex items-center gap-2 px-4 pt-3">
                    {product.is_new_launch && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded uppercase tracking-wide">New</span>
                    )}
                    {discount > 0 && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded">{discount}% OFF</span>
                    )}
                  </div>
                )}

                {/* Main image */}
                <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
                  <img
                    src={imgs[activeImg]}
                    alt={product.name}
                    className="w-full h-full object-contain bg-white p-4"
                  />
                  {imgs.length > 1 && (
                    <>
                      <button
                        onClick={prevImg}
                        className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 shadow flex items-center justify-center"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={nextImg}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 shadow flex items-center justify-center"
                      >
                        <ChevronRight size={16} />
                      </button>
                      {/* dots */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {imgs.map((_, i) => (
                          <button key={i} onClick={() => setActiveImg(i)}
                            className={`h-1.5 rounded-full transition-all ${activeImg === i ? "w-4 bg-primary text-white" : "w-1.5 bg-slate-300"}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnail strip (mobile) */}
                {imgs.length > 1 && (
                  <div className="flex gap-2 px-4 pb-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                    {imgs.map((img, i) => (
                      <button key={i} onClick={() => setActiveImg(i)}
                        className={`shrink-0 h-14 w-14 rounded-lg border-2 overflow-hidden transition-all ${
                          activeImg === i ? "border-primary ring-1 ring-primary/20" : "border-slate-200"
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── DESKTOP gallery ── */}
              <div className="hidden lg:flex gap-4 p-6">
                {/* Vertical thumbnail strip */}
                {imgs.length > 1 && (
                  <div className="flex flex-col gap-2 w-[72px] shrink-0">
                    {imgs.map((img, i) => (
                      <button key={i} onClick={() => setActiveImg(i)}
                        className={`h-[72px] w-[72px] rounded-xl border-2 overflow-hidden transition-all ${
                          activeImg === i ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-200 hover:border-slate-400"
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
                {/* Zoom image */}
                <div className="flex-1 min-w-0">
                  {(product.is_new_launch || discount > 0) && (
                    <div className="flex items-center gap-2 mb-3">
                      {product.is_new_launch && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded uppercase">New Launch</span>
                      )}
                      {discount > 0 && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded">{discount}% OFF</span>
                      )}
                    </div>
                  )}
                  <ZoomImage src={imgs[activeImg]} alt={product.name} />
                  {imgs.length > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-3">
                      <button onClick={prevImg} className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 shadow-sm">
                        <ChevronLeft size={16} />
                      </button>
                      <div className="flex gap-1.5">
                        {imgs.map((_, i) => (
                          <button key={i} onClick={() => setActiveImg(i)}
                            className={`h-1.5 rounded-full transition-all ${activeImg === i ? "w-5 bg-blue-500" : "w-1.5 bg-slate-200"}`}
                          />
                        ))}
                      </div>
                      <button onClick={nextImg} className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 shadow-sm">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                  {/* Desktop CTA buttons */}
                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={handleAddToCart} disabled={isAdding || !inStock}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:bg-slate-200 text-slate-900 font-bold text-sm transition-all active:scale-95"
                    >
                      <ShoppingCart size={17} />
                      {isAdding ? "Adding…" : inStock ? "ADD TO CART" : "OUT OF STOCK"}
                    </button>
                    <button
                      onClick={handleBuyNow} disabled={isBuying || !inStock}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 disabled:bg-slate-200 text-white font-bold text-sm transition-all active:scale-95"
                    >
                      <Zap size={17} />
                      {isBuying ? "…" : "BUY NOW"}
                    </button>
                  </div>
                  {/* Wishlist / Share */}
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => setWishlisted(v => !v)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full border text-sm font-medium transition-all ${
                        wishlisted ? "border-red-300 text-red-600 bg-red-50" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Heart size={15} className={wishlisted ? "fill-red-500 text-red-500" : ""} />
                      {wishlisted ? "Wishlisted" : "Wishlist"}
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all">
                      <Share2 size={15} /> Share
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ────── RIGHT: Product Info ────── */}
            <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4">

              {/* Name + Volume */}
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 leading-snug">
                  {product.name}
                </h1>
                {product.volume && (
                  <p className="text-sm text-slate-500 mt-0.5">{product.volume}</p>
                )}
              </div>

              {/* Rating */}
              <RatingBadge />

              {/* Divider */}
              <hr className="border-slate-100" />

              {/* Price */}
              <div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-bold text-slate-900">₹{price.toLocaleString()}</span>
                  {mrp > price && (
                    <>
                      <span className="text-base text-slate-400 line-through">₹{mrp.toLocaleString()}</span>
                      <span className="text-sm text-primary font-bold">{discount}% off</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Inclusive of all taxes</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <Tag size={13} className="text-primary shrink-0" />
                  <p className="text-xs text-slate-600"><span className="font-semibold">Free shipping</span> on orders above ₹500</p>
                </div>
              </div>

              {/* Stock status */}
              <div>
                {inStock ? (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${lowStock ? "bg-orange-100 text-orange-700" : "bg-primary/10 text-primary"}`}>
                    <CheckCircle2 size={11} />
                    {lowStock ? `Only ${product.stock_quantity} left!` : "In Stock"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                    <Info size={11} /> Currently Unavailable
                  </span>
                )}
              </div>

              {/* Quantity */}
              {inStock && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-600">Qty:</span>
                  <div className="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-slate-100 transition-colors">
                      <Minus size={14} className="text-slate-600" />
                    </button>
                    <span className="w-10 text-center font-bold text-slate-900 text-sm">{quantity}</span>
                    <button onClick={() => setQuantity(q => Math.min(q + 1, product.stock_quantity))} className="px-3 py-2 hover:bg-slate-100 transition-colors">
                      <Plus size={14} className="text-slate-600" />
                    </button>
                  </div>
                </div>
              )}

              {/* Key Highlights */}
              {advantages.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-2">Key Highlights</h3>
                  <ul className="space-y-1.5">
                    {(showAllAdv ? advantages : advantages.slice(0, 4)).map((adv, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" />
                        {adv}
                      </li>
                    ))}
                  </ul>
                  {advantages.length > 4 && (
                    <button onClick={() => setShowAllAdv(v => !v)} className="mt-2 text-blue-600 text-xs font-medium flex items-center gap-1 hover:underline">
                      {showAllAdv ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> +{advantages.length - 4} more</>}
                    </button>
                  )}
                </div>
              )}

              {/* Divider */}
              <hr className="border-slate-100" />

              {/* Delivery info */}
              <div className="space-y-2.5">
                {[
                  { Icon: Truck,       title: "Free Delivery",    sub: "On orders above ₹500 · 3–5 days" },
                  { Icon: ShieldCheck, title: "100% Authentic",   sub: "Genuine, certified products" },
                  { Icon: RefreshCw,   title: "7-Day Returns",    sub: "Easy, hassle-free return policy" },
                ].map(({ Icon, title, sub }) => (
                  <div key={title} className="flex items-center gap-3">
                    <div className="p-2 bg-primary/5 rounded-lg shrink-0">
                      <Icon size={15} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{title}</p>
                      <p className="text-xs text-slate-400">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile wishlist/share row */}
              <div className="flex gap-3 lg:hidden pb-2">
                <button
                  onClick={() => setWishlisted(v => !v)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full border text-sm font-medium transition-all ${
                    wishlisted ? "border-red-300 text-red-600 bg-red-50" : "border-slate-200 text-slate-600"
                  }`}
                >
                  <Heart size={15} className={wishlisted ? "fill-red-500 text-red-500" : ""} />
                  {wishlisted ? "Wishlisted" : "Wishlist"}
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full border border-slate-200 text-slate-600 text-sm font-medium">
                  <Share2 size={15} /> Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ══════ TABBED DETAILS ══════ */}
        <div className="bg-white sm:mt-4 sm:rounded-2xl sm:shadow-sm overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-slate-100 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 sm:px-8 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
                  activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-4 sm:p-6">
            {activeTab === "desc" && (
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line">
                {product.description || "No description available."}
              </p>
            )}

            {activeTab === "feat" && (
              advantages.length > 0
                ? <ul className="space-y-3">
                    {advantages.map((adv, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                        <span className="shrink-0 h-5 w-5 bg-primary text-white text-white text-[10px] font-bold rounded-full flex items-center justify-center mt-0.5">{i + 1}</span>
                        {adv}
                      </li>
                    ))}
                  </ul>
                : <p className="text-slate-400 text-sm">No features listed.</p>
            )}

            {activeTab === "info" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[280px]">
                  <tbody className="divide-y divide-slate-100">
                    {[
                      ["Product Name",  product.name],
                      ["Category",      product.category_id?.name],
                      ["Sub-Category",  product.subcategory_id?.name],
                      ["Volume / Size", product.volume],
                      ["Stock",         inStock ? `In stock (${product.stock_quantity} units)` : "Out of stock"],
                      ["New Launch",    product.is_new_launch ? "Yes" : "No"],
                    ].filter(([, v]) => v).map(([l, v]) => (
                      <tr key={l} className="hover:bg-slate-50">
                        <td className="py-2.5 pr-4 text-slate-500 font-medium text-xs sm:text-sm w-2/5">{l}</td>
                        <td className="py-2.5 text-slate-900 capitalize text-xs sm:text-sm">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ══════ RELATED PRODUCTS ══════ */}
        {related.length > 0 && (
          <div className="px-4 sm:px-0 py-6 pb-28 lg:pb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">You May Also Like</h2>
              <Link to="/products" className="text-sm text-primary font-medium hover:underline flex items-center gap-0.5">
                View All <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {related.slice(0, 5).map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Bottom spacer for mobile sticky bar when no related products */}
        {related.length === 0 && <div className="h-28 lg:h-0" />}
      </div>

      {/* ══════ STICKY MOBILE CTA BAR ══════ */}
      {inStock && (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-slate-200 shadow-[0_-2px_16px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-2 px-3 py-2.5 max-w-lg mx-auto">
            {/* Price */}
            <div className="shrink-0 mr-1">
              <p className="text-[10px] text-slate-400 leading-none">Price</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">₹{price.toLocaleString()}</p>
            </div>
            {/* Qty stepper */}
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden ml-auto">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-2 py-2 hover:bg-slate-100 active:bg-slate-200">
                <Minus size={11} />
              </button>
              <span className="w-6 text-center text-xs font-bold text-slate-900">{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(q + 1, product.stock_quantity))} className="px-2 py-2 hover:bg-slate-100 active:bg-slate-200">
                <Plus size={11} />
              </button>
            </div>
            {/* Add to Cart */}
            <button
              onClick={handleAddToCart} disabled={isAdding}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-amber-600 disabled:opacity-60 text-slate-900 font-bold rounded-xl text-xs transition-colors"
            >
              <ShoppingCart size={14} />
              {isAdding ? "…" : "Add"}
            </button>
            {/* Buy Now */}
            <button
              onClick={handleBuyNow} disabled={isBuying}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-accent text-accent-foreground hover:bg-accent/90 active:bg-orange-700 disabled:opacity-60 text-white font-bold rounded-xl text-xs transition-colors"
            >
              <Zap size={14} />
              {isBuying ? "…" : "Buy Now"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

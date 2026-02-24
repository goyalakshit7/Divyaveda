import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import Button from "../components/Button";
import ProductCard from "../components/ProductCard";
import { 
  ArrowLeft, Minus, Plus, ShoppingCart, Truck, ShieldCheck, Heart,
  Package, CheckCircle2, Star, ChevronRight, Info
} from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Scroll to top when component mounts or ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/products/${id}`);
        const data = response.data.product || response.data.data || response.data;
        setProduct(data);
        
        // Fetch Related Products
        try {
           const relatedRes = await api.get(`/products/${id}/related`);
           setRelatedProducts(relatedRes.data || []);
        } catch (relatedErr) {
           console.log("Related products fetch failed", relatedErr);
        }
      } catch (err) {
        console.error("Fetch product error:", err);
        setError("Unable to load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (isAdding) return;
    setIsAdding(true);
    await addToCart(product._id || product.id, quantity);
    setIsAdding(false);
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mx-auto" />
        <p className="text-slate-600 mt-4">Loading product details...</p>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
       <Package size={64} className="text-slate-300" />
       <h2 className="text-2xl font-bold text-slate-900">Product not found</h2>
       <p className="text-slate-500">The product you are looking for might have been removed.</p>
       <Button variant="outline" onClick={() => navigate('/products')}>Browse Products</Button>
    </div>
  );
  
  // Image handling
  const mainImage = product.main_image || product.productImages?.[0];
  const images = product.productImages && product.productImages.length > 0 
      ? product.productImages 
      : (mainImage ? [mainImage] : []);

  // Availability status
  const inStock = product.stock_quantity > 0;
  const lowStock = product.stock_quantity > 0 && product.stock_quantity <= 10;

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-600 mb-6 flex-wrap">
          <Link to="/" className="hover:text-emerald-700 transition">Home</Link>
          <ChevronRight size={16} className="text-slate-400" />
          <Link to="/products" className="hover:text-emerald-700 transition">Products</Link>
          <ChevronRight size={16} className="text-slate-400" />
          <span className="text-slate-900 font-medium truncate">{product.name}</span>
        </nav>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Left Column - Images */}
          <div className="p-6 lg:p-8">
            {/* New Launch Badge */}
            {product.is_new_launch && (
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg">
                  ✨ New Launch
                </span>
              </div>
            )}

            {/* Main Image */}
            <div className="aspect-square w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-200 relative group mb-4">
              <img 
                src={images[activeImage] || "https://placehold.co/600x600?text=No+Image"} 
                alt={product.name} 
                className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110" 
              />
              
              {/* Navigation Arrows - Show only if multiple images */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage(activeImage === 0 ? images.length - 1 : activeImage - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition opacity-0 group-hover:opacity-100"
                    aria-label="Previous image"
                  >
                    <ChevronRight size={24} className="rotate-180 text-slate-900" />
                  </button>
                  <button
                    onClick={() => setActiveImage(activeImage === images.length - 1 ? 0 : activeImage + 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition opacity-0 group-hover:opacity-100"
                    aria-label="Next image"
                  >
                    <ChevronRight size={24} className="text-slate-900" />
                  </button>
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900/75 text-white text-sm rounded-full">
                    {activeImage + 1} / {images.length}
                  </div>
                </>
              )}
              
              {/* Wishlist Button */}
              <button className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition">
                <Heart size={20} />
              </button>
            </div>
            
            {/* Thumbnail Gallery - Show ALL images */}
            {images.length > 1 && (
               <div className={`grid gap-3 ${images.length >= 5 ? 'grid-cols-5' : `grid-cols-${images.length}`}`}>
                 {images.map((img, idx) => (
                   <button 
                     key={idx}
                     onClick={() => setActiveImage(idx)}
                     className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                       activeImage === idx 
                         ? "border-emerald-600 ring-2 ring-emerald-200 scale-105" 
                         : "border-slate-200 hover:border-slate-300 hover:scale-105"
                     }`}
                   >
                     <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                   </button>
                 ))}
               </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="p-6 lg:p-8 flex flex-col">
            {/* Product Name */}
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3 leading-tight">
              {product.name}
            </h1>
            
            {/* Stock Status */}
            <div className="mb-4">
              {inStock ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className={lowStock ? "text-yellow-600" : "text-emerald-600"} />
                  <span className={`text-sm font-medium ${lowStock ? "text-yellow-700" : "text-emerald-700"}`}>
                    {lowStock ? `Only ${product.stock_quantity} left in stock!` : "In Stock"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Info size={18} className="text-red-600" />
                  <span className="text-sm font-medium text-red-700">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Price Section */}
            <div className="border-y border-slate-200 py-4 mb-6">
              <div className="flex items-baseline gap-4 flex-wrap">
                <span className="text-4xl font-bold text-slate-900">
                  ₹{product.diplayPrice || product.price}
                </span>
                {product.mrp && product.mrp > (product.diplayPrice || product.price) && (
                  <>
                    <span className="text-xl text-slate-400 line-through">₹{product.mrp}</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold">
                      {Math.round(((product.mrp - (product.diplayPrice || product.price)) / product.mrp) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-2">Inclusive of all taxes</p>
            </div>

            {/* Volume/Size */}
            {product.volume && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Volume</h3>
                <div className="inline-flex items-center px-4 py-2 bg-slate-100 rounded-lg">
                  <Package size={16} className="mr-2 text-slate-600" />
                  <span className="font-medium text-slate-900">{product.volume}</span>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">About this product</h3>
              <p className="text-slate-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Advantages/Key Features */}
            {product.advantages && product.advantages.length > 0 && (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Star size={20} className="text-emerald-600" />
                  Key Benefits
                </h3>
                <ul className="space-y-2">
                  {product.advantages.map((advantage, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{advantage}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {error && (
              <div className="p-4 mb-4 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200 flex items-center gap-2">
                <Info size={16} />
                {error}
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="mt-auto space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-slate-300 rounded-lg overflow-hidden">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 hover:bg-slate-100 transition"
                    disabled={!inStock}
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-16 text-center font-semibold text-lg">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 hover:bg-slate-100 transition"
                    disabled={!inStock || quantity >= product.stock_quantity}
                  >
                    <Plus size={18} />
                  </button>
                </div>
                
                <Button 
                  onClick={handleAddToCart}
                  isLoading={isAdding}
                  disabled={!inStock}
                  className="flex-1 py-4 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300"
                >
                  <ShoppingCart className="mr-2" size={20} />
                  {inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 rounded-lg">
                    <Truck size={20} className="text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Free Delivery</h4>
                    <p className="text-xs text-slate-500">On orders ₹500+</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 rounded-lg">
                    <ShieldCheck size={20} className="text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">100% Authentic</h4>
                    <p className="text-xs text-slate-500">Original Products</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
           <div className="mt-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">You May Also Like</h2>
                <Link to="/products" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1">
                  View All <ChevronRight size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {relatedProducts.slice(0, 4).map(relProduct => (
                  <ProductCard key={relProduct._id} product={relProduct} />
                ))}
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import Button from "../components/Button";
import ProductCard from "../components/ProductCard";
import { ArrowLeft, Minus, Plus, ShoppingCart, Truck, ShieldCheck, Heart } from "lucide-react";

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

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/products/${id}`);
        // Handle nested data structures often returned by backend
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
    await addToCart(product._id || product.id, quantity); // Ensure ID is passed correctly
    setIsAdding(false);
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
    </div>
  );

  if (!product) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
       <h2 className="text-2xl font-bold text-slate-900">Product not found</h2>
       <p className="text-slate-500">The product you are looking for might have been removed.</p>
       <Button variant="outline" onClick={() => navigate('/')}>Return to Store</Button>
    </div>
  );
  
  // Image handling
  const mainImage = product.main_image || product.productImages?.[0];
  const images = product.productImages && product.productImages.length > 0 
      ? product.productImages 
      : (mainImage ? [mainImage] : []);

  return (
    <div className="pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link to="/" className="hover:text-green-700">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-green-700">Products</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">{product.name}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 relative group">
            <img 
              src={images[activeImage] || "https://placehold.co/600x600?text=No+Image"} 
              alt={product.title || product.name} 
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105" 
            />
          </div>
          
          {images.length > 1 && (
             <div className="grid grid-cols-4 gap-4">
               {images.map((img, idx) => (
                 <button 
                   key={idx}
                   onClick={() => setActiveImage(idx)}
                   className={`relative aspect-square overflow-hidden rounded-lg border-2 bg-slate-50 ${activeImage === idx ? "border-green-600 ring-2 ring-green-600/20" : "border-slate-100 hover:border-slate-300"}`}
                 >
                   <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                 </button>
               ))}
             </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col pt-2">
          <div className="mb-6 border-b border-slate-100 pb-6">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 tracking-tight mb-2">{product.title || product.name}</h1>
            <div className="flex items-center gap-4 text-lg mt-4">
               <span className="text-2xl font-bold text-slate-900">₹{product.diplayPrice || product.price}</span>
               {product.mrp && <span className="text-slate-400 line-through text-lg">₹{product.mrp}</span>}
               {product.mrp && (
                  <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    {Math.round(((product.mrp - (product.diplayPrice || product.price)) / product.mrp) * 100)}% OFF
                  </span>
               )}
            </div>
            <p className="text-sm text-slate-500 mt-2">Inclusive of all taxes</p>
          </div>

          <div className="prose prose-slate mb-8 line-clamp-[10]">
            <p className="text-slate-600 leading-relaxed text-base">{product.description}</p>
          </div>
          
          {error && <div className="p-3 mb-4 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>}

          <div className="space-y-6 mt-auto">
            {/* Quantity Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
               <div className="flex items-center rounded-lg border border-slate-200 bg-white">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-l-lg transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-slate-900 font-medium">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-r-lg transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
               </div>
               
               <div className="flex flex-1 gap-3">
                 <Button 
                   onClick={handleAddToCart}
                   isLoading={isAdding}
                   className="flex-1 py-3 text-base bg-slate-900 text-white hover:bg-slate-800"
                 >
                   <ShoppingCart className="mr-2 h-5 w-5" />
                   Add to Cart
                 </Button>
               </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 py-6 border-t border-slate-100">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 rounded-lg text-green-700">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Free Shipping</h4>
                  <p className="text-xs text-slate-500">On orders over ₹500</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 rounded-lg text-green-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Authentic</h4>
                  <p className="text-xs text-slate-500">100% Original Products</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
         <div className="mt-24 border-t border-slate-100 pt-12">
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-8">You may also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(relProduct => (
                <ProductCard key={relProduct._id} product={relProduct} />
              ))}
            </div>
         </div>
      )}
    </div>
  );
};

export default ProductDetail;
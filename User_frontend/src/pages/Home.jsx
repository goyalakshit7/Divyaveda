import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import Button from "../components/Button";
import { ArrowRight, Sparkles, Leaf, ShieldCheck, Truck } from "lucide-react";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        // Handle different response structures gracefully
        if (Array.isArray(response.data)) {
          setProducts(response.data);
        } else if (Array.isArray(response.data.products)) {
          setProducts(response.data.products);
        } else if (response.data?.data && Array.isArray(response.data.data)) {
           setProducts(response.data.data);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Unable to load latest drops.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="pb-12 space-y-20">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-slate-100 min-h-[500px] flex items-center">
        {/* Background Image/Overlay */}
        <div className="absolute inset-0">
           <img 
             src="data:image/jpeg;base64,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" 
             alt="Herbal Background" 
             className="w-full h-full object-cover object-center opacity-90"
           />
           <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 to-transparent" />
        </div>
        
        <div className="relative z-10 px-8 max-w-7xl mx-auto w-full">
           <div className="max-w-xl space-y-6">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold uppercase tracking-wider">
               <Sparkles className="w-3 h-3" /> Pure & Natural
             </div>
             <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight">
               Nature's <br/> <span className="text-green-300">Resilience</span>
             </h1>
             <p className="text-lg text-white/90 leading-relaxed max-w-md">
               Discover authentic ayurvedic solutions crafted for modern wellness. Pure ingredients, potent formulations.
             </p>
             <div className="pt-4 flex gap-4">
               <Link to="/products">
                 <Button size="lg" className="rounded-full px-8 bg-green-700 hover:bg-green-800 border-none text-white text-base shadow-lg shadow-green-900/20">
                   Shop Now
                 </Button>
               </Link>
             </div>
           </div>
        </div>
      </section>

      {/* Categories / Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
           <div className="flex flex-col items-center md:items-start p-6 bg-green-50 rounded-2xl">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 mb-4">
                <Leaf className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-slate-900 mb-2">100% Natural</h3>
              <p className="text-slate-600 text-sm">Sourced directly from nature, free from harmful chemicals.</p>
           </div>
           <div className="flex flex-col items-center md:items-start p-6 bg-blue-50 rounded-2xl">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-slate-900 mb-2">Lab Tested</h3>
              <p className="text-slate-600 text-sm">Rigorous testing ensures safety, purity and potency.</p>
           </div>
           <div className="flex flex-col items-center md:items-start p-6 bg-orange-50 rounded-2xl">
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 mb-4">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-slate-900 mb-2">Fast Shipping</h3>
              <p className="text-slate-600 text-sm">Delivery across India within 3-5 business days.</p>
           </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-serif font-bold text-slate-900">Bestsellers</h2>
            <p className="text-slate-500 mt-2">Our most loved formulations</p>
          </div>
          <Link to="/products" className="hidden sm:flex items-center gap-2 text-green-700 hover:text-green-800 font-medium transition-colors">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-center">
            {error}
          </div>
        )}

        {loading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {[...Array(4)].map((_, i) => (
               <div key={i} className="aspect-[4/5] rounded-2xl bg-slate-100 animate-pulse" />
             ))}
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-500">
                <p className="text-xl">No products available at the moment.</p>
                <p className="text-sm mt-2">Check back soon for new arrivals.</p>
              </div>
            ) : (
              products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))
            )}
          </div>
        )}
        
        <div className="sm:hidden flex justify-center mt-8">
           <Link to="/products">
             <Button variant="outline" className="w-full border-slate-300 text-slate-700">View all products</Button>
           </Link>
        </div>
      </section>
      
      {/* Newsletter Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-green-900 text-white p-8 md:p-16 relative overflow-hidden text-center">
           <div className="relative z-10 max-w-2xl mx-auto space-y-6">
             <h2 className="text-3xl md:text-4xl font-serif font-bold">Start your wellness journey</h2>
             <p className="text-slate-300">
               Join our community and get exclusive access to holistic health tips and new product launches.
             </p>
             <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
               <input 
                 type="email" 
                 placeholder="Your email address" 
                 className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
               />
               <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-medium transition-colors">
                 Subscribe
               </button>
             </div>
           </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
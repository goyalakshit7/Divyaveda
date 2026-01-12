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
             src="https://images.unsplash.com/photo-1610419993557-07455850901b?q=80&w=2070&auto=format&fit=crop" 
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
        <div className="rounded-3xl bg-slate-900 text-white p-8 md:p-16 relative overflow-hidden text-center">
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
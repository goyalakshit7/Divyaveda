import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import { Filter, X, ChevronDown, Sparkles } from "lucide-react";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // Filter States
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort = searchParams.get("sort") || "newest"; // newest, price_asc, price_desc
  const search = searchParams.get("search") || "";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const base = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/api$/, "");
        const res = await fetch(`${base}/api/categories`);
        const data = await res.json();
        setCategories([{ _id: "", name: "All Products" }, ...(data.categories || data || [])]);
      } catch (err) {
        console.error("Failed to fetch categories");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category) params.append("category", category);
        if (minPrice) params.append("minPrice", minPrice);
        if (maxPrice) params.append("maxPrice", maxPrice);
        if (sort) params.append("sort", sort);
        if (search) params.append("search", search);

        const res = await api.get(`/products?${params.toString()}`);
        setProducts(res.data.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, minPrice, maxPrice, sort, search]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="bg-slate-50/50 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header Section */}
        <div className="mb-8 sm:mb-12">
          {search ? (
            <div className="mb-6">
               <p className="text-primary font-medium text-sm tracking-wider uppercase mb-2">Search Results</p>
               <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-slate-900 leading-tight">
                 &ldquo;{search}&rdquo;
               </h1>
            </div>
          ) : (
            <div className="text-center max-w-2xl mx-auto mb-10">
               <Sparkles className="h-8 w-8 text-primary mx-auto mb-4 opacity-80" />
               <h1 className="text-4xl sm:text-5xl font-serif font-black text-slate-900 mb-4 tracking-tight">
                 Nature's <span className="text-primary">Apothecary</span>
               </h1>
               <p className="text-slate-500 text-lg">
                 Discover our premium collection of authentic Ayurvedic remedies, organically sourced for your total wellbeing.
               </p>
            </div>
          )}

          {/* Category Chips Container */}
          {!search && (
            <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto scrollbar-hide snap-x">
              {categories.map((cat) => {
                const isActive = category === cat._id || (category === "" && cat._id === "");
                return (
                  <button
                    key={cat._id || 'all'}
                    onClick={() => updateFilter("category", cat._id)}
                    className={`shrink-0 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 snap-start capitalize
                      ${isActive 
                        ? 'bg-primary text-white shadow-md shadow-primary/20 scale-100' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-primary scale-95'
                      }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle & Sort Header */}
          <div className="lg:hidden flex items-center justify-between w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-100 sticky top-[72px] z-30">
            <button 
              className="flex items-center gap-2 text-slate-700 font-semibold px-4 py-2 bg-slate-50 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => setShowFilters(true)}
            >
              <Filter className="h-4 w-4" /> Filters
            </button>
            <div className="relative">
              <select 
                className="appearance-none bg-transparent font-semibold text-slate-700 py-2 pl-4 pr-10 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                value={sort}
                onChange={(e) => updateFilter("sort", e.target.value)}
              >
                <option value="newest">New Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Filters Sidebar */}
          <div className={`
            fixed inset-y-0 left-0 z-[100] w-full max-w-xs bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:static lg:block lg:w-72 lg:max-w-none lg:shadow-none lg:bg-transparent lg:transform-none lg:z-0
            ${showFilters ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
             <div className="h-full flex flex-col lg:block">
               {/* Mobile Sidebar Header */}
               <div className="flex items-center justify-between p-6 border-b border-slate-100 lg:hidden">
                 <h2 className="text-xl font-bold text-slate-900 font-serif">Filters</h2>
                 <button 
                   onClick={() => setShowFilters(false)}
                   className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors"
                 >
                   <X className="h-5 w-5" />
                 </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6 lg:p-0 lg:sticky lg:top-28">
                 <div className="bg-white lg:p-6 lg:rounded-3xl lg:shadow-sm lg:border lg:border-slate-100 space-y-8">
                   
                   <div className="hidden lg:flex items-center justify-between mb-2">
                     <h2 className="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
                       <Filter className="h-4 w-4 text-primary" /> Filter
                     </h2>
                   </div>

                   {/* Price Filter */}
                   <div>
                     <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Price Range</h3>
                     <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                          <input
                            type="number"
                            placeholder="Min"
                            className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
                            value={minPrice}
                            onChange={(e) => updateFilter("minPrice", e.target.value)}
                          />
                        </div>
                        <span className="text-slate-400 font-medium">-</span>
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                          <input
                            type="number"
                            placeholder="Max"
                            className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
                            value={maxPrice}
                            onChange={(e) => updateFilter("maxPrice", e.target.value)}
                          />
                        </div>
                     </div>
                   </div>

                   {/* Desktop Sort */}
                   <div className="hidden lg:block">
                     <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Sort By</h3>
                     <div className="space-y-2">
                       {[
                         { value: "newest", label: "New Arrivals" },
                         { value: "price_asc", label: "Price: Low to High" },
                         { value: "price_desc", label: "Price: High to Low" },
                       ].map(option => (
                         <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                           <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${sort === option.value ? 'border-primary bg-primary' : 'border-slate-300 group-hover:border-primary'}`}>
                             {sort === option.value && <div className="w-2 h-2 rounded-full bg-white" />}
                           </div>
                           <input
                             type="radio"
                             name="sort"
                             value={option.value}
                             checked={sort === option.value}
                             onChange={(e) => updateFilter("sort", e.target.value)}
                             className="hidden"
                           />
                           <span className={`text-sm font-medium transition-colors ${sort === option.value ? 'text-primary' : 'text-slate-600 group-hover:text-slate-900'}`}>{option.label}</span>
                         </label>
                       ))}
                     </div>
                   </div>

                   {(minPrice || maxPrice || category || search) && (
                     <div className="pt-4 border-t border-slate-100">
                       <button 
                         onClick={() => { clearFilters(); setShowFilters(false); }}
                         className="w-full py-3 text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-600 rounded-xl transition-colors"
                       >
                         Clear All Filters
                       </button>
                     </div>
                   )}
                 </div>
               </div>

               {/* Mobile Apply Button */}
               <div className="p-4 border-t border-slate-100 lg:hidden">
                 <button 
                   onClick={() => setShowFilters(false)}
                   className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-md"
                 >
                   Show Results
                 </button>
               </div>
             </div>
          </div>
          
          {/* Overlay for mobile sidebar */}
          {showFilters && (
            <div 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setShowFilters(false)}
            />
          )}

          {/* Product Grid */}
          <div className="flex-1 w-full min-w-0">
             {loading ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                 {[...Array(9)].map((_, i) => (
                   <div key={i} className="aspect-[4/5] bg-white border border-slate-100 rounded-3xl animate-pulse shadow-sm" />
                 ))}
               </div>
             ) : products.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-24 px-4 bg-white rounded-3xl border border-slate-100 shadow-sm text-center h-full min-h-[400px]">
                 <div className="w-20 h-20 bg-slate-50 flex items-center justify-center rounded-full mb-6">
                   <Filter className="h-8 w-8 text-slate-300" />
                 </div>
                 <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">No products matched</h3>
                 <p className="text-slate-500 max-w-sm mb-8">We couldn't find any items that match your current filters. Try adjusting your search or categories.</p>
                 <button 
                   onClick={clearFilters} 
                   className="px-8 py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                 >
                   Clear All Filters
                 </button>
               </div>
             ) : (
               <>
                 <div className="hidden lg:flex items-center justify-between mb-6">
                   <p className="text-sm font-medium text-slate-500">
                     Showing <span className="text-slate-900 font-bold">{products.length}</span> products
                   </p>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                   {products.map((product) => (
                     <ProductCard key={product._id} product={product} />
                   ))}
                 </div>
               </>
             )}
          </div>
        </div>
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Products;

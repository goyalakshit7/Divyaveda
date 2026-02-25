import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import { Filter, X, ChevronDown } from "lucide-react";

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
    // Fetch categories for sidebar (public - no auth needed)
    const fetchCategories = async () => {
      try {
        const base = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/api$/, "");
        const res = await fetch(`${base}/api/categories`);
        const data = await res.json();
        setCategories(data.categories || data || []);
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
        if (category) params.append("category", category); // Ideally should be ID, but backend needs to support slug or handle this
        // Note: Backend expects ID for category. If frontend uses slugs/names in URL, we need to map them or backend needs to support name.
        // For now assuming existing flow or ID usage. If user clicks link with name, it might fail if backend expects ID.
        // Ideally we should pass IDs. Assuming ID is passed in URL for now or backend handles it.
        
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-6">
        <h1 className="text-xl sm:text-3xl font-serif font-bold text-slate-900 leading-tight">
           {search ? `Results for "${search}"` : "All Products"}
        </h1>
        
        <div className="flex items-center gap-3 ml-auto">
           <select 
             className="block rounded-full border border-slate-200 py-2 pl-3 pr-8 text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-green-600 bg-white"
             value={sort}
             onChange={(e) => updateFilter("sort", e.target.value)}
           >
             <option value="newest">Newest</option>
             <option value="price_asc">Price: Low to High</option>
             <option value="price_desc">Price: High to Low</option>
           </select>
           <button 
             className="lg:hidden p-2 text-slate-500 hover:text-slate-700 bg-slate-100 rounded-full"
             onClick={() => setShowFilters(!showFilters)}
           >
             <Filter className="h-4 w-4" />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-8 gap-y-10 pt-6">
        {/* Filters Sidebar */}
        <div className={`lg:block ${showFilters ? 'fixed inset-0 z-40 bg-white p-6 overflow-y-auto' : 'hidden'}`}>
           {showFilters && (
             <div className="flex justify-between items-center mb-6 lg:hidden">
               <h2 className="text-lg font-bold text-slate-900">Filters</h2>
               <button onClick={() => setShowFilters(false)}>
                 <X className="h-5 w-5 text-slate-500" />
               </button>
             </div>
           )}
           
           <div className="space-y-8">
             {/* Categories */}
             <div>
               <h3 className="text-sm font-medium text-slate-900 mb-4">Categories</h3>
               <div className="space-y-2">
                 {categories.map((cat) => (
                   <div key={cat._id} className="flex items-center">
                     <input
                       id={`cat-${cat._id}`}
                       type="checkbox"
                       checked={category === cat._id}
                       onChange={() => updateFilter("category", category === cat._id ? "" : cat._id)}
                       className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-600"
                     />
                     <label htmlFor={`cat-${cat._id}`} className="ml-3 text-sm text-slate-600 hover:text-green-700 cursor-pointer">
                       {cat.name}
                     </label>
                   </div>
                 ))}
               </div>
             </div>
             
             {/* Price */}
             <div>
               <h3 className="text-sm font-medium text-slate-900 mb-4">Price Range</h3>
               <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-green-600 sm:text-sm sm:leading-6"
                    value={minPrice}
                    onChange={(e) => updateFilter("minPrice", e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-green-600 sm:text-sm sm:leading-6"
                    value={maxPrice}
                    onChange={(e) => updateFilter("maxPrice", e.target.value)}
                  />
               </div>
             </div>

             <button 
               onClick={clearFilters}
               className="text-sm text-green-600 font-medium hover:text-green-800 underline block"
             >
               Clear all filters
             </button>
           </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
           {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {[...Array(6)].map((_, i) => (
                 <div key={i} className="aspect-[4/5] bg-slate-100 rounded-xl animate-pulse" />
               ))}
             </div>
           ) : products.length === 0 ? (
             <div className="text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
               <h3 className="text-lg font-medium text-slate-900">No products found</h3>
               <p className="text-slate-500 mt-1">Try changing your filters or search query.</p>
               <button onClick={clearFilters} className="mt-4 text-green-600 font-medium hover:underline">
                 Clear filters
               </button>
             </div>
           ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {products.map((product) => (
                 <ProductCard key={product._id} product={product} />
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Products;

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ShoppingBag, User, Menu, Search, X, LogOut, ChevronRight } from 'lucide-react';
import Button from "./Button";
import { useState, useEffect, useRef } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [navCategories, setNavCategories] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  // Handle scroll effect for glass navbar
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch top-level categories for nav links
  useEffect(() => {
    const base = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/api$/, "");
    fetch(`${base}/api/categories`)
      .then(r => r.json())
      .then(data => setNavCategories((data.categories || data || []).slice(0, 4)))
      .catch(() => {});
  }, []);

  // Debounced suggestions fetch
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setLoadingSuggestions(true);
    const timer = setTimeout(async () => {
      try {
        const base = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/api$/, "");
        const res = await fetch(`${base}/api/products?search=${encodeURIComponent(searchQuery.trim())}&limit=6`);
        const data = await res.json();
        setSuggestions(data.products || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const cartCount = Array.isArray(cart) ? cart.reduce((t, item) => t + item.quantity, 0) : 0;

  const handleSearch = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      setMobileSearchOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (product) => {
    setShowSuggestions(false);
    setMobileSearchOpen(false);
    setSearchQuery("");
    navigate(`/product/${product._id}`);
  };

  /* Shared suggestion dropdown markup */
  const SuggestionDropdown = () => !showSuggestions ? null : (
    <div className="absolute top-[calc(100%+0.5rem)] left-0 right-0 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 transform transition-all duration-200 origin-top">
      {loadingSuggestions ? (
        <div className="p-6 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
           <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
           Searching...
        </div>
      ) : suggestions.length === 0 ? (
        <div className="p-6 text-center text-sm text-slate-400">No products found for "{searchQuery}"</div>
      ) : (
        <div className="py-2">
          {suggestions.map(product => (
            <button
              key={product._id}
              type="button"
              onClick={() => handleSuggestionClick(product)}
              className="group flex items-center gap-4 w-full px-4 py-3 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 group-hover:border-primary/20 transition-colors">
                <img
                  src={product.main_image || "https://placehold.co/48x48?text=P"}
                  alt={product.name}
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm font-medium text-slate-900 truncate group-hover:text-primary transition-colors">{product.name || product.title}</p>
                <p className="text-sm text-primary font-semibold mt-0.5">₹{product.diplayPrice || product.price}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transform group-hover:translate-x-1 transition-all" />
            </button>
          ))}
          <div className="px-4 py-3 mt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSearch}
              className="flex items-center justify-center w-full py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5"
            >
              See all results
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <header 
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/90 backdrop-blur-lg border-b border-slate-200 shadow-sm py-2' 
            : 'bg-white/50 backdrop-blur-md border-b border-white/20 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 transition-all duration-300">
            {/* Logo */}
            <div className="flex items-center shrink-0">
              <button 
                className="lg:hidden mr-3 p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                onClick={() => setIsMenuOpen(true)}
              >
                 <Menu className="h-6 w-6" />
              </button>
              <Link to="/" className="flex items-center gap-2 group">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight flex items-center">
                  Divya<span className="text-primary group-hover:text-secondary transition-colors duration-300">veda</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation & Search */}
            <div className="hidden lg:flex flex-1 items-center justify-center px-10 gap-10">
               <nav className="flex items-center gap-8 text-[15px] font-medium text-slate-600">
                  <Link to="/" className="hover:text-primary transition-colors hover:scale-105 active:scale-95 transform">Home</Link>
                  <Link to="/products" className="hover:text-primary transition-colors hover:scale-105 active:scale-95 transform">Shop</Link>
                  {navCategories.map(cat => (
                    <Link
                      key={cat._id}
                      to={`/products?category=${cat._id}`}
                      className="hover:text-primary transition-colors capitalize hover:scale-105 active:scale-95 transform"
                    >
                      {cat.name}
                    </Link>
                  ))}
               </nav>
               
               {/* Search with suggestions */}
               <form onSubmit={handleSearch} className="relative w-full max-w-md group" ref={searchRef}>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      className="w-full pl-5 pr-12 py-2.5 bg-slate-100/50 backdrop-blur-sm border border-slate-200/60 rounded-full text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-300 placeholder:text-slate-400 shadow-inner"
                      placeholder="Search natural products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                      onKeyDown={(e) => e.key === "Escape" && setShowSuggestions(false)}
                      autoComplete="off"
                    />
                    <button 
                      type="submit" 
                      className="absolute right-2 p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-all"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                  <SuggestionDropdown />
               </form>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-5 shrink-0">
               {/* Mobile search toggle */}
               <button
                 className="lg:hidden p-2 text-slate-600 hover:text-primary hover:bg-slate-50 transition-all rounded-full"
                 onClick={() => { setMobileSearchOpen(v => !v); setShowSuggestions(false); }}
                 aria-label="Search"
               >
                 {mobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
               </button>

               {/* Cart — always visible */}
               <Link 
                 to="/cart" 
                 className="relative p-2 text-slate-600 hover:text-primary hover:bg-primary/5 transition-all rounded-full group"
               >
                 <ShoppingBag className="h-[22px] w-[22px] group-hover:scale-110 transition-transform" />
                 {cartCount > 0 && (
                   <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 min-w-[18px] items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white ring-2 ring-white shadow-sm animate-in zoom-in duration-200">
                     {cartCount}
                   </span>
                 )}
               </Link>

               {user ? (
                <div className="flex items-center">
                  <div className="hidden sm:block w-px h-8 bg-slate-200/60 mx-2"></div>
                  <Link to="/profile" className="flex items-center gap-2 group p-1 hover:bg-slate-50 rounded-full transition-colors">
                     <div className="h-9 w-9 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold border border-primary/20 group-hover:bg-primary group-hover:text-white group-hover:scale-105 transition-all shadow-sm">
                       {user.username?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                     </div>
                  </Link>
                </div>
               ) : (
                 <div className="flex items-center gap-3">
                   <div className="hidden sm:block w-px h-8 bg-slate-200/60 mx-1"></div>
                   <Link to="/login" className="hidden sm:flex text-[15px] font-medium text-slate-600 hover:text-primary transition-colors">
                     Login
                   </Link>
                   <Link to="/register">
                     <button className="text-sm px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-full transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap active:scale-95">
                       <span className="sm:hidden">Join</span>
                       <span className="hidden sm:inline">Sign up</span>
                     </button>
                   </Link>
                 </div>
               )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Bar Wrapper */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileSearchOpen ? 'max-h-24 border-b border-slate-100 shadow-sm opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white px-4 py-3">
          <form onSubmit={handleSearch} className="relative" ref={mobileSearchRef}>
            <input
              type="text"
              autoFocus={mobileSearchOpen}
              className="w-full pl-5 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-full text-[15px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400 shadow-inner"
              placeholder="Search natural products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setMobileSearchOpen(false)}
              autoComplete="off"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-primary rounded-full">
              <Search className="h-5 w-5" />
            </button>
            <SuggestionDropdown />
          </form>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
           <div 
             className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
             onClick={() => setIsMenuOpen(false)} 
           />
           <div className="fixed inset-y-0 left-0 w-[300px] max-w-[80vw] bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                 <span className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
                   Divya<span className="text-primary">veda</span>
                 </span>
                 <button 
                   onClick={() => setIsMenuOpen(false)} 
                   className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                 >
                   <X className="h-5 w-5" />
                 </button>
              </div>
              
              <div className="flex-1 overflow-y-auto py-6 px-4">
                <nav className="flex flex-col gap-2">
                   <Link 
                     to="/" 
                     className="px-4 py-3 text-[17px] font-medium text-slate-800 hover:text-primary hover:bg-primary/5 rounded-xl transition-all" 
                     onClick={() => setIsMenuOpen(false)}
                   >
                     Home
                   </Link>
                   <Link 
                     to="/products" 
                     className="px-4 py-3 text-[17px] font-medium text-slate-800 hover:text-primary hover:bg-primary/5 rounded-xl transition-all" 
                     onClick={() => setIsMenuOpen(false)}
                   >
                     All Products
                   </Link>
                   
                   <div className="my-3 border-t border-slate-100"></div>
                   
                   <div className="px-4 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Categories</div>
                   {navCategories.map(cat => (
                     <Link
                       key={cat._id}
                       to={`/products?category=${cat._id}`}
                       className="px-4 py-2.5 text-[15px] font-medium text-slate-600 hover:text-primary hover:bg-primary/5 rounded-xl transition-all capitalize"
                       onClick={() => setIsMenuOpen(false)}
                     >
                       {cat.name}
                     </Link>
                   ))}
                </nav>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50">
                 {user ? (
                   <div className="space-y-4">
                     <Link 
                       to="/profile" 
                       className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow group" 
                       onClick={() => setIsMenuOpen(false)}
                     >
                        <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center text-lg font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold text-slate-900 truncate">{user.username}</p>
                          <p className="text-sm text-primary font-medium">View Profile</p>
                        </div>
                     </Link>
                     <Button 
                        variant="outline" 
                        className="w-full py-3 text-[15px] font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-xl transition-all flex items-center justify-center gap-2"
                        onClick={() => { logout(); setIsMenuOpen(false); }}
                     >
                        <LogOut className="h-[18px] w-[18px]" />
                        Log Out
                     </Button>
                   </div>
                 ) : (
                   <div className="grid grid-cols-2 gap-3">
                      <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full py-3 text-[15px] font-medium border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl">Label</Button>
                      </Link>
                      <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                        <Button className="w-full py-3 text-[15px] font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md">Sign up</Button>
                      </Link>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

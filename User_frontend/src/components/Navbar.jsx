import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ShoppingBag, User, Menu, Search, X, LogOut } from 'lucide-react';
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
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

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

  /* Shared suggestion dropdown markup — used by both desktop & mobile */
  const SuggestionDropdown = () => !showSuggestions ? null : (
    <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
      {loadingSuggestions ? (
        <div className="p-4 text-center text-sm text-slate-400">Searching...</div>
      ) : suggestions.length === 0 ? (
        <div className="p-4 text-center text-sm text-slate-400">No products found</div>
      ) : (
        <>
          {suggestions.map(product => (
            <button
              key={product._id}
              type="button"
              onClick={() => handleSuggestionClick(product)}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
            >
              <img
                src={product.main_image || "https://placehold.co/40x40?text=P"}
                alt={product.name}
                className="h-10 w-10 rounded-lg object-cover bg-slate-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{product.name || product.title}</p>
                <p className="text-xs text-green-700 font-semibold">₹{product.diplayPrice || product.price}</p>
              </div>
            </button>
          ))}
          <button
            type="button"
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 w-full py-3 text-sm text-green-700 font-medium hover:bg-green-50 transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            See all results for &ldquo;{searchQuery}&rdquo;
          </button>
        </>
      )}
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-20 items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center shrink-0">
              <button 
                className="md:hidden mr-2 p-2 text-slate-600 hover:bg-slate-50 rounded-lg"
                onClick={() => setIsMenuOpen(true)}
              >
                 <Menu className="h-6 w-6" />
              </button>
              <Link to="/" className="flex items-center gap-2">
                <span className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
                  Divya<span className="text-green-700">veda</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation & Search (Centered) */}
            <div className="hidden md:flex flex-1 items-center justify-center px-8 gap-8">
               <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
                  <Link to="/" className="hover:text-green-700 transition-colors">Home</Link>
                  <Link to="/products" className="hover:text-green-700 transition-colors">Shop</Link>
                  {navCategories.map(cat => (
                    <Link
                      key={cat._id}
                      to={`/products?category=${cat._id}`}
                      className="hover:text-green-700 transition-colors capitalize"
                    >
                      {cat.name}
                    </Link>
                  ))}
               </nav>
               
               {/* Search with suggestions */}
               <form onSubmit={handleSearch} className="relative w-full max-w-sm" ref={searchRef}>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600 transition-all placeholder:text-slate-400"
                      placeholder="Search for products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                      onKeyDown={(e) => e.key === "Escape" && setShowSuggestions(false)}
                      autoComplete="off"
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-green-600">
                      <Search className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Suggestions dropdown */}
                  {showSuggestions && (
                    <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                      {loadingSuggestions ? (
                        <div className="p-4 text-center text-sm text-slate-400">Searching...</div>
                      ) : suggestions.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-400">No products found</div>
                      ) : (
                        <>
                          {suggestions.map(product => (
                            <button
                              key={product._id}
                              type="button"
                              onClick={() => handleSuggestionClick(product)}
                              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
                            >
                              <img
                                src={product.main_image || "https://placehold.co/40x40?text=P"}
                                alt={product.name}
                                className="h-10 w-10 rounded-lg object-cover bg-slate-100 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{product.name || product.title}</p>
                                <p className="text-xs text-green-700 font-semibold">₹{product.diplayPrice || product.price}</p>
                              </div>
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={handleSearch}
                            className="flex items-center justify-center gap-2 w-full py-3 text-sm text-green-700 font-medium hover:bg-green-50 transition-colors"
                          >
                            <Search className="h-3.5 w-3.5" />
                            See all results for "{searchQuery}"
                          </button>
                        </>
                      )}
                    </div>
                  )}
               </form>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-4 shrink-0">

               {/* Mobile search toggle */}
               <button
                 className="md:hidden p-2 text-slate-600 hover:text-green-700 transition-colors rounded-lg"
                 onClick={() => { setMobileSearchOpen(v => !v); setShowSuggestions(false); }}
                 aria-label="Search"
               >
                 {mobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
               </button>

               {/* Cart — always visible */}
               <Link to="/cart" className="relative p-2 text-slate-600 hover:text-green-700 transition-colors">
                 <ShoppingBag className="h-5 w-5" />
                 {cartCount > 0 && (
                   <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white ring-2 ring-white">
                     {cartCount}
                   </span>
                 )}
               </Link>

               {user ? (
                <Link to="/profile" className="flex items-center gap-2 group pl-1 sm:pl-4 sm:border-l border-slate-200">
                   <div className="h-8 w-8 bg-green-50 text-green-700 rounded-full flex items-center justify-center text-sm font-bold border border-green-100 group-hover:bg-green-100 transition-colors shrink-0">
                     {user.username?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                   </div>
                </Link>
               ) : (
                 <div className="flex items-center gap-2">
                   <Link to="/login" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-green-700">
                     Login
                   </Link>
                   <Link to="/register">
                     <button className="text-xs sm:text-sm px-3 sm:px-5 py-2 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-full transition-colors whitespace-nowrap">
                       <span className="sm:hidden">Join</span>
                       <span className="hidden sm:inline">Get Started</span>
                     </button>
                   </Link>
                 </div>
               )}
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Search Bar (drops below header on mobile) */}
      {mobileSearchOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 px-4 pb-3 pt-2 shadow-md">
          <form onSubmit={handleSearch} className="relative" ref={mobileSearchRef}>
            <input
              type="text"
              autoFocus
              className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 placeholder:text-slate-400"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setMobileSearchOpen(false)}
              autoComplete="off"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-green-600">
              <Search className="h-4 w-4" />
            </button>
            <SuggestionDropdown />
          </form>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden print:hidden">
           <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
           <div className="fixed inset-y-0 left-0 w-[280px] bg-white shadow-xl p-6 flex flex-col gap-6 animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between">
                 <span className="text-xl font-serif font-bold text-slate-900">Divyaveda</span>
                 <button onClick={() => setIsMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                   <X className="h-5 w-5" />
                 </button>
              </div>
              
              <nav className="flex flex-col gap-4">
                 <Link to="/" className="text-lg font-medium text-slate-800 hover:text-green-700" onClick={() => setIsMenuOpen(false)}>Home</Link>
                 <Link to="/products" className="text-lg font-medium text-slate-800 hover:text-green-700" onClick={() => setIsMenuOpen(false)}>All Products</Link>
                 <hr className="border-slate-100" />
                 {navCategories.map(cat => (
                   <Link
                     key={cat._id}
                     to={`/products?category=${cat._id}`}
                     className="font-medium text-slate-600 hover:text-green-700 capitalize"
                     onClick={() => setIsMenuOpen(false)}
                   >
                     {cat.name}
                   </Link>
                 ))}
              </nav>

              <div className="mt-auto">
                 {user ? (
                   <div className="space-y-4">
                     <Link to="/profile" className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl" onClick={() => setIsMenuOpen(false)}>
                        <div className="h-10 w-10 bg-white text-green-700 rounded-full flex items-center justify-center text-lg font-bold shadow-sm">
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{user.username}</p>
                          <p className="text-xs text-slate-500">View Profile</p>
                        </div>
                     </Link>
                     <Button 
                        variant="outline" 
                        className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100"
                        onClick={() => { logout(); setIsMenuOpen(false); }}
                     >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log Out
                     </Button>
                   </div>
                 ) : (
                   <div className="grid grid-cols-2 gap-3">
                      <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full">Login</Button>
                      </Link>
                      <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                        <Button className="w-full bg-green-700">Sign up</Button>
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






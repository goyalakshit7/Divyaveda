import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ShoppingBag, User, LogOut, Menu, Search, X } from 'lucide-react';
import Button from "./Button";
import Input from "./Input";
import { useState } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const cartCount = Array.isArray(cart) ? cart.reduce((t, item) => t + item.quantity, 0) : 0;

  const handleSearch = (e) => {
    e.preventDefault();
    if(searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-4">
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
                  <Link to="/products?category=immunity" className="hover:text-green-700 transition-colors">Immunity</Link>
                  <Link to="/products?category=skincare" className="hover:text-green-700 transition-colors">Skincare</Link>
               </nav>
               
               <form onSubmit={handleSearch} className="relative w-full max-w-sm">
                  <div className="relative">
                    <input 
                      type="text"
                      className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600 transition-all placeholder:text-slate-400"
                      placeholder="Search for products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-green-600">
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
               </form>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
               {/* Mobile Search Toggle (Optional - could be implemented) */}
               
               {user ? (
                <>
                  <Link to="/cart" className="relative p-2 text-slate-600 hover:text-green-700 transition-colors">
                    <ShoppingBag className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white ring-2 ring-white">
                        {cartCount}
                      </span>
                    )}
                  </Link>

                  <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-slate-200">
                     <Link to="/profile" className="flex items-center gap-2 group">
                        <div className="h-8 w-8 bg-green-50 text-green-700 rounded-full flex items-center justify-center text-sm font-bold border border-green-100 group-hover:bg-green-100 transition-colors">
                          {user.username?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                        </div>
                     </Link>
                  </div>
                </>
               ) : (
                 <div className="flex items-center gap-3">
                   <Link to="/login" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-green-700">
                     Login
                   </Link>
                   <Link to="/register">
                     <Button size="sm" className="bg-green-700 hover:bg-green-800 text-white rounded-full">
                       Get Started
                     </Button>
                   </Link>
                 </div>
               )}
            </div>
          </div>
        </div>
      </header>

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
                 <Link to="/products?category=immunity" className="font-medium text-slate-600 hover:text-green-700" onClick={() => setIsMenuOpen(false)}>Immunity</Link>
                 <Link to="/products?category=skincare" className="font-medium text-slate-600 hover:text-green-700" onClick={() => setIsMenuOpen(false)}>Skincare</Link>
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






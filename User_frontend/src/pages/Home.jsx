import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import Button from "../components/Button";
import { ChevronRight, Star, Shield, Truck, Award } from "lucide-react";

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories (public - no auth needed)
      // Using axios directly to skip auth interceptor
      const categoriesRes = await fetch("http://localhost:8000/api/categories");
      const categoriesData = await categoriesRes.json();
      setCategories((categoriesData?.categories || categoriesData || []).slice(0, 4));

      // Fetch subcategories (public - no auth needed)
      const subcategoriesRes = await fetch("http://localhost:8000/api/subcategories");
      const subcategoriesData = await subcategoriesRes.json();
      setSubcategories((subcategoriesData?.subcategories || subcategoriesData || []).slice(0, 4));

      // Fetch featured/new launch products (public - no auth needed)
      const productsRes = await fetch("http://localhost:8000/api/products?limit=8");
      const productsData = await productsRes.json();
      const allProducts = productsData?.products || productsData || [];
      setFeaturedProducts(allProducts.filter(p => p.is_new_launch).slice(0, 4));
      setBestSellers(allProducts.slice(0, 4));
      
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-green-900 via-emerald-800 to-green-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1200')] opacity-20 bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/95 to-emerald-900/95" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-2 bg-yellow-500 text-green-900 font-bold rounded-full mb-6 animate-pulse">
              🎉 UP TO 80% OFF
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
              Discover Traditional  
              <span className="block text-yellow-400">Ayurvedic Wellness</span>
            </h1>
            <p className="text-xl md:text-2xl text-green-50 mb-8">
              Pure, Natural & Effective Herbal Products
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products">
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold px-8 py-4 text-lg rounded-full shadow-2xl">
                  Shop Now
                </Button>
              </Link>
              <Link to="/products">
                <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-green-900 px-8 py-4 text-lg rounded-full">
                  Explore Products
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="relative bg-white/10 backdrop-blur-sm border-t border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3 text-white">
                <Shield className="h-8 w-8 text-yellow-400" />
                <div>
                  <p className="font-bold">100% Authentic</p>
                  <p className="text-sm text-green-100">Genuine Products</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-white">
                <Truck className="h-8 w-8 text-yellow-400" />
                <div>
                  <p className="font-bold">Free Shipping</p>
                  <p className="text-sm text-green-100">On orders ₹500+</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-white">
                <Award className="h-8 w-8 text-yellow-400" />
                <div>
                  <p className="font-bold">Premium Quality</p>
                  <p className="text-sm text-green-100">Certified Products</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-white">
                <Star className="h-8 w-8 text-yellow-400" />
                <div>
                  <p className="font-bold">3000+ Styles</p>
                  <p className="text-sm text-green-100">Wide Selection</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-3">
              TOP CATEGORIES
            </h2>
            <p className="text-slate-600">Explore our curated collection of wellness products</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/products?category=${category._id}`}
                className="group relative"
              >
                <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-gradient-to-br from-yellow-100 to-yellow-200 border-4 border-yellow-400 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                    <h3 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wide">
                      {category.name}
                    </h3>
                  </div>
                  <div className="absolute top-4 right-4 bg-yellow-400 text-green-900 px-3 py-1 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    VIEW ALL
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Subcategories Section */}
      {subcategories.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-green-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-3">
                SHOP BY OCCASION
              </h2>
              <p className="text-slate-600">Find the perfect products for every celebration</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {subcategories.map((subcategory) => (
                <Link
                  key={subcategory._id}
                  to={`/products?subcategory=${subcategory._id}`}
                  className="group relative"
                >
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 to-emerald-800/90 group-hover:from-green-800/90 group-hover:to-emerald-700/90 transition-all duration-300" />
                    <div className="relative h-full flex items-center justify-center p-6">
                      <div className="text-center">
                        <div className="inline-block p-4 bg-yellow-500 rounded-full mb-4">
                          <span className="text-3xl">✨</span>
                        </div>
                        <h3 className="text-xl font-bold text-white uppercase">
                          {subcategory.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products - New Launches */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-2">
                  TRENDING NOW
                </h2>
                <p className="text-slate-600">Discover our latest arrivals</p>
              </div>
              <Link to="/products?new=true">
                <Button variant="outline" className="border-green-700 text-green-700 hover:bg-green-700 hover:text-white">
                  View All <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Secondary Banner */}
      <section className="py-16 bg-gradient-to-r from-emerald-900 via-green-800 to-emerald-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-3xl p-8 md:p-16 text-center backdrop-blur-sm border-2 border-yellow-400">
            <div className="max-w-3xl mx-auto">
              <div className="inline-block px-6 py-2 bg-yellow-500 text-green-900 font-bold rounded-full mb-6 text-lg">
                💝 SPECIAL OFFER
              </div>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">
                Ayurvedic Gold Collection
              </h2>
              <p className="text-xl text-green-50 mb-8">
                Starting at ₹599/- • Premium Quality • Limited Stock
              </p>
              <Link to="/products">
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold px-10 py-4 text-lg rounded-full shadow-2xl">
                  SHOP NOW
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-block px-4 py-2 bg-yellow-100 text-yellow-800 font-bold rounded-full mb-4">
                ⭐ CUSTOMER FAVORITES
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-3">
                BEST SELLERS
              </h2>
              <p className="text-slate-600">Most loved products by our customers</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {bestSellers.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            <div className="text-center">
              <Link to="/products">
                <Button className="bg-green-700 hover:bg-green-800 text-white px-12 py-4 text-lg rounded-full shadow-xl">
                  VIEW ALL PRODUCTS
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* About Us Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 via-emerald-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-block px-4 py-2 bg-green-100 text-green-800 font-bold rounded-full mb-6">
                About Divyaveda
              </div>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 mb-6">
                Your Trusted Partner in
                <span className="block text-green-700">Ayurvedic Wellness</span>
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                At Divyaveda, we bring you the finest collection of authentic Ayurvedic products, carefully crafted using ancient wisdom and modern science. Our mission is to make traditional wellness accessible to everyone.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield className="h-6 w-6 text-green-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">100% Authentic Products</h4>
                    <p className="text-slate-600">All our products are certified and sourced from trusted manufacturers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Award className="h-6 w-6 text-green-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Premium Quality Standards</h4>
                    <p className="text-slate-600">Every product undergoes strict quality checks before delivery</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Star className="h-6 w-6 text-green-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">10,000+ Happy Customers</h4>
                    <p className="text-slate-600">Join thousands who trust us for their wellness journey</p>
                  </div>
                </div>
              </div>
              <Link to="/about">
                <Button className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-full">
                  Learn More About Us
                </Button>
              </Link>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-400 rounded-3xl transform rotate-3" />
                <img
                  src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&h=700&fit=crop"
                  alt="Ayurvedic Products"
                  className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gradient-to-r from-green-900 via-emerald-800 to-green-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Start Your Wellness Journey
          </h2>
          <p className="text-green-50 text-lg mb-8">
            Subscribe to get special offers, free giveaways, and exclusive deals
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-full focus:outline-none focus:ring-4 focus:ring-yellow-400"
            />
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold px-8 py-4 rounded-full whitespace-nowrap">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
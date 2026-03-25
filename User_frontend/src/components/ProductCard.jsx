import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Plus, Star } from "lucide-react";
import { useState } from "react";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  
  const image = product.main_image || product.productImages?.[0] || "https://placehold.co/400x400?text=No+Image";

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    await addToCart(product._id, 1, product);
    setIsAdding(false);
  };

  const isOutOfStock = product.stock_quantity === 0;

  // Mock rating since backend doesn't seem to provide it directly based on previous schema
  const rating = product.rating || 4.8;
  const reviews = product.reviews || Math.floor(Math.random() * 500) + 50;

  return (
    <div className="group relative bg-white border border-slate-100 rounded-3xl overflow-hidden hover:border-primary/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 flex flex-col h-full transform hover:-translate-y-1">
      <div className="aspect-[4/5] w-full overflow-hidden bg-slate-50 relative">
        {/* New Launch Badge */}
        {product.is_new_launch && (
          <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-secondary text-secondary-foreground text-xs font-black tracking-wider rounded-full shadow-sm">
            NEW
          </div>
        )}

        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-destructive text-destructive-foreground text-xs font-black tracking-wider rounded-full shadow-sm">
            SOLD OUT
          </div>
        )}

        <Link to={`/product/${product._id}`}>
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />
          <img
            src={image}
            alt={product.name || product.title}
            className="h-full w-full object-cover object-center scale-100 group-hover:scale-110 transition-transform duration-700 ease-in-out"
          />
        </Link>

        {/* Quick add button — visible for all users if in stock */}
        {!isOutOfStock && (
          <button
            onClick={handleQuickAdd}
            disabled={isAdding}
            className="absolute bottom-4 right-4 h-12 w-12 bg-white/90 backdrop-blur-md text-primary rounded-full flex items-center justify-center shadow-lg translate-y-16 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:text-white disabled:opacity-50 z-20"
            aria-label="Quick Add to Cart"
          >
            {isAdding ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Plus className="h-6 w-6" />
            )}
          </button>
        )}
      </div>
      
      <div className="flex flex-1 flex-col p-5 bg-white relative z-20">
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
          <span className="text-xs font-bold text-slate-700">{rating}</span>
          <span className="text-xs text-slate-400">({reviews})</span>
        </div>
        
        <h3 className="text-[15px] font-serif font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          <Link to={`/product/${product._id}`}>
            <span aria-hidden="true" className="absolute inset-0 z-0" />
            {product.name || product.title}
          </Link>
        </h3>
        
        {product.description && (
          <p className="text-xs text-slate-500 mb-4 flex-1 line-clamp-2 leading-relaxed">{product.description}</p>
        )}
        
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="text-lg font-black text-primary">
              ₹{product.diplayPrice || product.price} 
            </p>
            {product.mrp && product.mrp > (product.diplayPrice || product.price) && (
              <>
                <span className="text-xs text-slate-400 line-through font-medium">₹{product.mrp}</span>
                <span className="text-[10px] font-black px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                  {Math.round(((product.mrp - (product.diplayPrice || product.price)) / product.mrp) * 100)}% OFF
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

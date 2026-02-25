import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Plus } from "lucide-react";
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

  return (
    <div className="group relative bg-white border border-slate-100 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <div className="aspect-[4/5] w-full overflow-hidden bg-slate-50 relative">
        {/* New Launch Badge */}
        {product.is_new_launch && (
          <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
            NEW
          </div>
        )}

        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <div className="absolute top-3 right-3 z-10 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
            OUT OF STOCK
          </div>
        )}

        <Link to={`/product/${product._id}`}>
          <img
            src={image}
            alt={product.name || product.title}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Quick add button — visible for all users if in stock */}
        {!isOutOfStock && (
          <button
            onClick={handleQuickAdd}
            disabled={isAdding}
            className="absolute bottom-3 right-3 h-10 w-10 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-green-700 disabled:opacity-50"
          >
            {isAdding ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-serif font-bold text-slate-900 mb-1 line-clamp-1">
          <Link to={`/product/${product._id}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {product.name || product.title}
          </Link>
        </h3>
        {product.description && (
          <p className="text-sm text-slate-500 mb-3 flex-1 line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <p className="text-lg font-bold text-slate-900">
            ₹{product.diplayPrice || product.price} 
            {product.mrp && product.mrp > (product.diplayPrice || product.price) && (
              <>
                <span className="text-sm text-slate-400 line-through ml-2 font-normal">₹{product.mrp}</span>
                <span className="ml-2 text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  {Math.round(((product.mrp - (product.diplayPrice || product.price)) / product.mrp) * 100)}% OFF
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

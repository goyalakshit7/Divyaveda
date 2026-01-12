import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Plus } from "lucide-react";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  
  // Choose first image or fallback
  const image = Array.isArray(product.productImages) && product.productImages.length > 0 
    ? product.productImages[0] 
    : "https://placehold.co/400x400?text=No+Image";

  return (
    <div className="group relative bg-white border border-slate-100 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <div className="aspect-[4/5] w-full overflow-hidden bg-slate-50 relative">
        <img
          src={image}
          alt={product.title}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        {/* Quick add button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            addToCart(product);
          }}
          className="absolute bottom-3 right-3 h-10 w-10 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-green-700"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-serif font-bold text-slate-900 mb-1 line-clamp-1">
          <Link to={`/product/${product._id}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {product.title || product.name}
          </Link>
        </h3>
        <p className="text-sm text-slate-500 mb-3 flex-1 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mt-auto">
          <p className="text-lg font-bold text-slate-900">
            ₹{product.diplayPrice || product.price} 
            {product.mrp && <span className="text-sm text-slate-400 line-through ml-2 font-normal">₹{product.mrp}</span>}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

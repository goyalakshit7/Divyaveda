import { useCart } from "../context/CartContext";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from "lucide-react";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      navigate("/login?redirect=/checkout");
      return;
    }
    navigate("/checkout");
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      // Handle cases where product_id might be null/populated object
      const price = item.product_id?.diplayPrice || item.product_id?.price || 0;
      return total + price * item.quantity;
    }, 0);
  };
  
  const total = calculateTotal();
  const shipping = total > 500 ? 0 : 50;

  if (!cart) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
    </div>
  );

  if (cart.length === 0)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 text-center px-4">
        <div className="h-24 w-24 bg-green-50 rounded-full flex items-center justify-center text-green-700 mb-2">
           <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-slate-900">Your cart is empty</h2>
        <p className="text-slate-500 max-w-sm">Looks like you haven't added anything to your cart yet.</p>
        <Button onClick={() => navigate("/")} size="lg" className="rounded-full px-8 bg-slate-900 text-white hover:bg-slate-800">
          Start Shopping
        </Button>
      </div>
    );

  return (
    <div className="pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <h1 className="text-3xl font-serif font-bold text-slate-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map(item => (
            <div
              key={item._id}
              className="group flex gap-4 sm:gap-6 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 transition hover:shadow-md"
            >
              <div className="shrink-0 w-24 h-24 sm:w-32 sm:h-32 bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                {item.product_id?.main_image ? (
                  <img
                    src={item.product_id.main_image}
                    alt={item.product_id.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                    No Image
                  </div>
                )}
              </div>
              
              <div className="flex flex-1 flex-col justify-between">
                <div>
                   <div className="flex justify-between items-start">
                      <Link to={`/product/${item.product_id?._id}`} className="text-lg font-bold text-slate-900 hover:text-green-700 transition-colors line-clamp-1 font-serif">
                        {item.product_id?.name || 'Unknown Product'}
                      </Link>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                   </div>
                   <div className="mt-1 text-slate-600 text-sm">
                      ₹{item.product_id?.diplayPrice || item.product_id?.price || 0}
                   </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50">
                    <button
                      className="p-2 text-slate-500 hover:text-slate-900 transition-colors"
                      onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-slate-900">{item.quantity}</span>
                    <button
                      className="p-2 text-slate-500 hover:text-slate-900 transition-colors"
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="text-base font-bold text-slate-900">
                    ₹{((item.product_id?.diplayPrice || item.product_id?.price || 0) * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
           <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="text-slate-900 font-medium">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    <span className="text-slate-900 font-medium">₹{shipping}</span>
                  )}
                </div>
                <div className="pt-4 border-t border-slate-200 flex justify-between text-lg font-bold text-slate-900">
                  <span>Total</span>
                  <span>₹{(total + shipping).toFixed(2)}</span>
                </div>
              </div>
              
              <Button onClick={handleCheckout} className="w-full py-4 text-base group bg-slate-900 text-white hover:bg-slate-800">
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              
              <p className="mt-4 text-xs text-center text-slate-500">
                Taxes calculated at checkout. Secure checkout powered by Stripe.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
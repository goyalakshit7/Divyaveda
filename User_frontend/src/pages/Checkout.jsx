import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/Input";
import { useCart } from "../context/CartContext";
import { useOrder } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";
import { CheckCircle2, ShieldCheck } from "lucide-react";

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { createOrder } = useOrder();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    phone: user?.phone_number || ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Calculate totals
  const subtotal = cart.reduce((total, item) => {
    const price = item.product_id?.diplayPrice || item.product_id?.price || 0;
    return total + price * item.quantity;
  }, 0);
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Prepare delivery address
    const deliveryAddress = `${formData.street}, ${formData.city}, ${formData.state} - ${formData.zipCode}, ${formData.country}`;
    
    // Create order
    const orderData = {
      delivery_address: deliveryAddress,
      phone_number: formData.phone,
      total_amount: total
    };

    const order = await createOrder(orderData);
    
    if (order) {
      // Clear cart after successful order
      await clearCart();
      setIsSuccess(true);
      
      // Redirect to orders page after 2 seconds
      setTimeout(() => {
        navigate("/orders");
      }, 2000);
    } else {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 px-4">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div>
           <h2 className="text-3xl font-serif font-bold text-slate-900">Order Confirmed!</h2>
           <p className="text-slate-500 mt-2">Thank you for your purchase. You'll receive an email shortly.</p>
           <p className="text-sm text-slate-400 mt-2">Redirecting to orders...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 px-4">
        <h2 className="text-3xl font-serif font-bold text-slate-900">Your cart is empty</h2>
        <p className="text-slate-500">Add some products before checking out.</p>
        <Button onClick={() => navigate("/products")} className="bg-slate-900 text-white hover:bg-slate-800">
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <h1 className="text-3xl font-serif font-bold text-slate-900 mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
           <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 font-serif">Shipping Information</h2>
                <ShieldCheck className="h-5 w-5 text-green-600" />
             </div>
             
             <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
               <Input
                 label="Street Address"
                 name="street"
                 value={formData.street}
                 onChange={handleChange}
                 required
                 placeholder="123 Main Street"
               />
               <div className="grid grid-cols-2 gap-4">
                 <Input
                   label="City"
                   name="city"
                   value={formData.city}
                   onChange={handleChange}
                   required
                   placeholder="Mumbai"
                 />
                 <Input
                   label="State"
                   name="state"
                   value={formData.state}
                   onChange={handleChange}
                   required
                   placeholder="Maharashtra"
                 />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <Input
                   label="Postal Code"
                   name="zipCode"
                   value={formData.zipCode}
                   onChange={handleChange}
                   required
                   placeholder="400001"
                 />
                 <Input
                   label="Phone Number"
                   name="phone"
                   type="tel"
                   value={formData.phone}
                   onChange={handleChange}
                   required
                   placeholder="+91 98765 43210"
                 />
               </div>
               <Input
                 label="Country"
                 name="country"
                 value={formData.country}
                 onChange={handleChange}
                 disabled
                 className="opacity-60 cursor-not-allowed bg-slate-50"
               />
             </form>
           </section>
           
           <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4 font-serif">Payment Method</h2>
              <div className="p-4 border border-blue-100 bg-blue-50 rounded-xl text-blue-800 text-sm font-medium">
                Cash on Delivery (COD)
              </div>
              <p className="text-xs text-slate-500 mt-2">Pay when you receive your order</p>
           </section>
        </div>
        
        <div className="space-y-6">
           <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sticky top-24">
             <h3 className="text-lg font-bold text-slate-900 mb-4 font-serif">Order Summary</h3>
             <div className="space-y-3 max-h-60 overflow-y-auto mb-6 pr-2">
                {cart.map(item => (
                   <div key={item._id} className="flex gap-3 text-sm">
                     <div className="h-10 w-10 bg-white rounded-md overflow-hidden shrink-0 border border-slate-200">
                       <img 
                         src={item.product_id?.main_image || "https://placehold.co/100"} 
                         alt="" 
                         className="h-full w-full object-cover" 
                       />
                     </div>
                     <div className="flex-1">
                        <div className="text-slate-900 font-medium line-clamp-1">{item.product_id?.name}</div>
                        <div className="text-slate-500">Qty {item.quantity}</div>
                     </div>
                     <div className="text-slate-900 font-bold">
                       ₹{((item.product_id?.diplayPrice || item.product_id?.price || 0) * item.quantity).toFixed(2)}
                     </div>
                   </div>
                ))}
             </div>
             
             <div className="space-y-3 border-t border-slate-200 pt-4 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                </div>
                {shipping === 0 && (
                  <p className="text-xs text-green-600">🎉 You've qualified for free shipping!</p>
                )}
                <div className="flex justify-between text-slate-900 font-bold text-lg pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
             </div>
             
             <Button 
               form="checkout-form"
               type="submit" 
               className="w-full mt-6 py-4 text-base bg-slate-900 text-white hover:bg-slate-800"
               isLoading={isProcessing}
             >
               Place Order
             </Button>
             
             <p className="text-xs text-center text-slate-500 mt-4">
               By placing your order, you agree to our terms and conditions
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

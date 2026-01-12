import { useState } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import { CheckCircle2, ShieldCheck } from "lucide-react";

const Checkout = () => {
  const { cart } = useCart();
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Calculate totals
  const subtotal = cart.reduce((total, item) => {
    return total + (item.product_id?.price || 0) * item.quantity;
  }, 0);
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      toast.success("Order placed successfully!");
      // Ideally call clearCart here
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div>
           <h2 className="text-3xl font-serif font-bold text-slate-900">Order Confirmed!</h2>
           <p className="text-slate-500 mt-2">Thank you for your purchase. You'll receive an email shortly.</p>
        </div>
        <Button onClick={() => window.location.href = '/'} className="bg-slate-900 text-white hover:bg-slate-800">Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="pb-12 max-w-5xl mx-auto pt-8">
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
               />
               <div className="grid grid-cols-2 gap-4">
                 <Input
                   label="City"
                   name="city"
                   value={formData.city}
                   onChange={handleChange}
                   required
                 />
                 <Input
                   label="Postal Code"
                   name="zipCode"
                   value={formData.zipCode}
                   onChange={handleChange}
                   required
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
                Cash on Delivery (Standard)
              </div>
           </section>
        </div>
        
        <div className="space-y-6">
           <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sticky top-24">
             <h3 className="text-lg font-bold text-slate-900 mb-4 font-serif">Order Summary</h3>
             <div className="space-y-3 max-h-60 overflow-y-auto mb-6 pr-2 custom-scrollbar">
                {cart.map(item => (
                   <div key={item._id} className="flex gap-3 text-sm">
                     <div className="h-10 w-10 bg-white rounded-md overflow-hidden shrink-0 border border-slate-200">
                       <img src={item.product_id?.main_image || "https://placehold.co/100"} alt="" className="h-full w-full object-cover" />
                     </div>
                     <div className="flex-1">
                        <div className="text-slate-900 font-medium line-clamp-1">{item.product_id?.name}</div>
                        <div className="text-slate-500">Qty {item.quantity}</div>
                     </div>
                     <div className="text-slate-900 font-bold">₹{((item.product_id?.price || 0) * item.quantity).toFixed(2)}</div>
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
                <div className="flex justify-between text-slate-900 font-bold text-lg pt-2">
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
           </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

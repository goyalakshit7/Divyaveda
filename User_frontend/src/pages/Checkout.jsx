import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useOrder } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";
import { useAddress } from "../context/AddressContext";
import { CheckCircle2, MapPin, Plus, ChevronRight, ShieldCheck, Truck } from "lucide-react";
import { toast } from "react-toastify";

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { createOrder } = useOrder();
  const { user } = useAuth();
  const { addresses, fetchAddresses } = useAddress();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = address, 2 = review
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useManualForm, setUseManualForm] = useState(false);
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [manualForm, setManualForm] = useState({
    name: user?.name || "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    phone: user?.phone_number || "",
  });

  // Auto-select default address or first address
  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find(a => a.is_default) || addresses[0];
      setSelectedAddressId(def._id);
      setUseManualForm(false);
    }
    if (addresses.length === 0) {
      setUseManualForm(true);
    }
  }, [addresses]);

  const subtotal = cart.reduce((total, item) => {
    const price = item.product_id?.diplayPrice || item.product_id?.price || 0;
    return total + price * item.quantity;
  }, 0);
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  const getDeliveryAddress = () => {
    if (!useManualForm && selectedAddressId) {
      const addr = addresses.find(a => a._id === selectedAddressId);
      if (addr) {
        return {
          text: `${addr.address_line1}${addr.address_line2 ? ", " + addr.address_line2 : ""}, ${addr.city}, ${addr.state} - ${addr.pincode}, ${addr.country || "India"}`,
          phone: addr.phone_number || manualForm.phone
        };
      }
    }
    return {
      text: `${manualForm.street}, ${manualForm.city}, ${manualForm.state} - ${manualForm.zipCode}, ${manualForm.country}`,
      phone: manualForm.phone
    };
  };

  const validateStep1 = () => {
    if (!useManualForm && selectedAddressId) return true;
    if (useManualForm) {
      if (!manualForm.street || !manualForm.city || !manualForm.state || !manualForm.zipCode || !manualForm.phone) {
        toast.error("Please fill in all address fields");
        return false;
      }
      if (!/^\d{10}$/.test(manualForm.phone)) {
        toast.error("Please enter a valid 10-digit phone number");
        return false;
      }
      if (!/^\d{6}$/.test(manualForm.zipCode)) {
        toast.error("Please enter a valid 6-digit PIN code");
        return false;
      }
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      const { text: deliveryAddress, phone: phoneNumber } = getDeliveryAddress();
      const items = cart.map(item => ({
        product_id: item.product_id?._id,
        name: item.product_id?.name || "Unknown Product",
        price: item.product_id?.diplayPrice || item.product_id?.price || 0,
        quantity: item.quantity,
        image: item.product_id?.main_image || item.product_id?.productImages?.[0],
      }));

      const orderData = {
        items,
        subtotal,
        shipping_fee: shipping,
        discount: 0,
        delivery_address: deliveryAddress,
        phone_number: phoneNumber,
        payment_method: "COD",
        notes,
      };

      const result = await createOrder(orderData);
      if (result) {
        await clearCart();
        setIsSuccess(true);
        setTimeout(() => navigate("/orders"), 3000);
      } else {
        setIsProcessing(false);
      }
    } catch (err) {
      toast.error("Failed to place order. Please try again.");
      setIsProcessing(false);
    }
  };

  // ── SUCCESS SCREEN ────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-6 px-4">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-lg">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Order Confirmed! 🎉</h2>
          <p className="text-slate-500 mt-2">Thank you for shopping with Divyaveda.</p>
          <p className="text-slate-400 text-sm mt-1">A confirmation email has been sent to you.</p>
          <p className="text-slate-400 text-sm mt-1">Redirecting to your orders...</p>
        </div>
        <Link to="/orders" className="px-6 py-2 bg-green-600 text-white rounded-full text-sm font-semibold hover:bg-green-700 transition">
          View My Orders
        </Link>
      </div>
    );
  }

  // ── EMPTY CART ────────────────────────────────────────────────────────
  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4 px-4">
        <div className="text-6xl">🛒</div>
        <h2 className="text-2xl font-bold text-slate-900">Your cart is empty</h2>
        <Link to="/products" className="px-6 py-2 bg-green-700 text-white rounded-full text-sm font-semibold hover:bg-green-800 transition">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/cart" className="hover:text-green-700">Cart</Link>
        <ChevronRight className="w-4 h-4" />
        <span className={step === 1 ? "text-green-700 font-semibold" : ""}>Delivery</span>
        <ChevronRight className="w-4 h-4" />
        <span className={step === 2 ? "text-green-700 font-semibold" : "text-slate-400"}>Review</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Main Steps */}
        <div className="lg:col-span-2 space-y-6">

          {/* ── STEP 1: DELIVERY ADDRESS ─────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 p-5 border-b border-slate-100">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? "bg-green-600 text-white" : "bg-slate-200 text-slate-600"}`}>1</div>
              <h2 className="text-base font-bold text-slate-900">Delivery Address</h2>
              {step > 1 && (
                <button onClick={() => setStep(1)} className="ml-auto text-xs text-green-700 font-semibold hover:underline">Edit</button>
              )}
            </div>
            {step === 1 && (
              <div className="p-5 space-y-4">
                {/* Saved Addresses */}
                {addresses.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-700">Choose Saved Address</p>
                    {addresses.map(addr => (
                      <label
                        key={addr._id}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${selectedAddressId === addr._id && !useManualForm ? "border-green-600 bg-green-50" : "border-slate-200 hover:border-slate-300"}`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === addr._id && !useManualForm}
                          onChange={() => { setSelectedAddressId(addr._id); setUseManualForm(false); }}
                          className="mt-1 accent-green-600"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-sm font-semibold text-slate-800">{addr.label || addr.address_line1}</span>
                            {addr.is_default && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Default</span>}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 pl-6">
                            {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ""}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          {addr.phone_number && <p className="text-xs text-slate-500 pl-6">📞 {addr.phone_number}</p>}
                        </div>
                      </label>
                    ))}
                    <button
                      onClick={() => { setUseManualForm(true); setSelectedAddressId(null); }}
                      className={`w-full flex items-center gap-2 p-4 rounded-xl border-2 border-dashed transition text-sm font-medium ${useManualForm ? "border-green-600 text-green-700 bg-green-50" : "border-slate-300 text-slate-500 hover:border-green-400"}`}
                    >
                      <Plus className="w-4 h-4" />
                      Use a different address
                    </button>
                  </div>
                )}

                {/* Manual Form */}
                {(useManualForm || addresses.length === 0) && (
                  <div className="space-y-3 pt-2">
                    {addresses.length > 0 && <p className="text-sm font-semibold text-slate-700">Enter New Address</p>}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="text-xs text-slate-500 mb-1 block">Full Name</label>
                        <input name="name" value={manualForm.name} onChange={e => setManualForm(f => ({...f, name: e.target.value}))} placeholder="Full Name" className={inputClass} />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-slate-500 mb-1 block">Street Address</label>
                        <input name="street" value={manualForm.street} onChange={e => setManualForm(f => ({...f, street: e.target.value}))} placeholder="Building, Street, Area" className={inputClass} required />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">City</label>
                        <input name="city" value={manualForm.city} onChange={e => setManualForm(f => ({...f, city: e.target.value}))} placeholder="City" className={inputClass} required />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">State</label>
                        <input name="state" value={manualForm.state} onChange={e => setManualForm(f => ({...f, state: e.target.value}))} placeholder="State" className={inputClass} required />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">PIN Code</label>
                        <input name="zipCode" value={manualForm.zipCode} onChange={e => setManualForm(f => ({...f, zipCode: e.target.value}))} placeholder="6-digit PIN" maxLength={6} className={inputClass} required />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Phone Number</label>
                        <input name="phone" value={manualForm.phone} onChange={e => setManualForm(f => ({...f, phone: e.target.value}))} placeholder="10-digit mobile" maxLength={10} className={inputClass} required />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => { if (validateStep1()) setStep(2); }}
                  className="w-full py-3 bg-green-700 text-white rounded-xl font-semibold text-sm hover:bg-green-800 transition flex items-center justify-center gap-2"
                >
                  Continue to Review <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 1 Summary (when on step 2) */}
            {step === 2 && (
              <div className="px-5 py-3 bg-slate-50 text-sm text-slate-600">
                <MapPin className="w-4 h-4 inline mr-1 text-green-600" />
                {getDeliveryAddress().text}
              </div>
            )}
          </div>

          {/* ── STEP 2: REVIEW & CONFIRM ──────────────────────────────── */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 p-5 border-b border-slate-100">
                <div className="w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">2</div>
                <h2 className="text-base font-bold text-slate-900">Review Order</h2>
              </div>
              <div className="p-5 space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {cart.map((item, i) => {
                    const price = item.product_id?.diplayPrice || item.product_id?.price || 0;
                    return (
                      <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                          {(item.product_id?.main_image || item.product_id?.productImages?.[0]) && (
                            <img
                              src={item.product_id?.main_image || item.product_id?.productImages?.[0]}
                              alt={item.product_id?.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{item.product_id?.name}</p>
                          <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-slate-900">₹{(price * item.quantity).toFixed(2)}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="text-xs text-slate-500 font-semibold block mb-1">Special Instructions (optional)</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Any special instructions for delivery..."
                    rows={2}
                    className={inputClass + " resize-none"}
                  />
                </div>

                {/* Payment Method */}
                <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">₹</div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Cash on Delivery</p>
                    <p className="text-xs text-slate-500">Pay when your order arrives</p>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-full py-3 bg-green-700 text-white rounded-xl font-bold text-sm hover:bg-green-800 disabled:opacity-60 transition"
                >
                  {isProcessing ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Order Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sticky top-24">
            <h3 className="font-bold text-slate-900 mb-4">Order Summary</h3>
            <div className="space-y-2 mb-4">
              {cart.slice(0, 3).map((item, i) => {
                const price = item.product_id?.diplayPrice || item.product_id?.price || 0;
                return (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-slate-600 truncate max-w-[180px]">{item.product_id?.name} ×{item.quantity}</span>
                    <span className="font-medium text-slate-800">₹{(price * item.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
              {cart.length > 3 && <p className="text-xs text-slate-400">+{cart.length - 3} more items</p>}
            </div>
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Shipping</span>
                <span className={shipping === 0 ? "text-green-600 font-semibold" : ""}>
                  {shipping === 0 ? "Free" : `₹${shipping}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-slate-100 pt-2 mt-2">
                <span>Total</span>
                <span className="text-green-700">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span>100% Secure Checkout</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>{shipping === 0 ? "Free delivery on this order" : "₹50 delivery charge"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

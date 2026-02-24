import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useOrder } from "../context/OrderContext";
import api from "../api/axios";
import Button from "../components/Button";
import {
  Package, Truck, CheckCircle2, XCircle, Clock, ChevronRight,
  MapPin, Phone, CreditCard, Calendar, AlertCircle
} from "lucide-react";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.order);
    } catch (error) {
      console.error("Failed to fetch order", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert("Please provide a reason for cancellation");
      return;
    }
    try {
      setCanceling(true);
      await api.put(`/orders/${id}/cancel`, { reason: cancelReason });
      setCancelModal(false);
      setCancelReason("");
      await fetchOrderDetail();
    } catch (error) {
      console.error("Failed to cancel order", error);
      alert(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setCanceling(false);
    }
  };

  const getStatusSteps = () => {
    const allSteps = [
      { status: "PLACED", label: "Order Placed", icon: CheckCircle2 },
      { status: "PAID", label: "Payment Confirmed", icon: CreditCard },
      { status: "PROCESSING", label: "Processing", icon: Package },
      { status: "SHIPPED", label: "Shipped", icon: Truck },
      { status: "DELIVERED", label: "Delivered", icon: CheckCircle2 }
    ];

    if (order?.status === "CANCELLED") {
      return [
        { status: "PLACED", label: "Order Placed", icon: CheckCircle2 },
        { status: "CANCELLED", label: "Cancelled", icon: XCircle }
      ];
    }

    const currentIndex = allSteps.findIndex(step => step.status === order?.status);
    return allSteps.map((step, idx) => ({
      ...step,
      completed: idx <= currentIndex,
      current: idx === currentIndex
    }));
  };

  const canCancelOrder = () => {
    return order && !["SHIPPED", "DELIVERED", "CANCELLED"].includes(order.status);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mx-auto" />
          <p className="text-slate-600 mt-4">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <Package size={64} className="text-slate-300" />
        <h2 className="text-2xl font-bold text-slate-900">Order not found</h2>
        <p className="text-slate-500">This order doesn't exist or you don't have access to it.</p>
        <Button onClick={() => navigate("/orders")}>View All Orders</Button>
      </div>
    );
  }

  const statusSteps = getStatusSteps();

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-600 mb-6 flex-wrap">
          <Link to="/" className="hover:text-emerald-700 transition">Home</Link>
          <ChevronRight size={16} className="text-slate-400" />
          <Link to="/orders" className="hover:text-emerald-700 transition">My Orders</Link>
          <ChevronRight size={16} className="text-slate-400" />
          <span className="text-slate-900 font-medium">Order #{order._id?.slice(-8).toUpperCase()}</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Order #{order._id?.slice(-8).toUpperCase()}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>Placed on {new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric"
                  })}</span>
                </div>
                {order.estimated_delivery && (
                  <div className="flex items-center gap-1 text-emerald-600">
                    <Truck size={16} />
                    <span>Est. delivery: {new Date(order.estimated_delivery).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short"
                    })}</span>
                  </div>
                )}
              </div>
            </div>
            
            {canCancelOrder() && (
              <button
                onClick={() => setCancelModal(true)}
                className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 text-sm font-semibold transition"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Order Status Timeline */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Order Status</h2>
          
          <div className="relative">
            {statusSteps.map((step, idx) => {
              const Icon = step.icon;
              const isLast = idx === statusSteps.length - 1;
              
              return (
                <div key={step.status} className="relative flex gap-4 pb-8 last:pb-0">
                  {/* Vertical Line */}
                  {!isLast && (
                    <div className={`absolute left-5 top-11 w-0.5 h-full ${
                      step.completed ? "bg-emerald-600" : "bg-slate-200"
                    }`} />
                  )}
                  
                  {/* Icon */}
                  <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step.current
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200"
                      : step.completed
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : step.status === "CANCELLED"
                      ? "bg-red-600 border-red-600 text-white"
                      : "bg-white border-slate-200 text-slate-400"
                  }`}>
                    <Icon size={20} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <h3 className={`font-semibold ${
                      step.current ? "text-emerald-700" : 
                      step.completed ? "text-slate-900" : 
                      step.status === "CANCELLED" ? "text-red-700" : 
                      "text-slate-400"
                    }`}>
                      {step.label}
                    </h3>
                    {step.current && (
                      <p className="text-sm text-slate-600 mt-1">This is the current status of your order</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tracking Number */}
          {order.tracking_number && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Truck size={20} className="text-blue-700 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Tracking Number</h4>
                  <p className="text-blue-700 font-mono text-sm mt-1">{order.tracking_number}</p>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Agent */}
          {order.assigned_agent?.name && (
            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">🧑‍💼 Your Delivery Agent</h4>
              <p className="text-purple-800 font-semibold">{order.assigned_agent.name}</p>
              {order.assigned_agent.phone && (
                <p className="text-sm text-purple-700 mt-1">📞 {order.assigned_agent.phone}</p>
              )}
              {order.assigned_agent.email && (
                <p className="text-sm text-purple-700 mt-0.5">✉️ {order.assigned_agent.email}</p>
              )}
            </div>
          )}

          {/* Status History */}
          {order.status_history?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Order Activity</h3>
              <div className="space-y-2">
                {[...order.status_history].reverse().map((h, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-700">{h.status}</span>
                      <span className="text-slate-500 mx-1">·</span>
                      <span className="text-slate-500">{new Date(h.changed_at).toLocaleString("en-IN")}</span>
                      {h.note && <p className="text-slate-500 italic text-xs mt-0.5">{h.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Order Items</h2>
          
          <div className="space-y-4">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={item.image || "https://placehold.co/200"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{item.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">Quantity: {item.quantity}</p>
                  <p className="text-sm font-medium text-slate-700 mt-1">₹{item.price.toFixed(2)} each</p>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-slate-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Delivery Address */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={20} className="text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">Delivery Address</h2>
            </div>
            <p className="text-slate-700 leading-relaxed">{order.delivery_address}</p>
            <div className="flex items-center gap-2 mt-3 text-slate-600">
              <Phone size={16} />
              <span className="text-sm">{order.phone_number}</span>
            </div>
          </div>

          {/* Payment & Price Summary */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={20} className="text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">Payment Summary</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{order.subtotal?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping Fee</span>
                <span>{order.shipping_fee === 0 ? "Free" : `₹${order.shipping_fee?.toFixed(2)}`}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-₹{order.discount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-slate-900 pt-3 border-t border-slate-200">
                <span>Total</span>
                <span>₹{order.total_amount?.toFixed(2)}</span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">Payment Method</p>
                <p className="font-semibold text-slate-900 mt-1">
                  {order.payment_method === "COD" ? "Cash on Delivery" : order.payment_method}
                </p>
                <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                  order.payment_status === "PAID" ? "bg-emerald-100 text-emerald-700" :
                  order.payment_status === "COD" ? "bg-blue-100 text-blue-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {order.payment_status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Notes */}
        {order.notes && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={20} className="text-slate-600" />
              <h2 className="text-lg font-bold text-slate-900">Order Notes</h2>
            </div>
            <p className="text-slate-700">{order.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <button onClick={() => navigate("/orders")} className="flex-1 md:flex-none px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition">
            ← Back to Orders
          </button>
          <button onClick={() => navigate("/products")} className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition">
            Continue Shopping
          </button>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Cancel Order</h3>
            <p className="text-slate-500 text-sm mb-4">Please tell us why you want to cancel this order.</p>
            <textarea
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="e.g., Ordered by mistake, found cheaper elsewhere..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setCancelModal(false); setCancelReason(""); }}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition"
              >
                Go Back
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={canceling}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition"
              >
                {canceling ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;

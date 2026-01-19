import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useOrder } from "../context/OrderContext";
import Button from "../components/Button";
import { Package, Truck, CheckCircle2, XCircle, Clock, ChevronRight } from "lucide-react";

const Orders = () => {
  const { orders, loading } = useOrder();
  const navigate = useNavigate();

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case "PLACED":
        return <Clock className="h-5 w-5" />;
      case "PAID":
        return <CheckCircle2 className="h-5 w-5" />;
      case "PROCESSING":
        return <Package className="h-5 w-5" />;
      case "SHIPPED":
        return <Truck className="h-5 w-5" />;
      case "DELIVERED":
        return <CheckCircle2 className="h-5 w-5" />;
      case "CANCELLED":
        return <XCircle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "PLACED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "PAID":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "SHIPPED":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "DELIVERED":
        return "bg-green-100 text-green-700 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 px-4">
        <div className="h-24 w-24 bg-green-50 rounded-full flex items-center justify-center text-green-700 mb-2">
          <Package className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-slate-900">No orders yet</h2>
        <p className="text-slate-500 max-w-sm">When you place an order, it will appear here.</p>
        <Button onClick={() => navigate("/")} size="lg" className="rounded-full px-8 bg-slate-900 text-white hover:bg-slate-800">
          Start Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <h1 className="text-3xl font-serif font-bold text-slate-900 mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
              <div>
                <p className="text-sm text-slate-500">Order #{order._id?.slice(-8).toUpperCase()}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Placed on {new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </p>
              </div>

              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="text-sm font-medium">{order.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-slate-900 mb-2">Delivery Address</h3>
                <p className="text-slate-600 text-sm">{order.delivery_address}</p>
                <p className="text-slate-500 text-xs mt-1">Phone: {order.phone_number}</p>
              </div>

              <div className="text-right">
                <p className="text-sm text-slate-500">Total Amount</p>
                <p className="text-2xl font-bold text-slate-900">₹{order.total_amount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;

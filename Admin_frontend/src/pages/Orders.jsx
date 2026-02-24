import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

const STATUS_COLORS = {
  PLACED:     "bg-blue-100 text-blue-800 border-blue-200",
  PAID:       "bg-emerald-100 text-emerald-800 border-emerald-200",
  PROCESSING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  SHIPPED:    "bg-purple-100 text-purple-800 border-purple-200",
  DELIVERED:  "bg-green-100 text-green-800 border-green-200",
  CANCELLED:  "bg-red-100 text-red-800 border-red-200",
};

const STATUS_OPTIONS = ["ALL", "PLACED", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
const WORKFLOW_STATUSES = ["PLACED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

const Badge = ({ status }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[status] || "bg-slate-100 text-slate-700"}`}>
    {status}
  </span>
);

// ─── Update Order Modal ────────────────────────────────────────────────
const UpdateModal = ({ order, onClose, onSave }) => {
  const [form, setForm] = useState({
    status: order.status,
    tracking_number: order.tracking_number || "",
    estimated_delivery: order.estimated_delivery
      ? new Date(order.estimated_delivery).toISOString().split("T")[0]
      : "",
    admin_notes: order.admin_notes || "",
    agent_name: order.assigned_agent?.name || "",
    agent_phone: order.assigned_agent?.phone || "",
    agent_email: order.assigned_agent?.email || "",
    note: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave(order._id, {
        status: form.status,
        tracking_number: form.tracking_number,
        estimated_delivery: form.estimated_delivery || undefined,
        admin_notes: form.admin_notes,
        assigned_agent: {
          name: form.agent_name,
          phone: form.agent_phone,
          email: form.agent_email,
        },
        note: form.note,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  const inp = "w-full px-3 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const lbl = "block text-xs font-semibold text-[var(--text-muted)] mb-1 uppercase tracking-wide";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 overflow-y-auto py-6 px-4">
      <div className="bg-[var(--bg-card)] rounded-2xl shadow-2xl w-full max-w-2xl my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-primary)]">
          <div>
            <h2 className="text-lg font-bold">Manage Order</h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">#{order._id.slice(-8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="text-2xl text-[var(--text-muted)] hover:text-[var(--text-primary)] leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Order summary */}
          <div className="bg-[var(--bg-primary)] rounded-xl p-4 border border-[var(--border-primary)]">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold">{order.user_id?.name || order.user_id?.email || "Unknown Customer"}</p>
                <p className="text-xs text-[var(--text-muted)]">{order.user_id?.email}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-blue-600">₹{order.total_amount?.toFixed(2)}</p>
                <p className="text-xs text-[var(--text-muted)]">{order.items?.length} item(s)</p>
              </div>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)] truncate max-w-xs">{item.name} × {item.quantity}</span>
                  <span className="font-medium ml-2">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2 pt-2 border-t border-[var(--border-primary)]">
              📍 {order.delivery_address} | 📞 {order.phone_number}
            </p>
          </div>

          {/* Status update */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Order Status *</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className={inp}
              >
                {WORKFLOW_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>Tracking Number</label>
              <input
                type="text"
                value={form.tracking_number}
                onChange={e => setForm(f => ({ ...f, tracking_number: e.target.value }))}
                placeholder="e.g. DL1234567890IN"
                className={inp}
              />
            </div>
          </div>

          <div>
            <label className={lbl}>Estimated Delivery Date</label>
            <input
              type="date"
              value={form.estimated_delivery}
              onChange={e => setForm(f => ({ ...f, estimated_delivery: e.target.value }))}
              className={inp}
            />
          </div>

          {/* Agent assignment */}
          <div className="border border-[var(--border-primary)] rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              🧑‍💼 Assign Delivery Agent
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={lbl}>Agent Name</label>
                <input
                  type="text"
                  value={form.agent_name}
                  onChange={e => setForm(f => ({ ...f, agent_name: e.target.value }))}
                  placeholder="Full Name"
                  className={inp}
                />
              </div>
              <div>
                <label className={lbl}>Agent Phone</label>
                <input
                  type="tel"
                  value={form.agent_phone}
                  onChange={e => setForm(f => ({ ...f, agent_phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className={inp}
                />
              </div>
              <div>
                <label className={lbl}>Agent Email</label>
                <input
                  type="email"
                  value={form.agent_email}
                  onChange={e => setForm(f => ({ ...f, agent_email: e.target.value }))}
                  placeholder="agent@example.com"
                  className={inp}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Admin Notes (internal)</label>
              <textarea
                value={form.admin_notes}
                onChange={e => setForm(f => ({ ...f, admin_notes: e.target.value }))}
                placeholder="Internal notes, not shown to customer..."
                rows={3}
                className={inp}
              />
            </div>
            <div>
              <label className={lbl}>Status Change Note</label>
              <textarea
                value={form.note}
                onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                placeholder="Reason for this status change..."
                rows={3}
                className={inp}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-[var(--border-primary)] text-sm hover:bg-[var(--hover-bg)] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Status History Modal ─────────────────────────────────────────────
const HistoryModal = ({ order, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
    <div className="bg-[var(--bg-card)] rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between p-5 border-b border-[var(--border-primary)]">
        <h2 className="font-bold">Status History</h2>
        <button onClick={onClose} className="text-2xl text-[var(--text-muted)] hover:text-[var(--text-primary)]">×</button>
      </div>
      <div className="p-5 space-y-3">
        {order.status_history?.length === 0 && <p className="text-[var(--text-muted)] text-sm">No history recorded.</p>}
        {[...(order.status_history || [])].reverse().map((h, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
              {i < (order.status_history?.length - 1) && <div className="w-0.5 flex-1 bg-[var(--border-primary)] my-1" />}
            </div>
            <div className="pb-3">
              <Badge status={h.status} />
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {new Date(h.changed_at).toLocaleString("en-IN")} · by {h.changed_by}
              </p>
              {h.note && <p className="text-xs mt-1 italic text-[var(--text-secondary)]">"{h.note}"</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Main Orders Page ─────────────────────────────────────────────────
const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [historyOrder, setHistoryOrder] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/admin/orders/stats");
      setStats(res.data);
    } catch (e) { /* silent */ }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 20,
        ...(statusFilter !== "ALL" && { status: statusFilter }),
        ...(search && { search }),
        ...(fromDate && { from: fromDate }),
        ...(toDate && { to: toDate }),
      });
      const res = await api.get(`/admin/orders?${params}`);
      setOrders(res.data.orders || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.pages || 1);
    } catch (e) {
      console.error("Failed to fetch orders", e);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search, fromDate, toDate]);

  // Initial load + polling every 30s for new orders
  useEffect(() => {
    fetchStats();
    fetchOrders();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats, fetchOrders]);

  const handleUpdateOrder = async (orderId, data) => {
    await api.put(`/admin/orders/${orderId}/status`, data);
    await fetchOrders();
    await fetchStats();
  };

  const statCards = [
    { label: "New Orders", value: stats.placed || 0, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", filter: "PLACED" },
    { label: "Processing", value: stats.processing || 0, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", filter: "PROCESSING" },
    { label: "Shipped", value: stats.shipped || 0, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", filter: "SHIPPED" },
    { label: "Delivered", value: stats.delivered || 0, color: "text-green-600", bg: "bg-green-50", border: "border-green-200", filter: "DELIVERED" },
    { label: "Cancelled", value: stats.cancelled || 0, color: "text-red-600", bg: "bg-red-50", border: "border-red-200", filter: "CANCELLED" },
  ];

  return (
    <div className="p-4 space-y-5 max-w-[1400px] mx-auto">
      
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order Management</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Manage customer orders, assign agents, and update statuses
            <span className="ml-2 text-xs bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-full px-2 py-0.5">
              Auto-refreshes every 30s
            </span>
          </p>
        </div>
        <button
          onClick={() => { fetchOrders(); fetchStats(); }}
          className="px-3 py-2 text-sm rounded-lg border border-[var(--border-primary)] hover:bg-[var(--hover-bg)] transition"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map(card => (
          <button
            key={card.filter}
            onClick={() => { setStatusFilter(card.filter); setPage(1); }}
            className={`p-4 rounded-xl border ${card.border} ${card.bg} text-left transition hover:shadow-md ${statusFilter === card.filter ? "ring-2 ring-offset-1 ring-blue-500" : ""}`}
          >
            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs font-semibold text-slate-600 mt-1">{card.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Search</label>
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Order ID, customer name, email, phone..."
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-sm focus:outline-none"
            >
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">From Date</label>
            <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-sm focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">To Date</label>
            <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-sm focus:outline-none" />
          </div>
          <button
            onClick={() => { setSearch(""); setStatusFilter("ALL"); setFromDate(""); setToDate(""); setPage(1); }}
            className="px-3 py-2 text-sm rounded-lg border border-[var(--border-primary)] hover:bg-[var(--hover-bg)] transition"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)]">
          <h2 className="font-semibold">Orders ({total})</h2>
          <span className="text-xs text-[var(--text-muted)]">Page {page} of {totalPages}</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            <p className="text-sm text-[var(--text-muted)]">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-[var(--text-muted)]">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-semibold">No orders found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--bg-primary)] text-[var(--text-muted)] text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left font-semibold">Order ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold">Items</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  <th className="px-4 py-3 text-center font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Agent</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {orders.map(order => (
                  <tr
                    key={order._id}
                    className={`hover:bg-[var(--hover-bg)] transition ${order.status === "PLACED" ? "bg-blue-500/5" : ""}`}
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-blue-600">
                      #{order._id.slice(-8).toUpperCase()}
                      {order.status === "PLACED" && (
                        <span className="ml-1 text-xs bg-blue-100 text-blue-700 rounded-full px-1.5 py-0.5 border border-blue-200">NEW</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.user_id?.name || "—"}</p>
                      <p className="text-xs text-[var(--text-muted)]">{order.user_id?.email}</p>
                      <p className="text-xs text-[var(--text-muted)]">{order.phone_number}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5 max-w-xs">
                        {order.items?.slice(0, 2).map((item, i) => (
                          <p key={i} className="text-xs text-[var(--text-secondary)] truncate">
                            {item.name} ×{item.quantity}
                          </p>
                        ))}
                        {order.items?.length > 2 && (
                          <p className="text-xs text-[var(--text-muted)]">+{order.items.length - 2} more</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-bold">₹{order.total_amount?.toFixed(2)}</p>
                      <p className="text-xs text-[var(--text-muted)]">{order.payment_method}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge status={order.status} />
                    </td>
                    <td className="px-4 py-3">
                      {order.assigned_agent?.name ? (
                        <div>
                          <p className="text-xs font-semibold">{order.assigned_agent.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{order.assigned_agent.phone}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--text-muted)] italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric"
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-2.5 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold transition"
                        >
                          Manage
                        </button>
                        {order.status_history?.length > 0 && (
                          <button
                            onClick={() => setHistoryOrder(order)}
                            className="px-2.5 py-1.5 text-xs rounded-lg border border-[var(--border-primary)] hover:bg-[var(--hover-bg)] transition"
                            title="View History"
                          >
                            📋
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-[var(--border-primary)]">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-[var(--border-primary)] disabled:opacity-40 hover:bg-[var(--hover-bg)] transition"
            >
              ← Prev
            </button>
            <span className="text-sm text-[var(--text-muted)]">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm rounded-lg border border-[var(--border-primary)] disabled:opacity-40 hover:bg-[var(--hover-bg)] transition"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedOrder && (
        <UpdateModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSave={handleUpdateOrder}
        />
      )}
      {historyOrder && (
        <HistoryModal
          order={historyOrder}
          onClose={() => setHistoryOrder(null)}
        />
      )}
    </div>
  );
};

export default AdminOrders;

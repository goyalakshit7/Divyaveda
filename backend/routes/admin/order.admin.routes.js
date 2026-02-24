import express from "express";
import { Order } from "../../models/order.master.js";
import { Product } from "../../models/product.master.js";
import { isAuthenticated } from "../../middleware/isAuthenticated.js";
import {
    sendOrderShippedEmail,
    sendOrderDeliveredEmail,
    sendOrderCancelledEmail
} from "../../utils/orderEmails.js";

const router = express.Router();

// All routes require authentication (admin uses same JWT)
router.use(isAuthenticated);

// GET /api/admin/orders/stats — counts per status (used for notification badge)
router.get("/stats", async (req, res) => {
    try {
        const [placed, processing, shipped, delivered, cancelled, paid] = await Promise.all([
            Order.countDocuments({ status: "PLACED" }),
            Order.countDocuments({ status: "PROCESSING" }),
            Order.countDocuments({ status: "SHIPPED" }),
            Order.countDocuments({ status: "DELIVERED" }),
            Order.countDocuments({ status: "CANCELLED" }),
            Order.countDocuments({ status: "PAID" })
        ]);

        res.json({
            placed, processing, shipped, delivered, cancelled, paid,
            total: placed + processing + shipped + delivered + cancelled + paid,
            newOrders: placed  // Badge shows unprocessed orders
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/admin/orders — list all orders with filters + search
router.get("/", async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20, from, to } = req.query;

        const filter = {};
        if (status && status !== "ALL") filter.status = status;
        if (from || to) {
            filter.created_at = {};
            if (from) filter.created_at.$gte = new Date(from);
            if (to) {
                const toDate = new Date(to);
                toDate.setHours(23, 59, 59, 999);
                filter.created_at.$lte = toDate;
            }
        }

        let orders = await Order.find(filter)
            .populate("user_id", "name email phone_number")
            .sort({ created_at: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        // In-app search by order ID or customer info
        if (search) {
            const lower = search.toLowerCase();
            orders = orders.filter(o =>
                o._id.toString().slice(-8).toLowerCase().includes(lower) ||
                o.user_id?.name?.toLowerCase().includes(lower) ||
                o.user_id?.email?.toLowerCase().includes(lower) ||
                o.phone_number?.includes(search)
            );
        }

        const total = await Order.countDocuments(filter);

        res.json({
            orders,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/admin/orders/:id — single order detail
router.get("/:id", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("user_id", "name email phone_number");

        if (!order) return res.status(404).json({ message: "Order not found" });

        res.json({ order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/admin/orders/:id/status — update status, assign agent, tracking
router.put("/:id/status", async (req, res) => {
    try {
        const {
            status,
            tracking_number,
            estimated_delivery,
            admin_notes,
            assigned_agent,
            note
        } = req.body;

        const order = await Order.findById(req.params.id)
            .populate("user_id", "name email");

        if (!order) return res.status(404).json({ message: "Order not found" });

        const previousStatus = order.status;

        // Apply updates
        if (status) order.status = status;
        if (tracking_number !== undefined) order.tracking_number = tracking_number;
        if (estimated_delivery) order.estimated_delivery = new Date(estimated_delivery);
        if (admin_notes !== undefined) order.admin_notes = admin_notes;
        if (assigned_agent) order.assigned_agent = assigned_agent;

        // Append to status history (audit trail)
        order.status_history.push({
            status: status || previousStatus,
            changed_by: req.user.email,
            changed_at: new Date(),
            note: note || ""
        });

        order.updated_by = req.user.email;
        await order.save();

        // Send email notification on status change
        const userEmail = order.user_id?.email;
        if (userEmail && status && status !== previousStatus) {
            if (status === "SHIPPED") {
                sendOrderShippedEmail(userEmail, order).catch(console.error);
            } else if (status === "DELIVERED") {
                sendOrderDeliveredEmail(userEmail, order).catch(console.error);
            } else if (status === "CANCELLED") {
                sendOrderCancelledEmail(userEmail, order).catch(console.error);
            }
        }

        // ── If admin cancels an order, restore stock ──────────────────────
        if (status === "CANCELLED" && previousStatus !== "CANCELLED") {
            const restoreOps = order.items
                .filter(i => i.product_id)
                .map(i => ({
                    updateOne: {
                        filter: { _id: i.product_id },
                        update: { $inc: { stock_quantity: i.quantity } }
                    }
                }));
            if (restoreOps.length > 0) {
                await Product.bulkWrite(restoreOps);
            }
        }

        res.json({ order, message: "Order updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;

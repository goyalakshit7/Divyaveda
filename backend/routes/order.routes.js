import express from "express";
import { Order } from "../models/order.master.js";
import { User } from "../models/user.master.js";
import { Product } from "../models/product.master.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { sendOrderConfirmationEmail, sendOrderCancelledEmail } from "../utils/orderEmails.js";

const router = express.Router();

// Get user's orders (requires authentication)
router.get("/", isAuthenticated, async (req, res) => {
    try {
        const { status } = req.query;
        const filter = { user_id: req.user.id };
        if (status) filter.status = status;

        const orders = await Order.find(filter).sort({ created_at: -1 });
        res.json({ orders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single order by ID
router.get("/:id", isAuthenticated, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user_id: req.user.id
        });

        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json({ order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new order
router.post("/", isAuthenticated, async (req, res) => {
    try {
        const { items, subtotal, shipping_fee, discount, delivery_address, phone_number, payment_method, notes } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Order must contain at least one item" });
        }
        if (!delivery_address || !phone_number) {
            return res.status(400).json({ message: "Delivery address and phone number are required" });
        }

        // ── Stock validation ──────────────────────────────────────────
        // Load current stock for all products in the order in one query
        const productIds = items.map(i => i.product_id).filter(Boolean);
        const products = await Product.find({ _id: { $in: productIds } }).select("name stock_quantity");
        const stockMap = {};
        products.forEach(p => { stockMap[p._id.toString()] = p; });

        for (const item of items) {
            const product = stockMap[item.product_id?.toString()];
            if (!product) continue; // skip if product_id not found (shouldn't happen)
            if (product.stock_quantity < item.quantity) {
                return res.status(400).json({
                    message: `"${product.name}" only has ${product.stock_quantity} unit(s) in stock. You requested ${item.quantity}.`
                });
            }
        }

        const total_amount = (subtotal || 0) + (shipping_fee || 0) - (discount || 0);
        const estimated_delivery = new Date();
        estimated_delivery.setDate(estimated_delivery.getDate() + 7);

        const order = await Order.create({
            user_id: req.user.id,
            items,
            subtotal,
            shipping_fee: shipping_fee || 0,
            discount: discount || 0,
            total_amount,
            delivery_address,
            phone_number,
            payment_method: payment_method || "COD",
            payment_status: payment_method === "COD" ? "COD" : "PENDING",
            estimated_delivery,
            notes,
            status_history: [{
                status: "PLACED",
                changed_by: "customer",
                changed_at: new Date(),
                note: "Order placed by customer"
            }]
        });

        // ── Deduct stock atomically ───────────────────────────────────
        const stockOps = items
            .filter(i => i.product_id)
            .map(i => ({
                updateOne: {
                    filter: { _id: i.product_id },
                    update: { $inc: { stock_quantity: -i.quantity } }
                }
            }));
        if (stockOps.length > 0) {
            await Product.bulkWrite(stockOps);
        }

        // Send confirmation email (non-blocking)
        const user = await User.findById(req.user.id).select("email");
        if (user?.email) {
            sendOrderConfirmationEmail(user.email, order).catch(console.error);
        }

        res.status(201).json({ order, message: "Order placed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Cancel order (by user)
router.put("/:id/cancel", isAuthenticated, async (req, res) => {
    try {
        const { reason } = req.body;

        const order = await Order.findOne({ _id: req.params.id, user_id: req.user.id });
        if (!order) return res.status(404).json({ message: "Order not found" });

        if (["SHIPPED", "DELIVERED", "CANCELLED"].includes(order.status)) {
            return res.status(400).json({ message: "Cannot cancel this order at this stage" });
        }

        order.status = "CANCELLED";
        order.cancel_reason = reason || "Cancelled by customer";
        order.status_history.push({
            status: "CANCELLED",
            changed_by: "customer",
            changed_at: new Date(),
            note: reason || "Cancelled by customer"
        });
        order.updated_by = req.user.email;
        await order.save();

        // ── Restore stock atomically ──────────────────────────────────
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

        // Send cancellation email
        const user = await User.findById(req.user.id).select("email");
        if (user?.email) {
            sendOrderCancelledEmail(user.email, order).catch(console.error);
        }

        res.json({ message: "Order cancelled successfully", order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;

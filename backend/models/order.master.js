import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Order items with product snapshots
    items: [{
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true, min: 1 },
      image: { type: String }
    }],

    // Pricing breakdown
    subtotal: { type: Number, required: true },
    shipping_fee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total_amount: { type: Number, required: true },

    // Delivery details
    delivery_address: { type: String, required: true },
    phone_number: { type: String, required: true },

    // Order status
    status: {
      type: String,
      enum: ["PLACED", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PLACED"
    },

    // Cancel reason
    cancel_reason: { type: String },

    // Payment
    payment_status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "COD"],
      default: "PENDING"
    },
    payment_method: {
      type: String,
      enum: ["COD", "CARD", "UPI", "NETBANKING", "WALLET"],
      default: "COD"
    },

    // Delivery agent assigned by admin
    assigned_agent: {
      name: { type: String },
      phone: { type: String },
      email: { type: String }
    },

    // Tracking
    tracking_number: { type: String },
    estimated_delivery: { type: Date },

    // Status history (audit trail)
    status_history: [{
      status: { type: String },
      changed_by: { type: String },
      changed_at: { type: Date, default: Date.now },
      note: { type: String }
    }],

    // Admin notes
    admin_notes: { type: String },

    // Customer notes
    notes: { type: String },

    created_by: { type: String, default: "system" },
    updated_by: { type: String }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

orderSchema.index({ user_id: 1, created_at: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ created_at: -1 });

export const Order = mongoose.model("Order", orderSchema);

import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        address_type: {
            type: String,
            enum: ["HOME", "WORK", "OTHER"],
            default: "HOME"
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        street: {
            type: String,
            required: true,
            trim: true
        },

        landmark: {
            type: String,
            trim: true
        },

        city: {
            type: String,
            required: true,
            trim: true
        },

        state: {
            type: String,
            required: true,
            trim: true
        },

        pincode: {
            type: String,
            required: true,
            trim: true
        },

        country: {
            type: String,
            required: true,
            default: "India",
            trim: true
        },

        is_default: {
            type: Boolean,
            default: false
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    }
);

// Index for quick lookup of user addresses
addressSchema.index({ user_id: 1, isActive: 1 });

// Ensure only one default address per user
addressSchema.pre("save", async function (next) {
    if (this.is_default) {
        await this.constructor.updateMany(
            { user_id: this.user_id, _id: { $ne: this._id } },
            { is_default: false }
        );
    }
    next();
});

export const Address = mongoose.model("Address", addressSchema);

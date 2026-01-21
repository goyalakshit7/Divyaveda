import mongoose from "mongoose";

const userRoleAssignmentSchema = new mongoose.Schema(
    {
        user_email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true
        },
        role_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        assigned_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        assigned_date: {
            type: Date,
            default: Date.now
        },
        last_modified: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Compound index to prevent duplicate email-role combinations
userRoleAssignmentSchema.index({ user_email: 1, role_id: 1 }, { unique: true });

// Update last_modified before saving
userRoleAssignmentSchema.pre("save", function () {
    this.last_modified = new Date();
});

export const UserRoleAssignment = mongoose.model("UserRoleAssignment", userRoleAssignmentSchema);

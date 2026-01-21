import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
    {
        employee_name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        phone_number: {
            type: String,
            required: true,
            trim: true
        },
        department: {
            type: String,
            required: true,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        created_date: {
            type: Date,
            default: Date.now
        },
        last_modified_date: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Update last_modified_date before saving
employeeSchema.pre("save", function () {
    this.last_modified_date = new Date();
});

// Update last_modified_date before updating
employeeSchema.pre("findOneAndUpdate", function () {
    this.set({ last_modified_date: new Date() });
});

export const Employee = mongoose.model("Employee", employeeSchema);

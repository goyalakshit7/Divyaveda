import { UserRoleAssignment } from "../../models/userRoleAssignment.master.js";
import { Role } from "../../models/role.master.js";
import { Employee } from "../../models/employee.master.js";
import { User } from "../../models/user.master.js";

// Get all role assignments (optionally filter by user_email)
export const getAllRoleAssignments = async (req, res) => {
    try {
        const { user_email } = req.query;

        const query = {};
        if (user_email) {
            query.user_email = user_email.toLowerCase();
        }

        const assignments = await UserRoleAssignment.find(query)
            .populate("role_id", "role_name screen_access")
            .populate("assigned_by", "username email")
            .sort({ assigned_date: -1 });

        res.json({ data: assignments });
    } catch (error) {
        console.error("❌ getAllRoleAssignments error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Assign a role to a user email
export const assignRole = async (req, res) => {
    try {
        const { user_email, role_id } = req.body;

        if (!user_email || !role_id) {
            return res.status(400).json({ message: "User email and role ID are required" });
        }

        // Check if role exists
        const role = await Role.findById(role_id);
        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }

        // Check if employee exists in Employee Master
        const employee = await Employee.findOne({ email: user_email.toLowerCase(), isActive: true });
        if (!employee) {
            return res.status(404).json({ message: "No active employee found with this email" });
        }

        // Check if assignment already exists
        const existingAssignment = await UserRoleAssignment.findOne({
            user_email: user_email.toLowerCase(),
            role_id: role_id
        });

        if (existingAssignment) {
            return res.status(400).json({ message: "This role is already assigned to this user" });
        }

        // Create new assignment
        const assignment = await UserRoleAssignment.create({
            user_email: user_email.toLowerCase(),
            role_id: role_id,
            assigned_by: req.user.id,
            isActive: true
        });

        const populatedAssignment = await UserRoleAssignment.findById(assignment._id)
            .populate("role_id", "role_name screen_access")
            .populate("assigned_by", "username email");

        res.status(201).json({
            message: "Role assigned successfully",
            data: populatedAssignment
        });
    } catch (error) {
        console.error("❌ assignRole error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Update role assignment (toggle isActive)
export const updateRoleAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const assignment = await UserRoleAssignment.findById(id);
        if (!assignment) {
            return res.status(404).json({ message: "Role assignment not found" });
        }

        if (typeof isActive !== "undefined") {
            assignment.isActive = isActive;
        }

        await assignment.save();

        const updatedAssignment = await UserRoleAssignment.findById(id)
            .populate("role_id", "role_name screen_access")
            .populate("assigned_by", "username email");

        res.json({
            message: "Role assignment updated successfully",
            data: updatedAssignment
        });
    } catch (error) {
        console.error("❌ updateRoleAssignment error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Delete role assignment
export const deleteRoleAssignment = async (req, res) => {
    try {
        const { id } = req.params;

        const assignment = await UserRoleAssignment.findByIdAndDelete(id);
        if (!assignment) {
            return res.status(404).json({ message: "Role assignment not found" });
        }

        res.json({ message: "Role assignment deleted successfully" });
    } catch (error) {
        console.error("❌ deleteRoleAssignment error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get active roles for a specific user email
export const getActiveRolesForUser = async (req, res) => {
    try {
        const { email } = req.params;

        const assignments = await UserRoleAssignment.find({
            user_email: email.toLowerCase(),
            isActive: true
        }).populate("role_id", "role_name screen_access");

        const roles = assignments.map(a => a.role_id);

        res.json({ roles });
    } catch (error) {
        console.error("❌ getActiveRolesForUser error:", error);
        res.status(500).json({ message: error.message });
    }
};

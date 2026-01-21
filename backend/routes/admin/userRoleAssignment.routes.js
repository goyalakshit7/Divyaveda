import express from "express";
import {
    getAllRoleAssignments,
    assignRole,
    updateRoleAssignment,
    deleteRoleAssignment,
    getActiveRolesForUser
} from "../../controllers/admin/userRoleAssignment.controller.js";
import { isAuthenticated } from "../../middleware/isAuthenticated.js";

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Get all role assignments (optionally filter by user_email)
router.get("/", getAllRoleAssignments);

// Get active roles for a specific user email
router.get("/user/:email", getActiveRolesForUser);

// Assign a new role to a user
router.post("/", assignRole);

// Update role assignment (toggle active status)
router.put("/:id", updateRoleAssignment);

// Delete role assignment
router.delete("/:id", deleteRoleAssignment);

export default router;

import express from "express";
import {
    getAllEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getDepartments
} from "../../controllers/admin/employee.controller.js";
import { isAuthenticated } from "../../middleware/isAuthenticated.js";

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Get unique departments (before /:id to avoid conflicts)
router.get("/departments", getDepartments);

// Get all employees
router.get("/", getAllEmployees);

// Create employee (Super Admin only)
router.post("/", createEmployee);

// Update employee (Super Admin only)
router.put("/:id", updateEmployee);

// Delete employee (Super Admin only)
router.delete("/:id", deleteEmployee);

export default router;

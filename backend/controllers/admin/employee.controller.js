import { Employee } from "../../models/employee.master.js";
import { User } from "../../models/user.master.js";

// Get all employees
export const getAllEmployees = async (req, res) => {
    try {
        const { search, department, isActive, page = 1, limit = 25 } = req.query;

        const query = {};

        // Search by name, email, or phone
        if (search) {
            query.$or = [
                { employee_name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone_number: { $regex: search, $options: "i" } }
            ];
        }

        // Filter by department
        if (department) {
            query.department = department;
        }

        // Filter by active status
        if (typeof isActive !== "undefined") {
            query.isActive = isActive === "true";
        }

        const skip = (page - 1) * limit;
        const total = await Employee.countDocuments(query);

        const employees = await Employee.find(query)
            .populate("created_by", "username email")
            .sort({ created_date: -1 })
            .skip(skip)
            .limit(Number(limit));

        res.json({
            data: employees,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("❌ getAllEmployees error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Create employee
export const createEmployee = async (req, res) => {
    try {
        const { employee_name, email, phone_number, department, isActive } = req.body;

        // Check if user is super admin
        const user = await User.findById(req.user.id);
        if (!user || !user.isSuperAdmin) {
            return res.status(403).json({ message: "Only Super Admin can create employees" });
        }

        // Check if employee with email already exists
        const existingEmployee = await Employee.findOne({ email });
        if (existingEmployee) {
            return res.status(400).json({ message: "Employee with this email already exists" });
        }

        const employee = await Employee.create({
            employee_name,
            email,
            phone_number,
            department,
            isActive: isActive !== undefined ? isActive : true,
            created_by: req.user.id
        });

        const populatedEmployee = await Employee.findById(employee._id)
            .populate("created_by", "username email");

        res.status(201).json({
            message: "Employee created successfully",
            data: populatedEmployee
        });
    } catch (error) {
        console.error("❌ createEmployee error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Update employee
export const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { employee_name, email, phone_number, department, isActive } = req.body;

        // Check if user is super admin
        const user = await User.findById(req.user.id);
        if (!user || !user.isSuperAdmin) {
            return res.status(403).json({ message: "Only Super Admin can update employees" });
        }

        const employee = await Employee.findById(id);
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        // Update fields
        if (employee_name) employee.employee_name = employee_name;
        if (email) employee.email = email;
        if (phone_number) employee.phone_number = phone_number;
        if (department) employee.department = department;
        if (typeof isActive !== "undefined") employee.isActive = isActive;

        await employee.save();

        const updatedEmployee = await Employee.findById(id)
            .populate("created_by", "username email");

        res.json({
            message: "Employee updated successfully",
            data: updatedEmployee
        });
    } catch (error) {
        console.error("❌ updateEmployee error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Delete employee (soft delete by setting isActive to false)
export const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user is super admin
        const user = await User.findById(req.user.id);
        if (!user || !user.isSuperAdmin) {
            return res.status(403).json({ message: "Only Super Admin can delete employees" });
        }

        const employee = await Employee.findById(id);
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        employee.isActive = false;
        await employee.save();

        res.json({ message: "Employee deactivated successfully" });
    } catch (error) {
        console.error("❌ deleteEmployee error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get unique departments
export const getDepartments = async (req, res) => {
    try {
        const departments = await Employee.distinct("department");
        res.json(departments);
    } catch (error) {
        console.error("❌ getDepartments error:", error);
        res.status(500).json({ message: error.message });
    }
};

import { User } from "../../models/user.master.js";
import { Role } from "../../models/role.master.js";
import { Employee } from "../../models/employee.master.js";

// ✅ Helper to escape regex safely
const escapeRegex = (text = "") => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    // Guard: empty or very small query
    if (!query || query.trim().length < 2) {
      return res.json({ users: [] });
    }

    // 🔐 CRITICAL FIX
    const safeQuery = escapeRegex(query.trim());

    const users = await User.find({
      $or: [
        { username: { $regex: safeQuery, $options: "i" } },
        { email: { $regex: safeQuery, $options: "i" } }
      ]
    })
      .select("_id username email")
      .limit(10);

    res.status(200).json({ users });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ users: [] }); // never crash UI
  }
};

export const getAllUsers = async (req, res) => {
  try {
    // FILTER: Get users where isSuperAdmin is NOT true
    const users = await User.find({ isSuperAdmin: { $ne: true } })
      .select("-password")
      .populate("role_id", "role_name");

    res.json({ users });
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Assign role - supports both user_id (existing users) and email (from Employee Master)
export const assignRole = async (req, res) => {
  try {
    const { user_id, email, role_id } = req.body;

    // Validate: need either user_id or email
    if (!user_id && !email) {
      return res.status(400).json({ message: "User ID or Email is required" });
    }

    // Validate role if provided
    if (role_id) {
      const roleExists = await Role.findById(role_id);
      if (!roleExists) {
        return res.status(404).json({ message: "Role not found" });
      }
    }

    let user;

    // Case 1: Assignment by user_id (existing user)
    if (user_id) {
      user = await User.findByIdAndUpdate(
        user_id,
        { role_id: role_id || null },
        { new: true }
      ).select("-password").populate("role_id", "role_name");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
    }
    // Case 2: Assignment by email (from Employee Master)
    else if (email) {
      // Check if user already exists
      user = await User.findOne({ email });

      if (user) {
        // User exists, just update role
        user.role_id = role_id || null;
        await user.save();
        user = await User.findById(user._id).select("-password").populate("role_id", "role_name");
      } else {
        // User doesn't exist, check Employee Master
        const employee = await Employee.findOne({ email, isActive: true });

        if (!employee) {
          return res.status(404).json({
            message: "No active employee found with this email"
          });
        }

        // Create new user from employee data
        const newUser = await User.create({
          username: employee.employee_name,
          email: employee.email,
          name: employee.employee_name,
          phone: employee.phone_number,
          role_id: role_id || null,
          password: "ChangeMe@123", // Default password - user should change on first login
          isActive: true
        });

        user = await User.findById(newUser._id).select("-password").populate("role_id", "role_name");
      }
    }

    res.json({ message: "Role assigned successfully", user });
  } catch (error) {
    console.error("Assign Role Error:", error);
    res.status(500).json({ message: error.message });
  }
};
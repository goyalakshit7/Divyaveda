import { Role } from "../models/role.master.js";
import { User } from "../models/user.master.js";
import { UserRoleAssignment } from "../models/userRoleAssignment.master.js";

export const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // 1. Super Admin Bypass (ALWAYS FIRST)
      if (req.user.isSuperAdmin) {
        return next();
      }

      // 2. Try OLD System: Check single role_id
      let userRoleId = req.user.role_id;

      // Self-healing: Fetch role_id if missing
      if (!userRoleId) {
        const user = await User.findById(req.user.id);
        userRoleId = user?.role_id;
      }

      // Check old single role system
      if (userRoleId) {
        const role = await Role.findById(userRoleId);

        if (role) {
          // Super Admin check (role-based)
          if (role.role_name === "Super Admin") {
            return next();
          }

          // Check permission in old single role
          if (role.screen_access && role.screen_access.includes(requiredPermission)) {
            console.log(`✅ Permission granted via single role: ${role.role_name}`);
            return next(); // ✅ SUCCESS via old system
          }
        }
      }

      // 3. NEW System: Check multi-role assignments
      // Get user email for multi-role lookup
      let userEmail = req.user.email;
      if (!userEmail) {
        const user = await User.findById(req.user.id);
        userEmail = user?.email;
      }

      if (userEmail) {
        // Find all ACTIVE role assignments for this user
        const roleAssignments = await UserRoleAssignment.find({
          user_email: userEmail.toLowerCase(),
          isActive: true
        }).populate("role_id");

        console.log(`🔍 Multi-role check for ${userEmail}: Found ${roleAssignments.length} active assignments`);

        // Check each assigned role for the permission
        for (const assignment of roleAssignments) {
          const role = assignment.role_id;

          if (role) {
            // Super Admin check (role-based)
            if (role.role_name === "Super Admin") {
              return next();
            }

            // Check permission in this role
            if (role.screen_access && role.screen_access.includes(requiredPermission)) {
              console.log(`✅ Permission granted via multi-role: ${role.role_name}`);
              return next(); // ✅ SUCCESS via new system
            }
          }
        }
      }

      // 4. DENIED: No permission found in either system
      console.log(`❌ Denied: User lacks '${requiredPermission}' in any assigned role`);
      return res.status(403).json({
        message: `Access Denied: You need ${requiredPermission} permission.`
      });

    } catch (error) {
      console.error("RBAC Error:", error);
      res.status(500).json({ message: "Server Error during permission check" });
    }
  };
};
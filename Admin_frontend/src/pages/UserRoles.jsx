import { useEffect, useState } from "react";
import api from "../api/axios";
import PermissionGate from "../components/PermissionGate";

const UserRoles = () => {
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [roleAssignments, setRoleAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");

  // Load data
  const loadData = async () => {
    try {
      const [employeesRes, rolesRes, assignmentsRes] = await Promise.all([
        api.get("/admin/employees"),
        api.get("/admin/roles"),
        api.get("/admin/user-role-assignments")
      ]);
      
      setEmployees(employeesRes.data?.data || []);
      setRoles(rolesRes.data?.roles || rolesRes.data || []);
      setRoleAssignments(assignmentsRes.data?.data || []);
    } catch (err) {
      console.error("Load error:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Add new role assignment
  const handleAddRole = async (e) => {
    e.preventDefault();
    if (!selectedEmail || !selectedRoleId) {
      alert("Please select both employee and role");
      return;
    }

    try {
      await api.post("/admin/user-role-assignments", {
        user_email: selectedEmail,
        role_id: selectedRoleId
      });

      alert("Role assigned successfully!");
      setIsAddModalOpen(false);
      setSelectedEmail("");
      setSelectedRoleId("");
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Assignment failed");
    }
  };

  // Toggle role active status
  const handleToggleActive = async (assignmentId, currentStatus) => {
    try {
      await api.put(`/admin/user-role-assignments/${assignmentId}`, {
        isActive: !currentStatus
      });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  // Remove role assignment
  const handleRemoveRole = async (assignmentId) => {
    if (!window.confirm("Are you sure you want to remove this role assignment?")) return;

    try {
      await api.delete(`/admin/user-role-assignments/${assignmentId}`);
      alert("Role removed successfully!");
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  // Group assignments by email
  const groupedAssignments = roleAssignments.reduce((acc, assignment) => {
    const email = assignment.user_email;
    if (!acc[email]) {
      acc[email] = [];
    }
    acc[email].push(assignment);
    return acc;
  }, {});

  // Filter by search term
  const filteredEmails = Object.keys(groupedAssignments).filter(email =>
    email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-6 text-[var(--text-muted)]">Loading...</div>;
  }

  return (
    <PermissionGate routeName="USER_ROLE_VIEW">
      <div className="space-y-6 w-full">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">
              User Role Assignments
            </h1>
            <div className="text-sm text-[var(--text-muted)]">
              {Object.keys(groupedAssignments).length} users with role assignments
            </div>
          </div>
          
          <PermissionGate routeName="USER_ROLE_ASSIGN">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
            >
              ➕ Assign Role
            </button>
          </PermissionGate>
        </div>

        {error && (
          <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search by email..."
          className="w-full sm:max-w-md
            border border-[var(--border-primary)]
            rounded-lg px-4 py-2
            bg-[var(--bg-card)]
            text-[var(--text-primary)]
            outline-none"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        {/* ROLE ASSIGNMENTS */}
        <div className="space-y-4">
          {filteredEmails.length === 0 ? (
            <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-8 text-center text-[var(--text-muted)]">
              No role assignments found
            </div>
          ) : (
            filteredEmails.map(email => {
              const assignments = groupedAssignments[email];
              const employee = employees.find(emp => emp.email === email);

              return (
                <div 
                  key={email}
                  className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4"
                >
                  {/* User Info */}
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-[var(--border-primary)]">
                    <div>
                      <div className="font-semibold text-[var(--text-primary)]">
                        {employee?.employee_name || "Unknown User"}
                      </div>
                      <div className="text-sm text-[var(--text-muted)]">
                        {email}
                      </div>
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {assignments.length} role{assignments.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Roles */}
                  <div className="flex flex-wrap gap-2">
                    {assignments.map(assignment => (
                      <div 
                        key={assignment._id}
                        className={`
                          flex items-center gap-2 px-3 py-1.5 rounded-lg border
                          ${assignment.isActive 
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-600' 
                            : 'bg-gray-500/10 border-gray-500/30 text-gray-500'
                          }
                        `}
                      >
                        <span className="text-sm font-medium">
                          {assignment.role_id?.role_name || "Unknown Role"}
                        </span>

                        <PermissionGate routeName="USER_ROLE_ASSIGN">
                          <div className="flex items-center gap-1 ml-2 border-l border-current/30 pl-2">
                            {/* Toggle Active */}
                            <button
                              onClick={() => handleToggleActive(assignment._id, assignment.isActive)}
                              className="hover:opacity-70 transition"
                              title={assignment.isActive ? "Deactivate" : "Activate"}
                            >
                              {assignment.isActive ? "Deactivate" : "👁️‍🗨️"}
                            </button>

                            {/* Remove */}
                            <button
                              onClick={() => handleRemoveRole(assignment._id)}
                              className="hover:opacity-70 transition text-red-500"
                              title="Remove role"
                            >
                              Remove
                            </button>
                          </div>
                        </PermissionGate>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ADD ROLE MODAL */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur flex items-center justify-center p-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl w-full max-w-md p-6">

              <h2 className="text-xl font-bold mb-4">
                Assign Role to Employee
              </h2>

              <form onSubmit={handleAddRole} className="space-y-4">
                {/* Employee Email Dropdown */}
                <div>
                  <label className="block mb-1 text-sm font-semibold text-[var(--text-muted)]">
                    Employee Email *
                  </label>
                  <select
                    required
                    className="w-full
                      border border-[var(--border-primary)]
                      rounded-lg px-3 py-2
                      bg-[var(--bg-card)]
                      text-[var(--text-primary)]"
                    value={selectedEmail}
                    onChange={e => setSelectedEmail(e.target.value)}
                  >
                    <option value="">-- Select Employee --</option>
                    {employees
                      .filter(emp => emp.isActive)
                      .map(emp => (
                        <option key={emp._id} value={emp.email}>
                          {emp.employee_name} ({emp.email})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Role Dropdown */}
                <div>
                  <label className="block mb-1 text-sm font-semibold text-[var(--text-muted)]">
                    Role *
                  </label>
                  <select
                    required
                    className="w-full
                      border border-[var(--border-primary)]
                      rounded-lg px-3 py-2
                      bg-[var(--bg-card)]
                      text-[var(--text-primary)]"
                    value={selectedRoleId}
                    onChange={e => setSelectedRoleId(e.target.value)}
                  >
                    <option value="">-- Select Role --</option>
                    {roles.map(r => (
                      <option key={r._id} value={r._id}>
                        {r.role_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4 border-t border-[var(--border-primary)]">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-2 rounded-lg border border-[var(--border-primary)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg bg-blue-600 text-white"
                  >
                    Assign Role
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </PermissionGate>
  );
};

export default UserRoles;

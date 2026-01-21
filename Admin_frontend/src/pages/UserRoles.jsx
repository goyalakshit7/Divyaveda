import { useEffect, useState } from "react";
import api from "../api/axios";
import PermissionGate from "../components/PermissionGate";

const UserRoles = () => {
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedEmployeeEmail, setSelectedEmployeeEmail] = useState("");

  const safeExtract = (res, key) => res.data[key] || res.data || [];

  // Load users + roles + employees
  const loadData = async () => {
    try {
      const [usersRes, rolesRes, employeesRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/roles"),
        api.get("/admin/employees")
      ]);
      setUsers(safeExtract(usersRes, "users"));
      setRoles(safeExtract(rolesRes, "roles"));
      setEmployees(safeExtract(employeesRes, "data"));
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Assign role to existing user
  const handleAssign = async (e) => {
    e.preventDefault();
    if (!targetUser) return;

    try {
      const res = await api.post("/admin/users/assign", {
        user_id: targetUser._id,
        role_id: selectedRoleId
      });

      const updatedUser = res.data.user;

      setUsers(prev =>
        prev.map(u => (u._id === updatedUser._id ? updatedUser : u))
      );

      setIsModalOpen(false);
      setTargetUser(null);
    } catch (e) {
      alert(e.response?.data?.message || "Assignment failed");
    }
  };

  // Assign role to employee from Employee Master
  const handleAddRoleAssignment = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeEmail || !selectedRoleId) {
      alert("Please select both employee and role");
      return;
    }

    try {
      await api.post("/admin/users/assign", {
        email: selectedEmployeeEmail,
        role_id: selectedRoleId
      });

      alert("Role assigned successfully!");
      setIsAddModalOpen(false);
      setSelectedEmployeeEmail("");
      setSelectedRoleId("");
      loadData();
    } catch (e) {
      alert(e.response?.data?.message || "Assignment failed");
    }
  };

  const openModal = (user) => {
    setTargetUser(user);
    setSelectedRoleId(user.role_id?._id || user.role_id || "");
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setSelectedEmployeeEmail("");
    setSelectedRoleId("");
    setIsAddModalOpen(true);
  };

  const filteredUsers = users.filter(u =>
    (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-6 text-[var(--text-muted)]">Loading users…</div>;
  }

  return (
    <PermissionGate routeName="USER_ROLE_VIEW">
      <div className="space-y-6 w-full">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">
              User Role Assignment
            </h1>
            <div className="text-sm text-[var(--text-muted)]">
              {users.length} users
            </div>
          </div>
          
          <PermissionGate routeName="USER_ROLE_ASSIGN">
            <button 
              onClick={openAddModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
            >
              ➕ Add Role Assignment
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
          placeholder="Search users…"
          className="w-full sm:max-w-md
            border border-[var(--border-primary)]
            rounded-lg px-4 py-2
            bg-[var(--bg-card)]
            text-[var(--text-primary)]
            outline-none"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        {/* TABLE */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead className="bg-[var(--bg-muted)] text-left">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-[var(--text-muted)]">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr
                    key={user._id}
                    className="border-t border-[var(--border-primary)] hover:bg-[var(--hover-bg)] transition"
                  >
                    <td className="p-4 font-medium whitespace-nowrap">
                      {user.name}
                    </td>

                    <td className="p-4 break-all">
                      {user.email}
                    </td>

                    <td className="p-4">
                      {user.role_id?.role_name ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-blue-500/15 text-blue-600">
                          {user.role_id.role_name}
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-[var(--hover-bg)] text-[var(--text-muted)]">
                          Simple User
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      <PermissionGate routeName="USER_ROLE_ASSIGN">
                        <button
                          onClick={() => openModal(user)}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Edit Role
                        </button>
                      </PermissionGate>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MODAL */}
        {isModalOpen && targetUser && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur flex items-center justify-center p-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl w-full max-w-md p-6">

              <h2 className="text-xl font-bold mb-1">
                Assign Role
              </h2>

              <p className="text-sm text-[var(--text-muted)] mb-4">
                User: <b>{targetUser.name}</b>
              </p>

              <div className="bg-[var(--hover-bg)] p-3 rounded-lg mb-4">
                <span className="text-xs text-[var(--text-muted)] block">
                  Current Role
                </span>
                <span className="font-semibold">
                  {targetUser.role_id?.role_name || "Simple User"}
                </span>
              </div>

              <form onSubmit={handleAssign} className="space-y-4">
                {/* 🔥 FIXED SELECT */}
                <select
                  className="w-full
                    border border-[var(--border-primary)]
                    rounded-lg px-3 py-2
                    bg-[var(--bg-card)]
                    text-[var(--text-primary)]"
                  value={selectedRoleId}
                  onChange={e => setSelectedRoleId(e.target.value)}
                >
                  <option value="">Remove Role (Simple User)</option>
                  {roles.map(r => (
                    <option key={r._id} value={r._id}>
                      {r.role_name}
                    </option>
                  ))}
                </select>

                <div className="flex gap-3 pt-4 border-t border-[var(--border-primary)]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2 rounded-lg border border-[var(--border-primary)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg bg-blue-600 text-white"
                  >
                    Save
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* ADD ROLE ASSIGNMENT MODAL (From Employee Master) */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur flex items-center justify-center p-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl w-full max-w-md p-6">

              <h2 className="text-xl font-bold mb-4">
                Assign Role to Employee
              </h2>

              <form onSubmit={handleAddRoleAssignment} className="space-y-4">
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
                    value={selectedEmployeeEmail}
                    onChange={e => setSelectedEmployeeEmail(e.target.value)}
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

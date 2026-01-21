import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAdminAuth } from "../context/AuthContext";

const AdminMaster = () => {
  const { admin } = useAdminAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [departments, setDepartments] = useState([]);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 25;

  //Filters
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    isActive: ""
  });

  // Form Data
  const [formData, setFormData] = useState({
    employee_name: "",
    email: "",
    phone_number: "",
    department: "",
    isActive: true
  });

  const isSuperAdmin = admin?.isSuperAdmin === true;

  // Load Employees
  const loadEmployees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", limit);
      
      if (filters.search) params.set("search", filters.search);
      if (filters.department) params.set("department", filters.department);
      if (filters.isActive) params.set("isActive", filters.isActive);

      const res = await api.get(`/admin/employees?${params.toString()}`);
      const { data = [], total = 0, totalPages: tp = 1 } = res.data || {};
      
      setEmployees(data);
      setTotalPages(tp);
    } catch (err) {
      console.error("Load Employees Error:", err);
      alert("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  // Load Departments
  const loadDepartments = async () => {
    try {
      const res = await api.get("/admin/employees/departments");
      setDepartments(res.data || []);
    } catch (err) {
      console.error("Load Departments Error:", err);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [page, filters]);

  useEffect(() => {
    loadDepartments();
  }, []);

  const openModal = (employee = null) => {
    setEditingEmployee(employee);
    if (employee) {
      setFormData({
        employee_name: employee.employee_name || "",
        email: employee.email || "",
        phone_number: employee.phone_number || "",
        department: employee.department || "",
        isActive: employee.isActive !== undefined ? employee.isActive : true
      });
    } else {
      setFormData({
        employee_name: "",
        email: "",
        phone_number: "",
        department: "",
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await api.put(`/admin/employees/${editingEmployee._id}`, formData);
        alert("Employee updated successfully!");
      } else {
        await api.post("/admin/employees", formData);
        alert("Employee created successfully!");
      }
      setIsModalOpen(false);
      setEditingEmployee(null);
      loadEmployees();
      loadDepartments();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this employee?")) return;
    try {
      await api.delete(`/admin/employees/${id}`);
      alert("Employee deactivated successfully!");
      loadEmployees();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ search: "", department: "", isActive: "" });
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Employee Master</h1>
          <p className="text-sm text-slate-400">Manage employee records</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => loadEmployees()} 
            className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 border px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            🔄 Refresh
          </button>
          <button 
            onClick={resetFilters} 
            className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 border px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            ❌ Reset
          </button>
          {isSuperAdmin && (
            <button 
              onClick={() => openModal(null)} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              ➕ New Employee
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <input 
            placeholder="Search name/email/phone..." 
            value={filters.search} 
            onChange={(e) => handleFilterChange("search", e.target.value)} 
            className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-lg p-2.5 outline-none focus:border-blue-500"
          />
          
          <select 
            value={filters.department} 
            onChange={(e) => handleFilterChange("department", e.target.value)} 
            className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-lg p-2.5 outline-none focus:border-blue-500"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select 
            value={filters.isActive} 
            onChange={(e) => handleFilterChange("isActive", e.target.value)} 
            className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-lg p-2.5 outline-none focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center animate-pulse text-slate-400">Loading...</div>
          ) : (
            <table className="w-full text-sm text-left text-slate-400">
              <thead className="text-xs text-slate-200 uppercase bg-slate-950 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">S.No</th>
                  <th className="px-4 py-3">Employee Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Status</th>
                  {isSuperAdmin && <th className="px-4 py-3">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {employees.map((emp, index) => (
                  <tr key={emp._id} className="bg-slate-900 hover:bg-slate-800 transition-colors">
                    <td className="px-4 py-3">{(page - 1) * limit + index + 1}</td>
                    <td className="px-4 py-3 font-medium text-white">{emp.employee_name}</td>
                    <td className="px-4 py-3">{emp.email}</td>
                    <td className="px-4 py-3">{emp.phone_number}</td>
                    <td className="px-4 py-3">{emp.department}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        emp.isActive 
                          ? "bg-green-900/30 text-green-400" 
                          : "bg-red-900/30 text-red-400"
                      }`}>
                        {emp.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    {isSuperAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openModal(emp)} 
                            className="text-blue-400 hover:text-blue-300 font-medium text-xs"
                          >
                            Edit
                          </button>
                          {emp.isActive && (
                            <button 
                              onClick={() => handleDelete(emp._id)} 
                              className="text-red-400 hover:text-red-300 font-medium text-xs"
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-10 text-center text-slate-500">
                      No employees found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-sm text-slate-400">
          Page <span className="font-semibold text-white">{page}</span> of <span className="font-semibold text-white">{totalPages}</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            disabled={page === 1} 
            className="px-4 py-2 text-sm font-medium border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-300 bg-slate-800 border-slate-700 hover:bg-slate-700"
          >
            Previous
          </button>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
            disabled={page >= totalPages} 
            className="px-4 py-2 text-sm font-medium border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-300 bg-slate-800 border-slate-700 hover:bg-slate-700"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50 bg-black/80">
          <div className="rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border bg-slate-900 border-slate-800">
            <div className="flex justify-between items-center px-6 py-4 border-b sticky top-0 z-10 border-slate-800 bg-slate-900">
              <h2 className="text-xl font-bold text-white">
                {editingEmployee ? "Edit Employee" : "Create New Employee"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-red-500 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block mb-1 text-xs font-semibold text-slate-400 uppercase">Employee Name *</label>
                <input 
                  required
                  className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-lg p-2.5 outline-none focus:border-blue-500"
                  value={formData.employee_name} 
                  onChange={e => setFormData({...formData, employee_name: e.target.value})} 
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-semibold text-slate-400 uppercase">Email *</label>
                <input 
                  required
                  type="email"
                  className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-lg p-2.5 outline-none focus:border-blue-500"
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-semibold text-slate-400 uppercase">Phone Number *</label>
                <input 
                  required
                  className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-lg p-2.5 outline-none focus:border-blue-500"
                  value={formData.phone_number} 
                  onChange={e => setFormData({...formData, phone_number: e.target.value})} 
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-semibold text-slate-400 uppercase">Department *</label>
                <input 
                  required
                  className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-lg p-2.5 outline-none focus:border-blue-500"
                  value={formData.department} 
                  onChange={e => setFormData({...formData, department: e.target.value})} 
                  placeholder="e.g., Sales, HR, IT"
                />
              </div>

              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  className="w-5 h-5 rounded focus:ring-green-500 text-green-600 border-slate-600 bg-slate-800"
                  checked={formData.isActive} 
                  onChange={e => setFormData({...formData, isActive: e.target.checked})} 
                />
                <label htmlFor="isActive" className="font-medium text-sm text-white">
                  Active Status
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-2.5 border rounded-lg font-medium transition-colors bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMaster;

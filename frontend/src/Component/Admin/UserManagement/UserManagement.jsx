import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../Context/authContext";
import { useTheme } from "../../../Context/themeContext";
import { MdBlock, MdCheckCircle, MdSearch } from "react-icons/md";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const UserManagement = () => {
  const { authToken } = useAuth();
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${SERVER_URL}/api/admin/users?page=${page}&limit=10&search=${searchTerm}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      const delayDebounceFn = setTimeout(() => {
        fetchUsers();
      }, 500); // 500ms debounce for search
      return () => clearTimeout(delayDebounceFn);
    }
  }, [authToken, page, searchTerm]);

  const toggleUserStatus = async (userId, currentStatus, userType) => {
    if (userType === "admin") {
      alert("System Administrators cannot be suspended.");
      return;
    }

    const newStatus = currentStatus === "blocked" ? "active" : "blocked";
    const confirmMsg = `Are you sure you want to ${newStatus === "blocked" ? "SUSPEND" : "RESTORE"} this user?`;
    
    if (window.confirm(confirmMsg)) {
      try {
        const { data } = await axios.patch(
          `${SERVER_URL}/api/admin/users/${userId}/status`,
          { status: newStatus },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        if (data.success) {
          setUsers(users.map((u) => (u._id === userId ? { ...u, status: newStatus } : u)));
        }
      } catch (err) {
        alert(err?.response?.data?.message || "Failed to update status.");
      }
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-sm border p-8 animate-fade-in-up transition-colors`}>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>User Management</h2>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Control access for all buyers and sellers.</p>
        </div>

        <div className="relative w-full md:w-96">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
              theme === 'dark' ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900'
            }`}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-100'} border-b text-xs uppercase tracking-wider text-gray-500 font-bold`}>
              <th className="p-4 rounded-tl-xl">User Details</th>
              <th className="p-4">Role</th>
              <th className="p-4">Joined</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right rounded-tr-xl">Action</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700/60' : 'divide-gray-100/60'} ${loading ? 'opacity-50 pointer-events-none' : ''} transition-opacity duration-200`}>
            {loading && users.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-400">Loading...</td></tr>
            ) : !loading && users.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-400">No users found.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className={`${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50/50'} transition-colors`}>
                  <td className="p-4">
                    <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{u.name}</div>
                    <div className="text-sm text-gray-500">{u.email}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      u.userType === "admin" ? "bg-purple-100 text-purple-700" :
                      u.userType === "seller" ? "bg-orange-100 text-orange-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {u.userType}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                      u.status === "blocked" ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${u.status === "blocked" ? "bg-red-500" : "bg-emerald-500"}`}></span>
                      {u.status === "blocked" ? "SUSPENDED" : "ACTIVE"}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => toggleUserStatus(u._id, u.status, u.userType)}
                      disabled={u.userType === "admin"}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                        u.userType === "admin" 
                          ? `${theme === 'dark' ? 'bg-gray-700 text-gray-500 border-gray-700' : 'bg-gray-100 text-gray-400 border-gray-100'} opacity-50 cursor-not-allowed` 
                          : u.status === "blocked" 
                            ? "bg-gray-900 border-gray-900 text-white hover:bg-gray-800" 
                            : "bg-red-50 border-red-100 text-red-600 hover:bg-red-100 hover:text-red-700"
                      }`}
                    >
                      {u.status === "blocked" ? <><MdCheckCircle size={18} /> Restore</> : <><MdBlock size={18} /> Block</>}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className={`mt-8 flex justify-between items-center pt-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
          <p className="text-sm text-gray-500 font-medium">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className={`px-4 py-2 border rounded-lg text-sm font-medium disabled:opacity-50 transition-colors ${
                theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className={`px-4 py-2 border rounded-lg text-sm font-medium disabled:opacity-50 transition-colors ${
                theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

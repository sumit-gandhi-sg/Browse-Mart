import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../Context/authContext";
import { useTheme } from "../../../Context/themeContext";
import { useCategory } from "../../../Context/categoryContext";
import { MdSearch, MdEdit, MdDelete, MdAdd } from "react-icons/md";
import { swalWithCustomConfiguration } from "../../../utility/constant";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const CategoryManagement = () => {
  const { authToken } = useAuth();
  const { theme } = useTheme();
  const { categories, fetchCategories, loading } = useCategory();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    description: "",
    parentCategory: "" // Empty string means Main Category
  });

  // Filter out to only top-level categories for the dropdown selector
  const mainCategories = categories?.filter(c => c.parentCategory === null) || [];

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditMode(true);
      setFormData({
        _id: category._id,
        name: category.name,
        description: category.description || "",
        parentCategory: category.parentCategory?._id || category.parentCategory || ""
      });
    } else {
      setEditMode(false);
      setFormData({
        _id: "",
        name: "",
        description: "",
        parentCategory: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setIsSubmitting(true);
      const payload = {
        name: formData.name,
        description: formData.description,
        parentCategory: formData.parentCategory || null
      };

      const config = {
        headers: { Authorization: `Bearer ${authToken}` }
      };

      if (editMode) {
        await axios.put(`${SERVER_URL}/api/category/${formData._id}`, payload, config);
        swalWithCustomConfiguration.fire("Updated", "Category updated successfully", "success");
      } else {
        await axios.post(`${SERVER_URL}/api/category`, payload, config);
        swalWithCustomConfiguration.fire("Created", "Category created successfully", "success");
      }

      handleCloseModal();
      fetchCategories();
    } catch (error) {
      console.error(error);
      swalWithCustomConfiguration.fire(
        "Error", 
        error.response?.data?.message || "Something went wrong", 
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    swalWithCustomConfiguration.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${SERVER_URL}/api/category/${id}`, {
            headers: { Authorization: `Bearer ${authToken}` }
          });
          swalWithCustomConfiguration.fire("Deleted!", "Category has been deleted.", "success");
          fetchCategories();
        } catch (error) {
          swalWithCustomConfiguration.fire(
            "Validation Error", 
            error.response?.data?.message || "Failed to delete category.", 
            "error"
          );
        }
      }
    });
  };

  // Build a display list mapping parent -> child
  const displayList = [];
  categories?.forEach(cat => {
    if (cat.parentCategory === null) {
      displayList.push({ ...cat, type: 'main' });
      // Find its children
      const children = categories.filter(sub => sub.parentCategory?._id === cat._id || sub.parentCategory === cat._id);
      children.forEach(child => {
        displayList.push({ ...child, type: 'sub', parentName: cat.name });
      });
    }
  });

  const filteredList = displayList.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-sm border p-8 animate-fade-in-up transition-colors`}>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Category Management</h2>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Manage dynamic taxonomy and catalogue hierarchy.</p>
        </div>

        <div className="flex w-full md:w-auto gap-4">
          <div className="relative flex-1 md:w-64">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Search category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                theme === 'dark' ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900'
              }`}
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold transition-transform hover:-translate-y-0.5"
          >
            <MdAdd className="text-xl" /> New Category
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-100'} border-b text-xs uppercase tracking-wider text-gray-500 font-bold`}>
              <th className="p-4 rounded-tl-xl">Category Name</th>
              <th className="p-4">Type / Parent</th>
              <th className="p-4">Description</th>
              <th className="p-4 text-right rounded-tr-xl">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700/60' : 'divide-gray-100/60'} ${loading ? 'opacity-50 pointer-events-none' : ''} transition-opacity duration-200`}>
            {loading ? (
              <tr><td colSpan="4" className="p-8 text-center text-gray-400">Loading categories...</td></tr>
            ) : filteredList.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-gray-400">No categories found.</td></tr>
            ) : (
              filteredList.map((cat) => (
                <tr key={cat._id} className={`${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50/50'} transition-colors`}>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       {cat.type === 'sub' && <span className="text-gray-400 text-lg ml-2">↳</span>}
                       <div className={`font-bold capitalize ${cat.type === 'sub' && 'ml-2'} ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{cat.name}</div>
                    </div>
                  </td>
                  <td className="p-4">
                     {cat.type === 'main' ? (
                       <span className="px-3 py-1 rounded-full text-xs font-bold inline-block border bg-indigo-50 text-indigo-600 border-indigo-100">Main Category</span>
                     ) : (
                       <span className="px-3 py-1 rounded-full text-xs font-bold inline-block border bg-purple-50 text-purple-600 border-purple-100">Sub: {typeof cat.parentCategory === 'object' ? cat.parentCategory?.name : cat.parentName}</span>
                     )}
                  </td>
                  <td className="p-4">
                    <div className={`text-sm max-w-sm truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{cat.description || "—"}</div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button onClick={() => handleOpenModal(cat)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                         <MdEdit className="text-xl" />
                       </button>
                       <button onClick={() => handleDelete(cat._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                         <MdDelete className="text-xl" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className={`w-full max-w-md rounded-2xl p-6 shadow-xl ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
              <h3 className="text-xl font-bold mb-4">{editMode ? 'Edit Category' : 'Create Category'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-semibold mb-1">Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full p-3 border rounded-xl outline-none ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`} 
                      placeholder="e.g. Electronics"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-semibold mb-1">Parent Category</label>
                    <select 
                      name="parentCategory"
                      value={formData.parentCategory}
                      onChange={handleChange}
                      disabled={editMode && formData.parentCategory !== ""}
                      className={`w-full p-3 border rounded-xl outline-none ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`} 
                    >
                      <option value="">None (Make it a Main Category)</option>
                      {mainCategories.map(cat => (
                         <option key={cat._id} value={cat._id} disabled={cat._id === formData._id}>{cat.name.toCapitalize()}</option>
                      ))}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-semibold mb-1">Description (Optional)</label>
                    <textarea 
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className={`w-full p-3 border rounded-xl outline-none min-h-[100px] resize-y ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`} 
                      placeholder="About this category..."
                    />
                 </div>
                 <div className="flex justify-end gap-3 mt-6">
                    <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 font-bold rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
                       {isSubmitting ? 'Saving...' : 'Save Category'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;

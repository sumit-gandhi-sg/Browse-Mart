import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../Context/authContext";
import { useTheme } from "../../../Context/themeContext";
import { MdSearch } from "react-icons/md";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const AdminProductList = () => {
  const { authToken } = useAuth();
  const { theme } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${SERVER_URL}/api/admin/products?page=${page}&limit=10&search=${searchTerm}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (data.success) {
        setProducts(data.products);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      const delayDebounceFn = setTimeout(() => {
        fetchProducts();
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [authToken, page, searchTerm]);

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-sm border p-8 animate-fade-in-up transition-colors`}>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Global Inventory</h2>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Platform-wide overview of all products and sellers.</p>
        </div>

        <div className="relative w-full md:w-96">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          <input
            type="text"
            placeholder="Search products by title..."
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
              <th className="p-4 rounded-tl-xl w-16">Preview</th>
              <th className="p-4">Product Specs</th>
              <th className="p-4">Business / Seller</th>
              <th className="p-4">Pricing</th>
              <th className="p-4 text-right rounded-tr-xl">Inventory</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700/60' : 'divide-gray-100/60'} ${loading ? 'opacity-50 pointer-events-none' : ''} transition-opacity duration-200`}>
            {loading && products.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-400">Loading catalog...</td></tr>
            ) : !loading && products.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-400">No products match your search.</td></tr>
            ) : (
              products.map((t) => (
                <tr key={t._id} className={`${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50/50'} transition-colors`}>
                  <td className="p-4">
                    <img src={t.image?.[0] || 'https://via.placeholder.com/64'} alt={t.name} className={`w-14 h-14 object-cover rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`} />
                  </td>
                  <td className="p-4">
                    <div className={`font-bold max-w-xs truncate ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`} title={t.name}>{t.name}</div>
                    <div className="text-xs text-gray-400 mt-1 uppercase tracking-widest">{t.category?.name}</div>
                  </td>
                  <td className="p-4">
                    <div className={`font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t.sellerId?.businessName || "Unknown Business"}</div>
                    <div className="text-xs text-blue-500">{t.sellerId?.emailAddress || "N/A"}</div>
                  </td>
                  <td className="p-4">
                    <div className={`font-black ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>₹{t.mrpPrice || t.price || 0}</div>
                    {t.sellingPrice && (t.sellingPrice < (t.mrpPrice || t.price)) && (
                      <div className="text-xs text-emerald-500 font-bold mt-1">Sale: ₹{t.sellingPrice}</div>
                    )}
                  </td>
                  <td className="p-4 text-right">
                     <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block border ${
                       t.stock > 10 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                     }`}>
                       {t.stock} in stock
                     </span>
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

export default AdminProductList;

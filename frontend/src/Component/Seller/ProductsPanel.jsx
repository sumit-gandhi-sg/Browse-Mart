import axios from "axios";
import { Button, Input, SectionTitle, Select, ToggleSwitch } from "../../LIBS";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BiLoaderAlt } from "react-icons/bi";
import { FaTrash, FaSearch, FaBoxOpen, FaChevronLeft, FaChevronRight, FaPen } from "react-icons/fa";
import { useTheme } from "../../Context/themeContext";
import { useAuth } from "../../Context/authContext";
import { formatNumber, productCategory, swalWithCustomConfiguration } from "../../utility/constant";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export const ProductsPanel = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [productArr, setProductArr] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [productCount, setProductCount] = useState(null);
  const [productRange, setProductRange] = useState({});
  const [isDataFetching, setIsDataFetching] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState("");
  const [filters, setFilters] = useState({});
  const { theme } = useTheme();
  const { authToken } = useAuth();
  let tempSearchQuery = "";
  const visiblePages = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((page) => page >= Math.max(1, currentPage - 1))
    .filter((page) => page <= Math.min(totalPages, currentPage + 1));

  const getAllProduct = async () => {
    setIsDataFetching(true);
    try {
      const response = await axios.get(
        `${SERVER_URL}/api/seller/get-all-product`,
        {
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
            Authorization: `Bearer ${authToken}`,
          },
          params: { filters, page: currentPage, search: searchQuery },
        }
      );
      setProductArr(response?.data?.allProduct);
      setTotalPages(response?.data?.totalPages);
      setProductCount(response?.data?.totalProducts);
      setProductRange({
        startProductIndex: response?.data?.startProductIndex,
        endProductIndex: response?.data?.endProductIndex,
      });
    } catch (error) {
      console.error(error?.response?.data?.message || error.message);
    } finally {
      setIsDataFetching(false);
    }
  };

  const handleFiltersChange = (e) => {
    const { name, value } = e?.target || {};
    setFilters((prev) => {
      return {
        ...prev,
        [name]: value?.toString()?.trim(),
      };
    });
    setCurrentPage(1);
  };

  useEffect(() => {
    getAllProduct();
  }, [authToken, JSON.stringify(filters), currentPage, searchQuery]);

  const handleDeleteProduct = async (productId) => {
    const response = await swalWithCustomConfiguration.fire({
      title: "Delete product?",
      text: "This product will be permanently removed from your inventory.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!response.isConfirmed) return;

    try {
      setDeletingProductId(productId);
      const deleteResponse = await axios.delete(
        `${SERVER_URL}/api/seller/product/${productId}`,
        {
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      setProductArr((prev) => prev.filter((product) => product?._id !== productId));
      setProductCount((prev) => (typeof prev === "number" ? Math.max(prev - 1, 0) : prev));

      await swalWithCustomConfiguration.fire(
        "Deleted",
        deleteResponse?.data?.message || "Product deleted successfully",
        "success"
      );
      await getAllProduct();
    } catch (error) {
      swalWithCustomConfiguration.fire(
        "Delete failed",
        error?.response?.data?.message || "Unable to delete product right now",
        "error"
      );
    } finally {
      setDeletingProductId("");
    }
  };

  return (
    <div className={`w-full max-w-7xl mx-auto overflow-x-hidden ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} h-full transition-all duration-300 pb-12`}>
      <main className="px-2 tablet:px-6 mt-2">
        
        {/* Header */}
        <div className="flex flex-col tablet:flex-row justify-between items-start tablet:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Inventory</h1>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Manage your product catalog</p>
          </div>
          <Link to={"add"}>
            <Button
              className="px-6 py-3 font-bold bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-colors w-full tablet:w-auto"
              btntext="+ Add New Product"
            />
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className={`p-4 tablet:p-5 rounded-2xl border shadow-sm flex flex-col tablet:flex-row items-center gap-4 mb-8 ${theme === 'dark' ? 'bg-gray-800/50 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="relative w-full tablet:flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search Products by name or ID..."
              className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 font-medium focus:ring-4 outline-none transition-all ${
                theme === "dark"
                  ? "bg-gray-900 text-white border-gray-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                  : "bg-gray-50 text-gray-900 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20"
              }`}
              value={searchQuery}
              onChange={(e) => { tempSearchQuery = e?.target?.value; }}
              onKeyDown={(e) => {
                if (e?.key?.toString().toLowerCase() === "enter") {
                  setSearchQuery(tempSearchQuery);
                }
              }}
            />
          </div>

          <Select
            name="category"
            itemArray={productCategory}
            className={`w-full tablet:w-[200px] px-4 py-3 rounded-xl border-2 font-medium cursor-pointer focus:ring-4 outline-none transition-all flex-shrink-0 ${
              theme === "dark"
                ? "bg-gray-900 text-white border-gray-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                : "bg-gray-50 text-gray-900 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20"
            }`}
            displayName="All Categories"
            onChange={handleFiltersChange}
          />
          <Select
            name="productStockStatus"
            itemArray={[
              { id: 1, value: "in stock" },
              { id: 2, value: "low stock" },
              { id: 3, value: "out of stock" },
            ]}
            className={`w-full tablet:w-[200px] px-4 py-3 rounded-xl border-2 font-medium cursor-pointer focus:ring-4 outline-none transition-all flex-shrink-0 ${
              theme === "dark"
                ? "bg-gray-900 text-white border-gray-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                : "bg-gray-50 text-gray-900 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20"
            }`}
            onChange={handleFiltersChange}
            displayName="All Status"
          />
        </div>

        {/* Product Roster TABLE */}
        <div className="relative min-h-[50vh]">
          {isDataFetching ? (
            <div className="flex flex-col items-center justify-center p-20 opacity-50">
               <BiLoaderAlt className="animate-spin text-4xl mb-4 text-indigo-500" />
               <p className="font-bold tracking-widest uppercase">Fetching Inventory...</p>
            </div>
          ) : productArr?.length === 0 ? (
            <div className={`rounded-3xl border p-16 flex flex-col items-center justify-center text-center shadow-sm transition-colors ${theme === "dark" ? "border-gray-800 bg-gray-900 text-gray-400" : "border-gray-200 bg-white text-gray-500"}`}>
               <div className="p-5 bg-indigo-500/10 rounded-full mb-6">
                 <FaBoxOpen className="text-6xl text-indigo-500 opacity-50 relative top-1" />
               </div>
               <h3 className="text-xl font-bold mb-2">No Products Found</h3>
               <span className="text-sm">Adjust your filters or add a new product to your store.</span>
            </div>
          ) : (
            <div className={`w-full max-w-full overflow-hidden rounded-2xl border shadow-lg ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className="w-full overflow-x-auto fancy-scroll">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead className={`text-[11px] uppercase tracking-widest font-bold border-b transition-colors ${theme === 'dark' ? 'bg-gray-800/50 text-gray-500 border-gray-800' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                    <tr>
                      <th className="p-4 pl-6">Product</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4 text-center">Visibility</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y transition-colors ${theme === 'dark' ? 'divide-gray-800/60' : 'divide-gray-100'}`}>
                    {productArr.map((product) => (
                      <tr key={product?._id} className={`transition-colors hover:bg-black/5 dark:hover:bg-white/5`}>
                        <td className="p-4 pl-6 flex items-center gap-4">
                          <img
                            src={product?.image?.[0]}
                            alt={product?.name}
                            className={`w-14 h-14 rounded-lg object-cover shadow-sm border ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}
                          />
                          <div className="min-w-0">
                            <p className={`font-bold leading-tight line-clamp-1 max-w-[250px] ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                              {product?.name}
                            </p>
                            <p className="text-[11px] mt-1 text-gray-500 line-clamp-1 max-w-[250px]" title={product?.description}>
                              {product?.description}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                            {product?.category?.toCapitalize()}
                          </span>
                        </td>
                        <td className={`p-4 font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatNumber(product?.price || product?.mrpPrice)}
                        </td>
                        <td className="p-4">
                           <span className={`text-[11px] font-bold uppercase tracking-widest ${product?.stock > 20 ? "text-green-500" : product?.stock > 0 ? "text-yellow-500" : "text-red-500"}`}>
                             {product?.stock > 20 ? `${product.stock} In Stock` : product?.stock > 0 ? `${product.stock} Low Stock` : "Out of Stock"}
                           </span>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center scale-90">
                            <ToggleSwitch
                              visibiltyState={!product?.isHide}
                              onToggle={async (state) => {
                                try {
                                  await axios.patch(
                                    `${SERVER_URL}/api/seller/product/visibilty-toggle/${product?._id}`,
                                    { state },
                                    { headers: { "Content-Type": "application/json; charset=UTF-8", Authorization: `Bearer ${authToken}` } }
                                  );
                                } catch (error) { console.log(error); }
                              }}
                            />
                          </div>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/seller/products/edit/${product?._id}`}>
                              <Button
                                className={`p-2.5 rounded-lg border-2 inline-flex items-center justify-center transition-all duration-300 ${
                                  theme === "dark" ? "border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-500 bg-indigo-500/10" 
                                                   : "border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 bg-white"
                                }`}
                                btntext=""
                                icon={<FaPen className="text-base" />}
                              />
                            </Link>

                            <Button
                              className={`p-2.5 rounded-lg border-2 inline-flex items-center justify-center transition-all duration-300 disabled:opacity-50 ${
                                theme === "dark" ? "border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500 bg-red-500/10" 
                                                 : "border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 bg-white"
                              }`}
                              btntext=""
                              icon={ deletingProductId === product?._id ? <BiLoaderAlt className="animate-spin text-base" /> : <FaTrash className="text-base" /> }
                              onClick={() => handleDeleteProduct(product?._id)}
                              disabled={deletingProductId === product?._id}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Pagination Component */}
          {productArr?.length > 0 && !isDataFetching && (
            <div className={`mt-8 flex flex-col tablet:flex-row items-center justify-between gap-4 border p-4 rounded-2xl shadow-xl ${theme === "dark" ? "border-gray-700 bg-gray-900/95" : "border-gray-200 bg-white/95"}`}>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Showing <span className="font-bold text-indigo-500 mx-1">{productRange?.startProductIndex}</span> to{" "}
                <span className="font-bold text-indigo-500 mx-1">{productRange?.endProductIndex}</span> of <span className="font-bold mx-1">{productCount}</span> items
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  className={`px-4 py-2 font-bold tracking-wide rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2 ${theme === "dark" ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-gray-100 text-gray-900 hover:bg-gray-200"}`}
                  btntext="Prev"
                  icon={<FaChevronLeft className="text-[10px]" />}
                  onClick={() => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))}
                  disabled={currentPage === 1}
                />

                {currentPage > 2 && (
                  <>
                    <Button
                      className={`px-4 py-2 font-bold rounded-lg transition-colors ${theme === "dark" ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-gray-100 text-gray-900 hover:bg-gray-200"}`}
                      btntext={1}
                      onClick={() => setCurrentPage(1)}
                    />
                    {currentPage > 3 && <span className="px-2 py-2 text-gray-500 font-bold">...</span>}
                  </>
                )}

                {visiblePages.map((page) => (
                  <Button
                    className={`px-4 py-2 font-bold rounded-lg transition-colors ${
                      page === currentPage ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : theme === "dark" ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                    key={page}
                    btntext={page}
                    onClick={() => setCurrentPage(page)}
                  />
                ))}

                {currentPage < totalPages - 1 && (
                  <>
                    {currentPage < totalPages - 2 && <span className="px-2 py-2 text-gray-500 font-bold">...</span>}
                    <Button
                      className={`px-4 py-2 font-bold rounded-lg transition-colors ${theme === "dark" ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-gray-100 text-gray-900 hover:bg-gray-200"}`}
                      btntext={totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                    />
                  </>
                )}

                <Button
                  className={`px-4 py-2 font-bold tracking-wide rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2 ${theme === "dark" ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-gray-100 text-gray-900 hover:bg-gray-200"}`}
                  btntext="Next"
                  icon={<FaChevronRight className="text-[10px]" />}
                  iconPosition="right"
                  onClick={() => { setCurrentPage((prev) => prev < totalPages ? prev + 1 : prev); }}
                  disabled={currentPage === totalPages}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductsPanel;

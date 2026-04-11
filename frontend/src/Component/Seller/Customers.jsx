import axios from "axios";
import { useEffect, useState } from "react";
import { useTheme } from "../../Context/themeContext";
import { useAuth } from "../../Context/authContext";
import { Button, Loader, ServerError } from "../../LIBS";
import { FaUserCircle, FaEnvelope, FaPhone, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const Customers = () => {
  const { theme } = useTheme();
  const { authToken } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [customerCount, setCustomerCount] = useState(0);
  const [customerRange, setCustomerRange] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const visiblePages = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((page) => page >= Math.max(1, currentPage - 1))
    .filter((page) => page <= Math.min(totalPages, currentPage + 1));

  const getSellerCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(`${SERVER_URL}/api/seller/customers`, {
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          Authorization: `Bearer ${authToken}`,
        },
        params: { page: currentPage },
      });

      setCustomers(response?.data?.customers || []);
      setTotalPages(response?.data?.totalPages || 1);
      setCustomerCount(response?.data?.totalCustomers || 0);
      setCustomerRange({
        startCustomerIndex: response?.data?.startCustomerIndex || 0,
        endCustomerIndex: response?.data?.endCustomerIndex || 0,
      });
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Unable to fetch customers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      getSellerCustomers();
    }
  }, [authToken, currentPage]);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <ServerError />;
  }

  return (
    <div className={`w-full max-w-7xl mx-auto overflow-x-hidden ${theme === "dark" ? "text-white" : "text-gray-900"} transition-all duration-300 pb-12`}>
      <main className="px-2 tablet:px-6">
        
        {/* Header */}
        <div className="flex flex-col mb-8 mt-2">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Customers</h1>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Review customer demographics and order history</p>
        </div>

        {/* Customer Roster */}
        <div className="relative min-h-[50vh]">
          {customers.length === 0 ? (
            <div className={`rounded-3xl border p-16 flex flex-col items-center justify-center text-center shadow-sm transition-colors ${theme === "dark" ? "border-gray-800 bg-gray-900 text-gray-400" : "border-gray-200 bg-white text-gray-500"}`}>
               <div className="p-5 bg-indigo-500/10 rounded-full mb-6">
                 <FaUserCircle className="text-6xl text-indigo-500 opacity-50" />
               </div>
               <h3 className="text-xl font-bold mb-2">No Customers Yet</h3>
               <span className="text-sm">When users place orders on your listings, they will appear here.</span>
            </div>
          ) : (
            <div className={`w-full max-w-full overflow-hidden rounded-2xl border shadow-lg ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className="w-full overflow-x-auto fancy-scroll">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead className={`text-[11px] uppercase tracking-widest font-bold border-b transition-colors ${theme === 'dark' ? 'bg-gray-800/50 text-gray-500 border-gray-800' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                    <tr>
                      <th className="p-4 pl-6">Customer</th>
                      <th className="p-4">Contact Info</th>
                      <th className="p-4 text-center">Total Orders</th>
                      <th className="p-4">Last Order ID</th>
                      <th className="p-4 pr-6 text-right">Latest Order Date</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y transition-colors ${theme === 'dark' ? 'divide-gray-800/60' : 'divide-gray-100'}`}>
                    {customers.map((customer) => (
                      <tr key={customer?._id} className={`transition-colors hover:bg-black/5 dark:hover:bg-white/5`}>
                        <td className="p-4 pl-6 flex items-center gap-4">
                          <div className="h-10 w-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
                            {customer?.name ? customer.name.charAt(0).toUpperCase() : <FaUserCircle />}
                          </div>
                          <div className="min-w-0">
                            <p className={`font-bold leading-tight line-clamp-1 max-w-[200px] ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                              {customer?.name || "Unknown Customer"}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className={`flex flex-col gap-1 text-xs font-mono ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            <div className="flex items-center gap-2">
                              <FaEnvelope className="opacity-60" />
                              <span className="truncate">{customer?.email || "No email"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaPhone className="opacity-60" />
                              <span>{customer?.phoneNumber || "No phone"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center pb-5 pt-5">
                          <span className={`px-4 py-1.5 rounded-full text-sm font-black shadow-sm ${theme === 'dark' ? 'bg-gray-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                            {customer?.totalOrders || 0}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`font-mono text-sm tracking-tighter uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {customer?.lastOrderId ? `#${customer.lastOrderId}` : "-"}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {customer?.lastOrderDate ? new Date(customer?.lastOrderDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'}) : "Never"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination Component */}
          {customers.length > 0 && (
            <div className={`mt-8 flex flex-col tablet:flex-row items-center justify-between gap-4 border p-4 rounded-2xl shadow-xl ${theme === "dark" ? "border-gray-700 bg-gray-900/95" : "border-gray-200 bg-white/95"}`}>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Showing <span className="font-bold text-indigo-500 mx-1">{customerRange?.startCustomerIndex}</span> to{" "}
                <span className="font-bold text-indigo-500 mx-1">{customerRange?.endCustomerIndex}</span> of <span className="font-bold mx-1">{customerCount}</span> customers
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

export default Customers;

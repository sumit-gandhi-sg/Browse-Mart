import axios from "axios";
import { useEffect, useState } from "react";
import { useTheme } from "../../Context/themeContext";
import { useAuth } from "../../Context/authContext";
import { Button, Loader, ServerError } from "../../LIBS";
import { customToast, formatNumber, orderStatus } from "../../utility/constant";
import { FaBoxOpen, FaUser, FaTruck, FaMapMarkerAlt, FaCreditCard } from "react-icons/fa";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const Orders = () => {
  const { theme } = useTheme();
  const { authToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [orderCount, setOrderCount] = useState(0);
  const [orderRange, setOrderRange] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState("");
  const [error, setError] = useState(null);
  const visiblePages = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((page) => page >= Math.max(1, currentPage - 1))
    .filter((page) => page <= Math.min(totalPages, currentPage + 1));
  const isOrderStatusLocked = (status) =>
    ["delivered", "cancelled"].includes(status);

  const getSellerOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(`${SERVER_URL}/api/seller/orders`, {
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          Authorization: `Bearer ${authToken}`,
        },
        params: {
          page: currentPage,
        },
      });

      setOrders(response?.data?.orders || []);
      setTotalPages(response?.data?.totalPages || 1);
      setOrderCount(response?.data?.totalOrders || 0);
      setOrderRange({
        startOrderIndex: response?.data?.startOrderIndex || 0,
        endOrderIndex: response?.data?.endOrderIndex || 0,
      });
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      getSellerOrders();
    }
  }, [authToken, currentPage]);

  const handleStatusChange = async (orderId, nextStatus) => {
    try {
      setUpdatingOrderId(orderId);

      const response = await axios.patch(
        `${SERVER_URL}/api/seller/orders/${orderId}/status`,
        { orderStatus: nextStatus },
        {
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      setOrders((prev) =>
        prev.map((order) =>
          order?._id === orderId
            ? { ...order, orderStatus: response?.data?.order?.orderStatus }
            : order
        )
      );

      customToast(theme).fire({
        icon: "success",
        title: response?.data?.message || "Order status updated successfully",
      });
    } catch (updateError) {
      customToast(theme).fire({
        icon: "error",
        title:
          updateError?.response?.data?.message ||
          "Unable to update order status",
      });
    } finally {
      setUpdatingOrderId("");
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <ServerError />;
  }

  return (
    <div
      className={`w-full max-w-7xl mx-auto overflow-x-hidden ${
        theme === "dark" ? "text-white" : "text-gray-900"
      } transition-all duration-300 pb-10`}
    >
      <div className="flex flex-col tablet:flex-row items-center justify-between mb-8 gap-4 px-2">
        <div className="w-full">
          <h1 className="text-3xl font-extrabold tracking-tight">Order Management</h1>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
            Review orders placed for your products and update shipping statuses
          </p>
        </div>
      </div>

      {!orders.length ? (
        <div className={`rounded-2xl border p-12 mx-2 flex flex-col items-center justify-center text-center text-lg font-medium shadow-sm transition-colors ${theme === "dark" ? "border-gray-800 bg-gray-900 text-gray-400" : "border-gray-200 bg-white text-gray-500"}`}>
          <div className="p-4 bg-indigo-500/10 rounded-full mb-4">
             <FaBoxOpen className="text-5xl text-indigo-500" />
          </div>
          No orders found for your products yet. <br />
          <span className="text-sm font-normal mt-2 opacity-70">When customers place orders, they will appear here.</span>
        </div>
      ) : (
        <div className="space-y-8 pb-24 px-2 relative min-h-[50vh]">
          {orders.map((order) => {
            const isLocked = isOrderStatusLocked(order?.orderStatus);
            return (
            <div key={order?._id || order?.orderId} className={`w-full rounded-[20px] border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md ${theme === "dark" ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white"}`}>
              
              {/* CARD HEADER */}
              <div className={`p-5 tablet:p-7 border-b flex flex-col tablet:flex-row gap-5 justify-between ${theme === "dark" ? "border-gray-800 bg-gray-800/20" : "border-gray-100 bg-gray-50/50"}`}>
                <div className="flex flex-col gap-3 justify-center">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="font-black text-xl tablet:text-2xl flex items-center gap-2">
                      <FaBoxOpen className="text-indigo-500" /> #{order?.orderId?.toUpperCase()}
                    </h2>
                    <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border shadow-sm ${
                      order?.orderStatus === 'cancelled' ? 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-500/20 dark:text-red-400' :
                      order?.orderStatus === 'delivered' ? 'bg-green-500/10 text-green-600 border-green-200 dark:border-green-500/20 dark:text-green-400' :
                      'bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-500/20 dark:text-indigo-400'
                    }`}>
                      {order?.orderStatus}
                    </span>
                  </div>
                  <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold tracking-wide ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span>{new Date(order?.orderDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="hidden tablet:inline">•</span>
                    <span className="flex items-center gap-1.5"><FaCreditCard className="opacity-70 text-base" /> {order?.paymentStatus?.toCapitalize()} ({order?.paymentMethod?.toCapitalize()})</span>
                  </div>
                </div>

                {/* STATUS CONTROLLER */}
                <div className={`flex flex-col tablet:items-end gap-2 p-4 tablet:p-0 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 tablet:bg-transparent' : 'bg-white border tablet:border-0 border-gray-200 tablet:bg-transparent'}`}>
                   <label htmlFor={`order-status-${order?._id}`} className={`text-[10px] uppercase tracking-widest font-black ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                      Update Order Status
                   </label>
                   <div className="flex items-center gap-2 w-full tablet:w-auto">
                     <select
                        id={`order-status-${order?._id}`}
                        value={order?.orderStatus}
                        disabled={updatingOrderId === order?._id || isLocked}
                        onChange={(e) => handleStatusChange(order?._id, e?.target?.value)}
                        className={`flex-1 tablet:w-[200px] rounded-lg border-[3px] px-4 py-2.5 text-sm font-bold outline-none transition-colors shadow-sm ${
                          theme === "dark" 
                            ? "border-gray-700 bg-gray-800 text-white focus:border-indigo-500 hover:border-gray-600" 
                            : "border-gray-200 bg-white text-gray-900 focus:border-indigo-500 hover:border-gray-300"
                        } ${updatingOrderId === order?._id || isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        {orderStatus.map((status) => (
                          <option key={status} value={status}>{status.toCapitalize()}</option>
                        ))}
                     </select>
                   </div>
                   {isLocked && <p className="text-xs text-red-500 font-bold tracking-wide mt-1">Final status completely locked</p>}
                </div>
              </div>

              {/* TWO COLUMN CUSTOMER & SHIPPING */}
              <div className="p-5 tablet:p-7 grid grid-cols-1 tablet:grid-cols-2 gap-6">
                
                {/* CUSTOMER PANEL */}
                <div className={`p-5 rounded-2xl border flex items-start gap-5 transition-colors ${theme === 'dark' ? 'bg-gray-800/40 border-gray-800 hover:bg-gray-800/60' : 'bg-gray-50 border-gray-100 hover:bg-indigo-50/30'}`}>
                   <div className={`p-3.5 rounded-full shadow-sm flex-shrink-0 ${theme === 'dark' ? 'bg-gray-700 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                      <FaUser className="text-lg" />
                   </div>
                   <div className="flex flex-col min-w-0">
                      <h3 className={`text-[11px] tracking-widest uppercase font-black mb-2.5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Customer Summary</h3>
                      <p className={`font-black text-lg leading-tight truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{order?.customerDetails?.name}</p>
                      <p className={`text-sm tracking-wide truncate mt-1.5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{order?.customerDetails?.email}</p>
                      <p className={`text-sm tracking-widest truncate font-mono mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{order?.customerDetails?.phoneNumber}</p>
                   </div>
                </div>

                {/* SHIPPING PANEL */}
                <div className={`p-5 rounded-2xl border flex items-start gap-5 transition-colors ${theme === 'dark' ? 'bg-gray-800/40 border-gray-800 hover:bg-gray-800/60' : 'bg-gray-50 border-gray-100 hover:bg-green-50/30'}`}>
                   <div className={`p-3.5 rounded-full shadow-sm flex-shrink-0 ${theme === 'dark' ? 'bg-gray-700 text-green-400' : 'bg-green-100 text-green-600'}`}>
                      <FaTruck className="text-lg" />
                   </div>
                   <div className="flex flex-col min-w-0 flex-1">
                      <h3 className={`text-[11px] tracking-widest uppercase font-black mb-2.5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Shipping Destination</h3>
                      <p className={`text-[15px] font-medium leading-relaxed ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                        {order?.shippingAddress?.addressLine1}
                        {order?.shippingAddress?.addressLine2 ? <>, {order?.shippingAddress?.addressLine2}</> : null}
                      </p>
                      <p className={`text-sm mt-2 flex items-start gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <FaMapMarkerAlt className="mt-1 flex-shrink-0 opacity-70" />
                        <span className="leading-relaxed">
                          {[order?.shippingAddress?.city, order?.shippingAddress?.state, order?.shippingAddress?.pinCode].filter(Boolean).join(", ")}
                          <br />
                          {order?.shippingAddress?.country}
                        </span>
                      </p>
                   </div>
                </div>

              </div>

              {/* PRODUCT LIST AS STACK CARDS */}
              <div className="px-5 pb-5 tablet:px-7 tablet:pb-7">
                <h3 className={`text-[11px] tracking-widest uppercase font-black mb-3 ml-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Ordered Products</h3>
                <div className={`border rounded-[16px] flex flex-col divide-y flex-1 max-h-[400px] overflow-y-auto fancy-scroll shadow-inner ${theme === 'dark' ? 'border-gray-800 divide-gray-800 bg-gray-950/50' : 'border-gray-200 divide-gray-100 bg-white'}`}>
                  {order?.orderItems?.map((item) => (
                    <div key={item?.productId} className={`grid grid-cols-1 tablet:grid-cols-4 gap-4 p-5 items-center transition-colors hover:bg-black/5 dark:hover:bg-white/5`}>
                      <div className="flex gap-4 col-span-1 tablet:col-span-2 items-center min-w-0">
                        <div className={`h-16 w-16 tablet:h-[84px] tablet:w-[84px] flex-shrink-0 rounded-xl overflow-hidden border shadow-sm p-1 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                          <img src={item?.productImage} className="w-full h-full object-cover rounded-lg" alt={item?.productName} />
                        </div>
                        <div className="min-w-0 pr-4">
                           <p className={`font-bold text-[15px] tablet:text-base line-clamp-2 leading-snug ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{item?.productName}</p>
                           <p className={`text-xs line-clamp-1 mt-1.5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{item?.productDescription}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 tablet:contents gap-2 text-sm tablet:text-base border-t border-gray-100 dark:border-gray-800 pt-4 tablet:border-0 tablet:pt-0 mt-2 tablet:mt-0">
                        <div className="flex flex-col tablet:block items-center tablet:text-center">
                           <span className="tablet:hidden text-[10px] tracking-widest uppercase font-black text-gray-400 mb-1">Price x Qty</span>
                           <span className={`font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{formatNumber(item?.sellingPrice || item?.price || item?.mrpPrice)} <span className="text-gray-400 text-xs mx-1 font-normal">x</span> {item?.quantity}</span>
                        </div>
                        <div className="flex flex-col tablet:flex items-end tablet:justify-end">
                           <span className="tablet:hidden text-[10px] tracking-widest uppercase font-black text-gray-400 mb-1">Subtotal</span>
                           <span className={`font-black tracking-tight text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'} pr-0 tablet:pr-4`}>{formatNumber((item?.sellingPrice || item?.price || item?.mrpPrice || 0) * (item?.quantity || 0))}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD FOOTER - GRAND TOTAL */}
              <div className={`p-5 tablet:p-7 border-t flex flex-wrap justify-end items-center gap-6 ${theme === 'dark' ? 'border-gray-800 bg-gray-800/30' : 'border-gray-100 bg-gray-50'}`}>
                 <span className={`tracking-[0.2em] uppercase text-xs font-black ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Order Final Value</span>
                 <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">{formatNumber(order?.grandTotal)}</span>
              </div>
            </div>
            );
          })}

          <div
            className={`absolute bottom-4 left-2 right-2 z-20 flex flex-col tablet:flex-row items-center justify-between gap-4 border p-4 rounded-2xl shadow-xl ${
              theme === "dark"
                ? "border-gray-700 bg-gray-900/95"
                : "border-gray-200 bg-white/95"
            } backdrop-blur-md`}
          >
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Showing <span className="font-bold text-indigo-500 mx-1">{orderRange?.startOrderIndex}</span> to{" "}
              <span className="font-bold text-indigo-500 mx-1">{orderRange?.endOrderIndex}</span> of <span className="font-bold mx-1">{orderCount}</span> orders
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                className={`px-4 py-2 font-bold tracking-wide rounded-lg disabled:opacity-50 transition-colors ${
                  theme === "dark"
                    ? "bg-gray-800 text-white hover:bg-gray-700"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
                btntext="Prev"
                onClick={() =>
                  setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))
                }
                disabled={currentPage === 1}
              />

              {currentPage > 2 && (
                <>
                  <Button
                    className={`px-4 py-2 font-bold rounded-lg transition-colors ${
                      theme === "dark"
                        ? "bg-gray-800 text-white hover:bg-gray-700"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                    btntext={1}
                    onClick={() => setCurrentPage(1)}
                  />
                  {currentPage > 3 && <span className="px-2 py-2 text-gray-500 font-bold">...</span>}
                </>
              )}

              {visiblePages.map((page) => (
                <Button
                  className={`px-4 py-2 font-bold rounded-lg transition-colors ${
                    page === currentPage
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                      : theme === "dark"
                      ? "bg-gray-800 text-white hover:bg-gray-700"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                  key={page}
                  btntext={page}
                  onClick={() => setCurrentPage(page)}
                />
              ))}

              {currentPage < totalPages - 1 && (
                <>
                  {currentPage < totalPages - 2 && (
                    <span className="px-2 py-2 text-gray-500 font-bold">...</span>
                  )}
                  <Button
                    className={`px-4 py-2 font-bold rounded-lg transition-colors ${
                      theme === "dark"
                        ? "bg-gray-800 text-white hover:bg-gray-700"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                    btntext={totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                  />
                </>
              )}

              <Button
                className={`px-4 py-2 font-bold tracking-wide rounded-lg disabled:opacity-50 transition-colors ${
                  theme === "dark"
                    ? "bg-gray-800 text-white hover:bg-gray-700"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
                btntext="Next"
                onClick={() => {
                  setCurrentPage((prev) =>
                    prev < totalPages ? prev + 1 : prev
                  );
                }}
                disabled={currentPage === totalPages}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Orders;

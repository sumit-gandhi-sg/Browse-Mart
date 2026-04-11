import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader, ServerError } from "../../LIBS";
import { formatNumber, orderStatus } from "../../utility/constant";
import { FaCheck, FaBoxOpen, FaTruck, FaUser, FaFileInvoiceDollar, FaCalendarAlt } from "react-icons/fa";
import { useTheme } from "../../Context/themeContext";
import { useAuth } from "../../Context/authContext";
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const Orderpage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [isOrderDataFetching, setIsOrderDataFetching] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  const { authToken } = useAuth();
  const isCancelled = orderDetails?.orderStatus === "cancelled";
  const activeOrderStatus = orderDetails?.orderStatus;
  const visibleOrderStatuses = orderStatus.filter(
    (status) => status !== "cancelled"
  );
  const getOrderDetailsById = async () => {
    setIsOrderDataFetching(true);
    try {
      const response = await axios?.post(
        `${SERVER_URL}/api/order/get-order-details-by-id`,
        {
          orderId: orderId,
        },
        {
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const { data, status } = response;
      if (status === 200) {
        setOrderDetails(data?.filteredOrderDetails);
      }
    } catch (error) {
      const { data, status } = error?.response || {};
      if (status === 404) {
        setError({ message: data?.message, status: status });
      } else {
        setError({ error: "Internal Server Error", status: 500 });
      }
    } finally {
      setIsOrderDataFetching(false);
    }
  };
  useEffect(() => {
    if (!authToken) navigate("/login");
  }, [authToken, navigate]);
  useEffect(() => {
    getOrderDetailsById();
  }, [orderId]);

  if (isOrderDataFetching) {
    return <Loader />;
  }
  if (!isOrderDataFetching && !orderDetails && !error) {
    return (
      <div className="text-center text-2xl font-semibold text-red-500">
        No Order Found
      </div>
    );
  }
  if (error?.status === 500) return <ServerError />;
  return (
    <div
      className={`min-h-screen w-full px-3 mobile:px-4 tablet:px-6 py-6 tablet:py-10 flex justify-center font-roboto ${
        theme === "dark" ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"
      } transition-colors duration-300`}
    >
      <div className="w-full max-w-6xl flex flex-col gap-6">
        
        {/* HEADER ROW CARD */}
        <div className={`p-5 rounded-2xl border shadow-sm flex flex-col gap-4 tablet:flex-row tablet:items-center justify-between ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <FaBoxOpen className="text-indigo-500 text-3xl" />
              Order {(orderDetails?.orderId || "").toUpperCase()}
            </h1>
            <div className={`flex items-center gap-4 text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <span className="flex items-center gap-1.5">
                <FaCalendarAlt /> 
                {orderDetails?.orderDate ? new Date(orderDetails.orderDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
              </span>
              <span>•</span>
              <span>{orderDetails?.orderItems?.length || 0} Item(s)</span>
            </div>
          </div>
          <div>
            <span className={`px-5 py-2 rounded-full font-bold text-sm border uppercase tracking-wider inline-flex items-center gap-2 ${
               isCancelled ? "bg-red-500/10 text-red-600 border-red-200 dark:border-red-500/20 dark:text-red-400" 
               : activeOrderStatus === 'delivered' ? "bg-green-500/10 text-green-600 border-green-200 dark:border-green-500/20 dark:text-green-400"
               : "bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-500/20 dark:text-indigo-400"
            }`}>
              {isCancelled ? "Cancelled" : activeOrderStatus?.toCapitalize()}
            </span>
          </div>
        </div>

        {/* CANCELLED NOTIFICATION */}
        {isCancelled && (
          <div className={`rounded-xl border p-4 font-medium flex items-center gap-3 ${theme === "dark" ? "border-red-500/20 bg-red-500/10 text-red-300" : "border-red-200 bg-red-50 text-red-700"}`}>
            This order has been cancelled. No further processing will occur.
          </div>
        )}

        {/* TRACKER CARD */}
        {!isCancelled && (
          <div className={`p-6 md:p-8 rounded-2xl border shadow-sm ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className="hidden mt-2 laptop:flex items-start justify-between gap-2 relative">
                {visibleOrderStatuses.map((status, index, arr) => {
                  const isActive =
                    arr.indexOf(activeOrderStatus) >= index &&
                    activeOrderStatus !== "cancelled";
                  const isLastStep = index === arr.length - 1;

                  return (
                    <div key={status} className={`flex ${isLastStep ? "flex-none" : "flex-1"} items-center relative z-10`}>
                      <div className="flex min-w-[120px] flex-col items-center">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full border-[3px] text-sm font-semibold transition-all duration-300 ${
                            isActive
                              ? "border-indigo-600 bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                              : theme === 'dark' ? "border-gray-700 bg-gray-800 text-gray-500" : "border-gray-300 bg-white text-gray-400"
                          }`}
                        >
                          {isActive ? <FaCheck className="text-lg" /> : index + 1}
                        </div>
                        <p
                          className={`mt-4 text-center text-sm font-bold ${
                            isActive ? (theme === 'dark' ? "text-indigo-400" : "text-indigo-700") : (theme === 'dark' ? "text-gray-500" : "text-gray-400")
                          }`}
                        >
                          {status?.toCapitalize()}
                        </p>
                      </div>
                      {!isLastStep && (
                        <div className="flex-1 mx-2 mt-[-36px]">
                          <div className={`h-1.5 rounded-full w-full ${arr.indexOf(activeOrderStatus) > index ? "bg-indigo-600" : (theme === 'dark' ? "bg-gray-800" : "bg-gray-200")}`} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* MOBILE TRACKER */}
              <div className="laptop:hidden flex flex-col gap-6 mt-2 relative">
                {visibleOrderStatuses.map((status, index, arr) => {
                  const isActive = arr.indexOf(activeOrderStatus) >= index;
                  const isLastStep = index === arr.length - 1;

                  return (
                    <div key={status} className="flex items-start gap-4 relative z-10">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold z-10 ${
                            isActive
                              ? "border-indigo-600 bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                              : theme === 'dark' ? "border-gray-700 bg-gray-800 text-gray-500" : "border-gray-300 bg-white text-gray-400"
                          }`}
                        >
                          {isActive ? <FaCheck /> : index + 1}
                        </div>
                        {!isLastStep && (
                           <div className={`absolute top-10 bottom-[-24px] w-1 rounded-full ${arr.indexOf(activeOrderStatus) > index ? "bg-indigo-600" : (theme === 'dark' ? "bg-gray-800" : "bg-gray-200")}`} />
                        )}
                      </div>
                      <div className="pt-2 pb-4">
                        <p className={`text-base font-bold ${isActive ? (theme === 'dark' ? "text-indigo-400" : "text-indigo-700") : (theme === 'dark' ? "text-gray-500" : "text-gray-400")}`}>
                          {status?.toCapitalize()}
                        </p>
                        <p className={`text-xs font-medium mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          {isActive ? "Completed" : "Pending"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
          </div>
        )}

        {/* MAIN SPLIT LAYOUT */}
        <div className="flex flex-col laptop:flex-row gap-6 items-start">
          
          {/* LEFT COLUMN: DETAILS & ITEMS */}
          <div className="flex-1 w-full flex flex-col gap-6">
            
            <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6 w-full">
              {/* CUSTOMER CARD */}
              <div className={`p-6 rounded-2xl border shadow-sm flex flex-col gap-4 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <h2 className={`text-lg font-bold flex items-center gap-2 border-b pb-4 ${theme === 'dark' ? 'border-gray-800 text-gray-200' : 'border-gray-100 text-gray-800'}`}>
                  <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><FaUser /></div>
                  Customer Details
                </h2>
                <div className="flex flex-col gap-4 font-medium">
                  <p className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{orderDetails?.customerDetail?.customerName?.toCapitalize()}</p>
                  <div className="flex flex-col">
                    <span className={`text-xs uppercase tracking-wider font-bold mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Email Address</span>
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{orderDetails?.customerDetail?.customerEmail || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-xs uppercase tracking-wider font-bold mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Phone Number</span>
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{orderDetails?.customerDetail?.customerPhoneNumber || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* SHIPPING CARD */}
              <div className={`p-6 rounded-2xl border shadow-sm flex flex-col gap-4 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <h2 className={`text-lg font-bold flex items-center gap-2 border-b pb-4 ${theme === 'dark' ? 'border-gray-800 text-gray-200' : 'border-gray-100 text-gray-800'}`}>
                  <div className="p-2 bg-green-500/10 text-green-500 rounded-lg"><FaTruck /></div>
                  Shipping Address
                </h2>
                <div className="flex flex-col gap-3 font-medium">
                  <p className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{orderDetails?.shippingAddress?.customerName?.toCapitalize() || orderDetails?.customerDetail?.customerName?.toCapitalize()}</p>
                  <p className={`leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {orderDetails?.shippingAddress &&
                      Object.values(orderDetails.shippingAddress)
                        .filter(Boolean)
                        .map((item, index, arr) => (
                          <span key={index}>
                            {item.toString().toCapitalize()}
                            {index < arr.length - 1 ? ", " : ""}
                          </span>
                        ))}
                  </p>
                </div>
              </div>
            </div>

            {/* ORDER ITEMS CARD */}
            <div className={`rounded-2xl border shadow-sm overflow-hidden flex flex-col ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className={`p-5 tablet:p-6 border-b flex flex-col gap-2 ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
                <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Items Ordered</h2>
                <p className={`text-sm tracking-wide ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {orderDetails?.orderItems?.length} items • {orderDetails?.orderItems?.reduce((totalQty, item) => (totalQty += item?.quantity), 0)} total quantity
                </p>
              </div>

              {/* TABLE HEADER (HIDDEN ON MOBILE) */}
              <div className={`hidden tablet:grid grid-cols-5 p-4 text-xs tracking-wider uppercase font-bold border-b ${theme === "dark" ? "bg-gray-950/50 border-gray-800 text-gray-500" : "bg-gray-50 border-gray-100 text-gray-400"}`}>
                <span className="col-span-2 pl-2">Product Details</span>
                <span className="col-span-1 text-center">Unit Price</span>
                <span className="col-span-1 text-center">Quantity</span>
                <span className="col-span-1 border-gray-200 text-right pr-2">Total Amount</span>
              </div>

              <div className="flex flex-col divide-y flex-1 overflow-y-auto fancy-scroll max-h-[800px] bg-transparent">
                {orderDetails?.orderItems?.map((product) => (
                  <div
                    className={`grid grid-cols-1 tablet:grid-cols-5 gap-4 p-5 tablet:items-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${theme === 'dark' ? 'divide-gray-800' : 'divide-gray-100'}`}
                    key={product?.productId || product?.id || product?._id}
                  >
                    <div className="flex gap-4 col-span-1 tablet:col-span-2 items-center">
                      <div className={`h-24 w-24 flex-shrink-0 cursor-pointer rounded-xl overflow-hidden border p-1 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} onClick={() => navigate(`/product/${product?.productId || product?.id || product?._id}`)}>
                        <img
                          src={product?.productImage}
                          className="w-full h-full object-cover rounded-lg"
                          alt={product?.productName}
                        />
                      </div>
                      <p className={`font-bold line-clamp-2 cursor-pointer hover:underline ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`} onClick={() => navigate(`/product/${product?.productId || product?.id || product?._id}`)}>
                        {product?.productName}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 tablet:contents gap-2 items-center text-sm tablet:text-base border-t pt-4 tablet:border-0 tablet:pt-0 mt-2 tablet:mt-0">
                      <div className="flex flex-col tablet:block items-center tablet:text-center">
                        <span className="tablet:hidden text-xs uppercase font-bold text-gray-400 mb-1">Unit Price</span>
                        <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{formatNumber(product?.price)}</span>
                      </div>
                      <div className="flex flex-col tablet:block items-center tablet:text-center">
                        <span className="tablet:hidden text-xs uppercase font-bold text-gray-400 mb-1">Quantity</span>
                        <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{product?.quantity}</span>
                      </div>
                      <div className="flex flex-col tablet:flex items-end tablet:justify-end">
                        <span className="tablet:hidden text-xs uppercase font-bold text-gray-400 mb-1">Total</span>
                        <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} pr-0 tablet:pr-2`}>{formatNumber(product?.price * product?.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY FIXED */}
          <div className="w-full laptop:w-[380px] flex-shrink-0 flex flex-col gap-6">
            <div className={`p-6 rounded-2xl border shadow-sm laptop:sticky laptop:top-24 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h2 className={`text-xl font-bold flex items-center gap-3 border-b pb-5 mb-5 ${theme === 'dark' ? 'border-gray-800 text-white' : 'border-gray-100 text-gray-900'}`}>
                 <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg"><FaFileInvoiceDollar /></div>
                 Order Summary
              </h2>
              
              <div className="flex flex-col gap-4 text-base">
                <div className="flex justify-between items-center">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Subtotal</span>
                  <span className={`font-bold tracking-wide ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                    {formatNumber(orderDetails?.totalMrpPrice)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Discount</span>
                  <span className="font-bold tracking-wide text-green-500">
                    -{formatNumber(orderDetails?.totalDiscount || 0)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Shipping Calculation</span>
                  <span className={`font-bold tracking-wide flex items-center gap-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                    {orderDetails?.shippingCharge === 0 ? <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-500 uppercase text-xs tracking-widest font-black">Free</span> : formatNumber(orderDetails?.shippingCharge)}
                  </span>
                </div>
              </div>

              <div className={`mt-6 pt-5 border-t-2 border-dashed flex items-center justify-between ${theme === 'dark' ? 'border-gray-800 text-white' : 'border-gray-200 text-gray-900'}`}>
                <span className="text-lg font-bold uppercase tracking-wide">Grand Total</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {formatNumber(orderDetails?.grandTotal)}
                </span>
              </div>
              
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Orderpage;

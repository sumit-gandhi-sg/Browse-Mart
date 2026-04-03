import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader, ServerError } from "../../LIBS";
import { formatNumber, orderStatus } from "../../utility/constant";
import { FaCheck } from "react-icons/fa";
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
      className={`min-h-screen w-full px-3 small-device:px-4 tablet:px-6 flex justify-center font-roboto ${
        theme === "dark" ? " bg-gray-900 text-white" : "bg-white text-gray-900"
      } transition-all duration-300`}
    >
      <div className="my-6 w-full max-w-6xl border-2 h-min border-gray-300 rounded-lg font-roboto overflow-hidden">
        <div className="border-b-2 border-gray-300 p-3 flex flex-wrap gap-3">
          <span className=" font-medium text-xl text-gray-600">
            Order Details
          </span>
          <span>{orderDetails?.orderDate}</span>
          <span className="">{orderDetails?.orderItems?.length} Products</span>
          {isCancelled && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-600">
              Cancelled
            </span>
          )}
        </div>
        <div className="p-2 flex flex-col gap-3">
          {isCancelled && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              This order has been cancelled. No further processing will happen
              for this order.
            </div>
          )}
          <div className="border-gray-300 w-full grid grid-cols-1 laptop:grid-cols-3 rounded-lg overflow-hidden border-2">
            <div className="customer-detail border-b-2 laptop:border-b-0 laptop:border-r-2 border-gray-300 ">
              <h2 className="heading text-lg font-semibold text-gray-400 border-b-2 border-gray-300 p-2">
                Customer Details
              </h2>
              <div className="detail-div p-3">
                <p className="text-lg font-medium">
                  {orderDetails?.customerDetail?.customerName?.toCapitalize()}
                </p>
                <p>
                  {orderDetails?.shippingAddress &&
                    Object.values(orderDetails.shippingAddress)
                      .filter(Boolean) // Remove falsy values (e.g., null, undefined, empty strings)
                      .map((item, index, arr) => (
                        <span key={index}>
                          {item.toString().toCapitalize()}
                          {index < arr.length - 1 ? ", " : ""}
                        </span>
                      ))}
                </p>

                <div className="flex flex-col gap-1">
                  <span className="text-gray-400">Email</span>
                  <span>
                    {orderDetails?.customerDetail?.customerEmail ||
                      "default@gmail.com"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-400">Phone No</span>
                  <span>
                    {orderDetails?.customerDetail?.customerPhoneNumber ||
                      "123456789"}
                  </span>
                </div>
              </div>
            </div>
            <div className="shipping-detail border-b-2 laptop:border-b-0 laptop:border-r-2 border-gray-300">
              <h2 className="heading text-lg font-semibold text-gray-400 border-b-2 border-gray-300 p-2">
                Shipping Details
              </h2>
              <div className="detail-div p-3">
                <p className="text-lg font-medium">
                  {orderDetails?.customerDetail?.customerName?.toCapitalize()}
                </p>
                <p>
                  {orderDetails?.shippingAddress &&
                    Object.values(orderDetails.shippingAddress)
                      .filter(Boolean) // Remove falsy values (e.g., null, undefined, empty strings)
                      .map((item, index, arr) => (
                        <span key={index}>
                          {item.toString().toCapitalize()}
                          {index < arr.length - 1 ? ", " : ""}
                        </span>
                      ))}
                </p>

                <div className="flex flex-col gap-1">
                  <span className="text-gray-400">Email</span>
                  <span>
                    {orderDetails?.customerDetail?.customerEmail ||
                      "default@gmail.com"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-400">Phone No</span>
                  <span>
                    {orderDetails?.customerDetail?.customerPhoneNumber ||
                      "123456789"}
                  </span>
                </div>
              </div>
            </div>
            <div className="total-summary flex flex-col overflow-hidden">
              <h2 className="heading text-lg font-semibold text-gray-400 border-b-2 border-gray-300 p-2">
                Total Summary
              </h2>

              <div className="detail-div h-full relative  font-roboto">
                <div className="p-2 ">
                  <div className="flex text-sm small-device:text-lg font-roboto p-1 border-b-2 last:border-none w-full">
                    <span className="w-1/2">Amount: </span>
                    <span className="w-1/2 break-words">
                      {formatNumber(orderDetails?.totalMrpPrice)}
                    </span>
                  </div>
                  <div className="flex text-sm small-device:text-lg font-roboto p-1  w-full border-b-2 last:border-none">
                    <span className="w-1/2">Discount:</span>
                    <span className="w-1/2 break-words">
                      {formatNumber(orderDetails?.totalDiscount || 0)}
                    </span>
                  </div>
                  <div className="flex text-sm small-device:text-lg font-roboto p-1  w-full border-b-2 last:border-none">
                    <span className="w-1/2">ShippingCharges:</span>
                    <span className="w-1/2 break-words">
                      {formatNumber(orderDetails?.shippingCharge || 0) || 0}
                    </span>
                  </div>
                </div>
                <div className="flex text-sm small-device:text-lg laptop:absolute bottom-0 w-full p-2 border-t-2 border-gray-300">
                  <span className="w-1/2">Total</span>
                  <span className="w-1/2 font-medium break-words">
                    {formatNumber(orderDetails?.grandTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full border-2 p-3 rounded-lg border-gray-300   overflow-hidden font-roboto">
            <div>
              <span className="text-gray-400">Order ID: </span>
              <span>{orderDetails?.orderId}</span>
            </div>
            <div>
              <span className="text-gray-400">Item Number: </span>
              <span>
                {orderDetails?.orderItems?.reduce(
                  (totalQty, item) => (totalQty += item?.quantity),
                  0
                )}
              </span>
            </div>
          </div>
          <div>
            {isCancelled ? (
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-red-100 px-5 py-2 font-semibold text-red-600">
                  Order Cancelled
                </div>
              </div>
            ) : (
              <div className="px-2 py-4">
                <div className="hidden laptop:flex items-start justify-between gap-2">
                  {visibleOrderStatuses.map((status, index, arr) => {
                    const isActive =
                      arr.indexOf(activeOrderStatus) >= index &&
                      activeOrderStatus !== "cancelled";
                    const isLastStep = index === arr.length - 1;

                    return (
                      <div
                        key={status}
                        className={`flex ${isLastStep ? "flex-none" : "flex-1"} items-center`}
                      >
                        <div className="flex min-w-[110px] flex-col items-center">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300 ${
                              isActive
                                ? "border-blue-700 bg-blue-700 text-white"
                                : "border-blue-300 bg-white text-blue-500"
                            }`}
                          >
                            {isActive ? <FaCheck /> : index + 1}
                          </div>
                          <p
                            className={`mt-3 text-center text-sm font-medium ${
                              isActive ? "text-blue-700" : "text-gray-500"
                            }`}
                          >
                            {status?.toCapitalize()}
                          </p>
                        </div>
                        {!isLastStep && (
                          <div className="mx-3 mt-[-32px] flex-1">
                            <div
                              className={`h-1.5 rounded-full ${
                                arr.indexOf(activeOrderStatus) > index
                                  ? "bg-blue-700"
                                  : "bg-blue-200"
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="laptop:hidden flex flex-col gap-3">
                  {visibleOrderStatuses.map((status, index, arr) => {
                    const isActive =
                      arr.indexOf(activeOrderStatus) >= index &&
                      activeOrderStatus !== "cancelled";
                    const isLastStep = index === arr.length - 1;

                    return (
                      <div key={status} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300 ${
                              isActive
                                ? "border-blue-700 bg-blue-700 text-white"
                                : "border-blue-300 bg-white text-blue-500"
                            }`}
                          >
                            {isActive ? <FaCheck /> : index + 1}
                          </div>
                          {!isLastStep && (
                            <div
                              className={`mt-2 min-h-[28px] w-1 flex-1 rounded-full ${
                                arr.indexOf(activeOrderStatus) > index
                                  ? "bg-blue-700"
                                  : "bg-blue-200"
                              }`}
                            />
                          )}
                        </div>
                        <div className="pt-1">
                          <p
                            className={`text-sm font-semibold ${
                              isActive ? "text-blue-700" : "text-gray-500"
                            }`}
                          >
                            {status?.toCapitalize()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {isActive ? "Completed" : "Pending"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3 mb-2">
          <div
            className={`hidden small-device:grid grid-cols-5 p-3 gap-3 duration-300 transition-all ${
              theme === "dark" ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            <span className="col-span-2">Product Name</span>
            <span className="col-span-1"> Price</span>
            <span className="col-span-1">Quantity</span>
            <span className="col-span-1">Amount</span>
          </div>

          <div className="flex flex-col p-3  gap-3">
            {orderDetails?.orderItems?.map((product) => {
              return (
                <div
                  className="grid grid-cols-1 small-device:grid-cols-5 items-start small-device:items-center gap-3 rounded-lg border border-gray-200 p-3 small-device:border-0 small-device:p-0"
                  key={product?.productId || product?.id || product?._id}
                >
                  <div className="grid grid-cols-[80px_1fr] small-device:grid-cols-4 col-span-1 small-device:col-span-2 gap-3 pl-0 small-device:pl-2 items-center">
                    <img
                      src={product?.productImage}
                      className="col-span-1 h-20 w-20 small-device:w-24 rounded object-fill aspect-square"
                      alt=""
                    />
                    <p className="col-span-1 small-device:col-span-3">
                      {product?.productName}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 small-device:contents gap-2 text-sm small-device:text-base">
                    <span className="small-device:hidden text-gray-400">
                      Price
                    </span>
                    <span className="small-device:hidden text-gray-400">
                      Quantity
                    </span>
                    <span className="small-device:hidden text-gray-400">
                      Amount
                    </span>
                    <span className="col-span-1">
                    {formatNumber(product?.price)}
                    </span>
                    <span className="col-span-1">{product?.quantity}</span>
                    <span className="col-span-1">
                    {formatNumber(product?.price * product?.quantity)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orderpage;

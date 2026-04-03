import axios from "axios";
import { useEffect, useState } from "react";
import { useTheme } from "../../Context/themeContext";
import { useAuth } from "../../Context/authContext";
import { Button, Loader, SectionTitle, ServerError } from "../../LIBS";
import { formatNumber } from "../../utility/constant";

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
  const [error, setError] = useState(null);

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

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <ServerError />;
  }

  return (
    <div
      className={`${
        theme === "dark" ? "text-white" : "text-gray-900"
      } transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <SectionTitle title="Orders" className="text-2xl font-semibold" />
          <p className="text-gray-500 mt-2">
            Review orders placed for your products
          </p>
        </div>
      </div>

      {!orders.length ? (
        <div
          className={`rounded-lg border p-8 text-center ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          No orders found for your products yet.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order?._id || order?.orderId}
              className={`rounded-lg border p-4 ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex flex-col gap-4 small-device:flex-row small-device:items-start small-device:justify-between">
                <div className="space-y-2">
                  <p className="font-semibold text-lg">
                    Order #{order?.orderId}
                  </p>
                  <p className="text-sm text-gray-500">
                    Status: {order?.orderStatus?.toCapitalize()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Payment: {order?.paymentStatus?.toCapitalize()} via{" "}
                    {order?.paymentMethod?.toCapitalize()}
                  </p>
                </div>

                <div className="text-sm small-device:text-right">
                  <p className="font-medium">
                    Total: {formatNumber(order?.grandTotal)}
                  </p>
                  <p className="text-gray-500">{order?.orderDate}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 small-device:grid-cols-2">
                <div>
                  <p className="font-medium mb-1">Customer</p>
                  <p>{order?.customerDetails?.name}</p>
                  <p className="text-sm text-gray-500">
                    {order?.customerDetails?.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order?.customerDetails?.phoneNumber}
                  </p>
                </div>

                <div>
                  <p className="font-medium mb-1">Shipping Address</p>
                  <p>{order?.shippingAddress?.addressLine1}</p>
                  {order?.shippingAddress?.addressLine2 ? (
                    <p>{order?.shippingAddress?.addressLine2}</p>
                  ) : null}
                  <p className="text-sm text-gray-500">
                    {[
                      order?.shippingAddress?.city,
                      order?.shippingAddress?.state,
                      order?.shippingAddress?.pinCode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order?.shippingAddress?.country}
                  </p>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr
                      className={
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }
                    >
                      <th className="py-2 pr-3">Product</th>
                      <th className="py-2 pr-3">Qty</th>
                      <th className="py-2 pr-3">Price</th>
                      <th className="py-2 pr-3">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order?.orderItems?.map((item) => (
                      <tr
                        key={item?.productId}
                        className={
                          theme === "dark"
                            ? "border-t border-gray-700"
                            : "border-t border-gray-200"
                        }
                      >
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={item?.productImage}
                              alt={item?.productName}
                              className="w-12 h-12 rounded object-cover"
                            />
                            <div>
                              <p className="font-medium line-clamp-1">
                                {item?.productName}
                              </p>
                              <p className="text-xs text-gray-500 line-clamp-2">
                                {item?.productDescription}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-3">{item?.quantity}</td>
                        <td className="py-3 pr-3">
                          {formatNumber(
                            item?.sellingPrice || item?.price || item?.mrpPrice
                          )}
                        </td>
                        <td className="py-3 pr-3">
                          {formatNumber(
                            (item?.sellingPrice ||
                              item?.price ||
                              item?.mrpPrice ||
                              0) * (item?.quantity || 0)
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div className="mt-4 flex items-center justify-between mobile:flex-col small-device:flex-row mobile:gap-4 small-device:gap-0">
            <p className="text-gray-500">
              Showing {orderRange?.startOrderIndex} to{" "}
              {orderRange?.endOrderIndex} of {orderCount} results
            </p>
            <div className="flex space-x-2">
              <Button
                className={`px-3 py-1 rounded-md disabled:opacity-50 ${
                  theme === "dark"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-300 text-gray-900"
                }`}
                btntext="Previous"
                onClick={() =>
                  setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))
                }
                disabled={currentPage === 1}
              />

              {[...Array(totalPages)].map((item, index) => (
                <Button
                  className={`px-3 py-1 rounded-md ${
                    index + 1 === currentPage
                      ? "bg-purple-600 text-white"
                      : theme === "dark"
                      ? "bg-gray-700 text-white"
                      : "bg-gray-300 text-gray-900"
                  }`}
                  key={index}
                  btntext={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                />
              ))}

              <Button
                className={`px-3 py-1 rounded-md disabled:opacity-50 ${
                  theme === "dark"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-300 text-gray-900"
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

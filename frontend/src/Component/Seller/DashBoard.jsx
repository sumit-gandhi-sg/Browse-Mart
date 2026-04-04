import { useEffect, useState } from "react";
import { useAuth } from "../../Context/authContext";
import { useTheme } from "../../Context/themeContext";
import axios from "axios";
import { SectionTitle, ServerError, Loader } from "../../LIBS";
import { formatNumber } from "../../utility/constant";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const DashBoard = () => {
  const [dashBoardDetail, setDashBoardDetail] = useState(null);
  const [isDataFetching, setIsDataFetching] = useState(false);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  const { authToken } = useAuth();

  const getDashBoardDetail = async () => {
    setIsDataFetching(true);

    try {
      const response = await axios.get(
        `${SERVER_URL}/api/seller/seller-dashboard`,
        {
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      setDashBoardDetail(response?.data);
    } catch (error) {
      console.log(error);
      setError(error?.response?.data?.message || "Something went wrong");
    } finally {
      setIsDataFetching(false);
    }
  };
  useEffect(() => {
    getDashBoardDetail();
  }, [authToken]);

  if (isDataFetching) {
    return <Loader />;
  }
  if (!isDataFetching && error) {
    return <ServerError />;
  }
  return (
    dashBoardDetail && (
      <div
        className={`${
          theme === "dark" ? " text-white " : " text-gray-900"
        } font-roboto transition-all duration-300`}
      >
        <SectionTitle title="Dashboard Overview" />
        {/* <h2 className="text-2xl m-3 font-semibold">Dashboard Overview</h2> */}
        {/* Stats Section */}
        <div
          className={`grid grid-cols-1 mobile:grid-cols-1 small-device:grid-cols-2 laptop:grid-cols-4 gap-4 mt-6 `}
        >
          {[
            {
              label: "Total Sales",
              value: dashBoardDetail?.totalSales?.[0]?.total || 0,
              change: "+12.5%",
              icon: "📈",
              symbol: "₹",
            },
            {
              label: "Total Orders",
              value: dashBoardDetail?.totalOrder || 0,
              change: "+8.2%",
              icon: "🛒",
            },
            {
              label: "Total Products",
              value: dashBoardDetail?.totalProducts || 0,
              change: "+24",
              icon: "📦",
            },
            {
              label: "Total Customers",
              value: dashBoardDetail?.totalCustomer || 0,
              change: "+18.3%",
              icon: "👤",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className={`${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              } p-4 rounded-lg shadow-md transition-all duration-300`}
            >
              <div className="flex items-center justify-between space-x-2">
                <h3 className="text-lg font-semibold">{stat.label}</h3>
                <span className="text-4xl p-2">{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold">
                {formatNumber(stat.value, stat?.symbol ? stat?.symbol : "")}
              </p>
              {/* <p className="text-sm text-green-500">
                {stat.change} from last month
              </p> */}
            </div>
          ))}
        </div>

        {/* Orders Section */}
        <div
          className={`${
            theme === "dark" ? "bg-gray-800  " : "bg-white "
          } p-6 mt-6 rounded-lg shadow-md transition-all    duration-300  `}
        >
          <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
          <div className="w-full overflow-x-scroll">
            <table className=" text-left  w-full min-w-max  ">
              <thead
                className={`${
                  theme === "dark"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-900"
                } transition-colors duration-300 p-5`}
              >
                <tr className="border-b">
                  <th className="p-2 w-max">Order ID</th>
                  <th className="p-2">Customer</th>
                  {/* <th className="p-2">Product</th> */}
                  <th className="p-2">Amount</th>
                  <th className="p-2 w-max">Status</th>
                </tr>
              </thead>
              <tbody>
                {dashBoardDetail?.recentOrders?.map((order, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 w-max">{order?.orderId}</td>
                    <td className="p-2">
                      {order?.customerId?.name} <br />
                      <span className="text-sm text-gray-500">
                        {order?.customerId?.email}
                      </span>
                    </td>
                    {/* <td className="p-2">{order.product}</td> */}
                    <td className="p-2 font-bold">
                      {formatNumber(order?.grandTotal || order?.totalAmount)}
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 text-sm rounded-md w-max ${
                          order.orderStatus === "delivered"
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {order?.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
                {dashBoardDetail?.recentOrders?.length === 0 && (
                  <tr className=" pt-5">
                    <td
                      colSpan="4"
                      className="p-4 text-center mt-5 text-gray-500"
                    >
                      No recent orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 small-device:grid-cols-2 gap-4 mt-6 ">
          {/* Top Products */}
          <div
            className={`${
              theme === "dark" ? "bg-gray-800  " : "bg-white "
            } p-6 rounded-lg shadow-md transition-all duration-300`}
          >
            <h3 className="text-lg font-semibold mb-4">Top Products</h3>
            <ul>
              {[
                {
                  name: "Wireless Headphones",
                  sales: "1,156",
                  revenue: "$45,257",
                },
                { name: "Laptop Stand", sales: "956", revenue: "$38,952" },
                { name: "Phone Case", sales: "841", revenue: "$25,545" },
              ].map((product, index) => (
                <li key={index} className="flex justify-between py-2 border-b">
                  <span>
                    {product.name} ({product.sales} sales)
                  </span>
                  <span className="font-bold">{product.revenue}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent Reviews */}
          <div
            className={`${
              theme === "dark" ? "bg-gray-800  " : "bg-white "
            } p-6 rounded-lg shadow-md transition-all duration-300 w-full`}
          >
            <h3 className="text-lg font-semibold mb-4">Recent Reviews</h3>
            <ul>
              {[
                {
                  name: "Lisa Anderson",
                  review: "Great product! Exactly what I was looking for.",
                  rating: "⭐⭐⭐⭐⭐",
                },
                {
                  name: "James Cooper",
                  review:
                    "Good quality but shipping took longer than expected.",
                  rating: "⭐⭐⭐⭐",
                },
                {
                  name: "Maria Garcia",
                  review: "Amazing customer service and product quality!",
                  rating: "⭐⭐⭐⭐⭐",
                },
              ].map((review, index) => (
                <li key={index} className="py-2 border-b">
                  <span className="font-bold">{review.name}</span>{" "}
                  {review.rating}
                  <p className="text-sm text-gray-500">{review.review}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  );
};

export default DashBoard;

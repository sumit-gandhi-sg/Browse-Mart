import { useEffect, useState } from "react";
import { useAuth } from "../../Context/authContext";
import { useTheme } from "../../Context/themeContext";
import axios from "axios";
import { SectionTitle, ServerError, Loader } from "../../LIBS";
import { formatNumber } from "../../utility/constant";
import { FaChartLine, FaShoppingCart, FaBox, FaUsers, FaStar, FaBoxOpen } from "react-icons/fa";

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
      <div className={`w-full max-w-7xl mx-auto pb-12 ${theme === "dark" ? "text-white" : "text-gray-900"} font-roboto transition-all duration-300`}>
        <div className="flex flex-col tablet:flex-row items-center justify-between mb-8 gap-4 px-2">
          <div className="w-full">
            <h1 className="text-3xl font-extrabold tracking-tight">Dashboard Overview</h1>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
              At-a-glance performance metrics and recent store activity
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 mobile:grid-cols-2 laptop:grid-cols-4 gap-6 mt-2 px-2">
          {[
            {
              label: "Gross Sales",
              value: dashBoardDetail?.totalSales?.[0]?.total || 0,
              icon: <FaChartLine />,
              color: "text-indigo-500",
              bgColor: "bg-indigo-500/10",
              symbol: "₹",
            },
            {
              label: "Total Orders",
              value: dashBoardDetail?.totalOrder || 0,
              icon: <FaShoppingCart />,
              color: "text-pink-500",
              bgColor: "bg-pink-500/10",
            },
            {
              label: "Live Products",
              value: dashBoardDetail?.totalProducts || 0,
              icon: <FaBox />,
              color: "text-green-500",
              bgColor: "bg-green-500/10",
            },
            {
              label: "Total Customers",
              value: dashBoardDetail?.totalCustomer || 0,
              icon: <FaUsers />,
              color: "text-amber-500",
              bgColor: "bg-amber-500/10",
            },
          ].map((stat, index) => (
            <div key={index} className={`relative p-6 rounded-3xl border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 overflow-hidden ${theme === "dark" ? "bg-gray-800/40 border-gray-800" : "bg-white border-gray-200/60"}`}>
              <div className="flex items-center justify-between space-x-2 relative z-10">
                <h3 className={`text-sm tracking-widest uppercase font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</h3>
                <span className={`p-3 rounded-full flex items-center justify-center text-xl shadow-inner ${stat.bgColor} ${stat.color}`}>
                  {stat.icon}
                </span>
              </div>
              <p className="text-3xl font-black mt-4 tracking-tighter relative z-10">
                {stat.symbol ? <span className="font-medium mr-1 text-2xl">{stat.symbol}</span> : ""}
                {formatNumber(stat.value, "")}
              </p>
              
              {/* Background abstract decoration */}
              <div className={`absolute -right-6 -bottom-6 text-8xl opacity-[0.03] transform rotate-12 z-0 pointer-events-none`}>
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Orders Section */}
        <div className="mt-10 px-2">
          <div className={`p-6 md:p-8 rounded-[24px] shadow-lg border relative overflow-hidden ${theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}>
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-extrabold flex items-center gap-2">
                  <FaBoxOpen className="text-indigo-500" /> Recent Sales Activity
               </h3>
               {/* Optional View All link can go here */}
            </div>

            <div className={`w-full max-w-full overflow-hidden border rounded-2xl shadow-inner ${theme === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
              <div className="w-full overflow-x-auto fancy-scroll">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead className={`text-[11px] uppercase tracking-widest font-bold border-b transition-colors ${theme === 'dark' ? 'bg-gray-800/50 text-gray-500 border-gray-800' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                    <tr>
                      <th className="p-4 pl-6">Order ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4 pr-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y transition-colors ${theme === 'dark' ? 'divide-gray-800/60' : 'divide-gray-100'}`}>
                    {dashBoardDetail?.recentOrders?.map((order, index) => (
                      <tr key={index} className={`transition-colors hover:bg-black/5 dark:hover:bg-white/5`}>
                        <td className="p-4 pl-6">
                          <span className="font-mono font-bold tracking-tight text-indigo-600 dark:text-indigo-400">#{order?.orderId?.toUpperCase()}</span>
                        </td>
                        <td className="p-4">
                          <p className={`font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{order?.customerId?.name || "Unknown"}</p>
                          <p className={`text-[11px] font-mono mt-0.5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{order?.customerId?.email || "No email"}</p>
                        </td>
                        <td className={`p-4 font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatNumber(order?.grandTotal || order?.totalAmount)}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <span className={`px-4 py-1.5 w-max rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                            order?.orderStatus === 'cancelled' ? 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-500/20 dark:text-red-400' :
                            order?.orderStatus === 'delivered' ? 'bg-green-500/10 text-green-600 border-green-200 dark:border-green-500/20 dark:text-green-400' :
                            'bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-500/20 dark:text-indigo-400'
                          }`}>
                            {order?.orderStatus || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(!dashBoardDetail?.recentOrders || dashBoardDetail?.recentOrders?.length === 0) && (
                      <tr>
                        <td colSpan="4" className="p-12 text-center text-gray-500 font-medium">
                          No recent orders found. Sales will appear here.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section (Mock Data) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 px-2">
          
          {/* Top Products */}
          <div className={`p-6 md:p-8 rounded-[24px] shadow-lg border relative overflow-hidden ${theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}>
            <h3 className="text-xl font-extrabold mb-6 flex items-center gap-2">
               <FaStar className="text-amber-500" /> Top Performing Products
            </h3>
            
            <div className="space-y-4">
              {[
                { name: "Premium Wireless Headphones", sales: "1,156", revenue: "₹3,45,257", img: "🎧" },
                { name: "Ergonomic Laptop Stand", sales: "956", revenue: "₹38,952", img: "💻" },
                { name: "Impact Phone Case", sales: "841", revenue: "₹25,545", img: "📱" },
              ].map((product, index) => (
                <div key={index} className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${theme === 'dark' ? 'bg-gray-800/40 border-gray-800 hover:bg-gray-800' : 'bg-gray-50 border-gray-100 hover:bg-white'}`}>
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-10 w-10 flexItems-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg text-xl flex flex-shrink-0 items-center">
                       {product.img}
                    </div>
                    <div className="min-w-0 pr-4">
                       <p className={`font-bold truncate ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{product.name}</p>
                       <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{product.sales} sales</p>
                    </div>
                  </div>
                  <span className={`font-black flex-shrink-0 text-indigo-600 dark:text-indigo-400`}>{product.revenue}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reviews */}
          <div className={`p-6 md:p-8 rounded-[24px] shadow-lg border relative overflow-hidden ${theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}>
            <h3 className="text-xl font-extrabold mb-6 flex items-center gap-2">
               <FaStar className="text-amber-500" /> Recent Customer Reviews
            </h3>
            
            <div className="space-y-4">
              {[
                { name: "Lisa Anderson", review: "Great product! Exactly what I was looking for. Super quick delivery as well.", rating: 5, initial: "L" },
                { name: "James Cooper", review: "Good quality but shipping took longer than expected to California.", rating: 4, initial: "J" },
                { name: "Maria Garcia", review: "Amazing customer service and product quality! The packaging was gorgeous.", rating: 5, initial: "M" },
              ].map((review, index) => (
                <div key={index} className={`p-5 rounded-2xl border transition-colors ${theme === 'dark' ? 'bg-gray-800/40 border-gray-800 hover:bg-gray-800' : 'bg-gray-50 border-gray-100 hover:bg-white'}`}>
                  <div className="flex items-center gap-3 mb-2">
                     <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${index % 2 === 0 ? 'bg-indigo-500' : 'bg-pink-500'}`}>
                        {review.initial}
                     </div>
                     <div>
                        <span className={`block font-bold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{review.name}</span>
                        <div className="flex text-amber-400 text-[10px]">
                          {Array(5).fill("").map((_, i) => (
                            <FaStar key={i} className={i < review.rating ? "text-amber-400" : "text-gray-300 dark:text-gray-600"} />
                          ))}
                        </div>
                     </div>
                  </div>
                  <p className={`text-sm leading-relaxed mt-3 italic ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>"{review.review}"</p>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    )
  );
};

export default DashBoard;

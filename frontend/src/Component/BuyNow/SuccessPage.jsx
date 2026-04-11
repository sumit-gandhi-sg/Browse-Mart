import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaShoppingBag, FaArrowRight, FaFileInvoice } from "react-icons/fa";
import { useTheme } from "../../Context/themeContext";
import orderPlacedSuccessImage from "../../assets/images/oderPlacedSuccessfully.gif";

const SuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const orderIds = location?.state || [];

  useEffect(() => {
    if (!orderIds.length) {
      navigate("/orders", { replace: true });
    }
  }, [orderIds, navigate]);

  useEffect(() => {
    // Reset scroll smoothly on load
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Remove the annoying scroll lock bug from the old code
    document.body.style.overflow = "auto";
  }, []);

  if (!orderIds.length) return null;

  return (
    <div className={`min-h-screen w-full flex justify-center items-center p-4 tablet:p-6 transition-colors duration-300 ${theme === "dark" ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
      
      <div className={`w-full max-w-2xl my-10 rounded-[32px] border shadow-2xl flex flex-col justify-center items-center overflow-hidden transition-all duration-300 ${theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
        
        {/* TOP SUCCESS BANNER / GIF AREA */}
        <div className={`w-full px-8 py-10 flex flex-col items-center justify-center border-b ${theme === "dark" ? "bg-gray-800/40 border-gray-800" : "bg-indigo-50/50 border-gray-100"}`}>
          <div className="relative rounded-full bg-white shadow-xl shadow-indigo-500/10 p-5 mb-8">
             <img
               src={orderPlacedSuccessImage}
               className="h-32 w-32 object-contain mix-blend-multiply"
               alt="Order Placed Successfully"
             />
             <div className="absolute bottom-0 right-0 bg-green-500 rounded-full text-white p-1 border-4 border-white shadow-lg">
                <FaCheckCircle className="text-3xl" />
             </div>
          </div>
          <h1 className="font-roboto font-bold text-3xl tablet:text-4xl text-center mb-3">Order Confirmed!</h1>
          <p className={`text-center text-lg font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            Thank you for shopping with BrowseMart.
          </p>
        </div>

        {/* DETAILS AREA */}
        <div className="w-full p-8 flex flex-col items-center gap-8">
          <p className={`text-center leading-relaxed max-w-md ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            We've received your order and are currently processing it. You will receive an email confirmation containing your receipt and tracking details shortly.
          </p>

          <div className={`w-full rounded-2xl p-6 flex flex-col items-center gap-4 border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
            <span className={`uppercase tracking-widest text-xs font-bold ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              Your Order Reference Sequence
            </span>
            <div className="flex flex-wrap gap-3 justify-center">
              {orderIds?.map((id, index) => (
                <div key={index} className="flex items-center gap-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 px-5 py-2.5 rounded-xl font-mono font-bold tracking-tight text-lg shadow-sm">
                  #{id}
                </div>
              ))}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col tablet:flex-row gap-4 w-full mt-2">
            <Link 
              to={`/order${orderIds?.length === 1 ? `/${orderIds[0]}` : "s"}`}
              className="flex-1"
            >
              <button className={`w-full flex items-center justify-center gap-3 font-bold py-4 px-6 rounded-xl border-2 transition-all duration-300 ${theme === "dark" ? "bg-transparent border-gray-700 text-white hover:bg-gray-800" : "bg-white border-gray-300 text-gray-800 hover:bg-gray-100 hover:border-gray-400"}`}>
                <FaFileInvoice className="text-xl" />
                {orderIds?.length > 1 ? "View All Orders" : "View Order Details"}
              </button>
            </Link>
            
            <Link to="/" className="flex-1">
              <button className="w-full h-full flex items-center justify-center gap-3 font-bold py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-all duration-300 border-2 border-indigo-600">
                <FaShoppingBag className="text-xl" />
                Continue Shopping <FaArrowRight className="ml-1" />
              </button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SuccessPage;

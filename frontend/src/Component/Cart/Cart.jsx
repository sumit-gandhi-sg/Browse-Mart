import axios from "axios";
import React, { useEffect, useState } from "react";
import { FiArrowRight, FiCreditCard, FiShield, FiShoppingBag } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import CartCard from "./CartCard";
import EmptyCart from "./EmptyCart";
import { Loader, ServerError, Button } from "../../LIBS";
import { formatNumber } from "../../utility/constant";
import { useTheme } from "../../Context/themeContext";
import { useAuth } from "../../Context/authContext";
import { useUser } from "../../Context/userContext";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const Cart = () => {
  const { theme } = useTheme();
  const { authToken } = useAuth();
  const { userDetail } = useUser();
  const navigate = useNavigate();
  const [cartItem, setCartItem] = useState([]);
  const [isDataFetching, setIsDataFetching] = useState(false);
  const [error, setError] = useState(null);
  const isDark = theme === "dark";

  const getCartItem = async () => {
    try {
      setIsDataFetching(true);
      const response = await axios.post(
        `${SERVER_URL}/api/user/get-cart-items`,
        { userId: userDetail?.id },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setCartItem(response?.data?.cartProduct || []);
    } catch (requestError) {
      const { data, status } = requestError?.response || {};
      if (status === 404) {
        setError({ message: data?.message, status });
      } else {
        setError({ error: "Internal Server Error", status: 500 });
      }
    } finally {
      setIsDataFetching(false);
    }
  };

  useEffect(() => {
    if (!authToken) {
      navigate("/login");
    } else {
      getCartItem();
    }
  }, [authToken, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const subtotal = cartItem?.reduce((total, product) => {
    return total + (product?.mrpPrice || product?.price || 0) * (product?.quantity || 0);
  }, 0);

  const totalDiscount = cartItem?.reduce((total, product) => {
    return (
      total +
      ((product?.mrpPrice || product?.price || 0) - (product?.sellingPrice || product?.price || 0)) *
        (product?.quantity || 0)
    );
  }, 0);

  const finalTotal = cartItem?.reduce((total, product) => {
    return total + (product?.sellingPrice || product?.price || 0) * (product?.quantity || 0);
  }, 0);

  if (isDataFetching) return <Loader />;
  if (error?.status === 500) return <ServerError />;
  if (!isDataFetching && cartItem?.length === 0) return <EmptyCart />;

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        isDark ? "bg-gray-900 text-white" : "bg-slate-50 text-gray-900"
      }`}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 mobile:px-4 tablet:px-6 laptop:px-8">
        <section
          className={`overflow-hidden rounded-[28px] border px-6 py-8 shadow-sm transition-all duration-300 mobile:px-4 ${
            isDark
              ? "border-gray-800 bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-950"
              : "border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-sky-50"
          }`}
        >
          <div className="flex flex-col gap-8 laptop:flex-row laptop:items-end laptop:justify-between">
            <div className="max-w-2xl">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                  isDark
                    ? "bg-white/10 text-indigo-200"
                    : "bg-white text-indigo-600 shadow-sm"
                }`}
              >
                <FiShoppingBag />
                Your cart
              </span>
              <h1 className="mt-4 font-roboto text-3xl font-bold mobile:text-2xl">
                Review everything before checkout.
              </h1>
              <p
                className={`mt-3 max-w-xl font-roboto text-sm leading-6 ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                A cleaner summary, quick quantity controls, and a checkout panel that
                matches the rest of Browse Mart.
              </p>
            </div>

            <div className="grid gap-3 small-device:grid-cols-3">
              <div
                className={`rounded-2xl border px-4 py-4 backdrop-blur ${
                  isDark
                    ? "border-white/10 bg-white/5"
                    : "border-white bg-white/80"
                }`}
              >
                <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Items
                </p>
                <p className="mt-2 text-2xl font-bold">{cartItem?.length}</p>
              </div>
              <div
                className={`rounded-2xl border px-4 py-4 backdrop-blur ${
                  isDark
                    ? "border-white/10 bg-white/5"
                    : "border-white bg-white/80"
                }`}
              >
                <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Savings
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-500">
                  {formatNumber(totalDiscount || 0)}
                </p>
              </div>
              <div
                className={`rounded-2xl border px-4 py-4 backdrop-blur ${
                  isDark
                    ? "border-white/10 bg-white/5"
                    : "border-white bg-white/80"
                }`}
              >
                <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Payable
                </p>
                <p className="mt-2 text-2xl font-bold">{formatNumber(finalTotal || 0)}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 laptop:grid-cols-[minmax(0,1.6fr)_380px]">
          <section
            className={`rounded-[28px] border p-4 shadow-sm transition-all duration-300 mobile:p-3 ${
              isDark ? "border-gray-800 bg-gray-950/70" : "border-gray-200 bg-white"
            }`}
          >
            <div
              className={`mb-4 flex items-center justify-between rounded-2xl border px-4 py-4 ${
                isDark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-gray-50"
              }`}
            >
              <div>
                <h2 className="font-roboto text-2xl font-bold mobile:text-xl">Shopping Cart</h2>
                <p className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Adjust quantities, remove products, or continue shopping.
                </p>
              </div>
              <Link
                to="/products"
                className={`hidden rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 small-device:inline-flex ${
                  isDark
                    ? "bg-gray-800 text-white hover:bg-gray-700"
                    : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                }`}
              >
                Continue Shopping
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              {cartItem?.map((product) => (
                <CartCard
                  product={product}
                  key={product?._id || product?.id}
                  authToken={authToken}
                  setCartItem={setCartItem}
                />
              ))}
            </div>
          </section>

          <aside className="flex flex-col gap-4">
            <div
              className={`rounded-[28px] border p-6 shadow-sm transition-all duration-300 ${
                isDark ? "border-gray-800 bg-gray-950/70" : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-roboto text-2xl font-bold">Order Summary</h2>
                <FiCreditCard className={isDark ? "text-indigo-300" : "text-indigo-500"} />
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className={isDark ? "text-gray-400" : "text-gray-500"}>Subtotal</span>
                  <span className="font-semibold">{formatNumber(subtotal || 0)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={isDark ? "text-gray-400" : "text-gray-500"}>Discount</span>
                  <span className="font-semibold text-emerald-500">- {formatNumber(totalDiscount || 0)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={isDark ? "text-gray-400" : "text-gray-500"}>Delivery</span>
                  <span className="font-semibold text-emerald-500">Free</span>
                </div>
                <div className={`border-t pt-4 ${isDark ? "border-gray-800" : "border-gray-200"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold">Total</span>
                    <span className="text-2xl font-bold">{formatNumber(finalTotal || 0)}</span>
                  </div>
                  <p className={`mt-2 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Taxes included. No extra shipping charges on this order.
                  </p>
                </div>
              </div>

              <Link to="/checkout" className="mt-6 block">
                <Button
                  btntext="Proceed to Checkout"
                  icon={<FiArrowRight />}
                  iconPosition="right"
                  className="w-full rounded-2xl bg-indigo-600 px-5 py-3 text-white hover:bg-indigo-700"
                />
              </Link>

              <Link
                to="/products"
                className={`mt-3 inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300 small-device:hidden ${
                  isDark
                    ? "bg-gray-800 text-white hover:bg-gray-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Continue Shopping
              </Link>
            </div>

            <div
              className={`rounded-[28px] border p-5 transition-all duration-300 ${
                isDark ? "border-gray-800 bg-gray-950/70" : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`rounded-2xl p-3 ${isDark ? "bg-indigo-900/40 text-indigo-300" : "bg-indigo-50 text-indigo-600"}`}
                >
                  <FiShield />
                </div>
                <div>
                  <h3 className="font-roboto text-base font-semibold">Secure checkout</h3>
                  <p className={`mt-1 text-sm leading-6 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Payments stay protected and your items remain easy to review before
                    you place the order.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Cart;

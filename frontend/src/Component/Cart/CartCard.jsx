import React, { useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { FiTrash2 } from "react-icons/fi";
import axios from "axios";
import Button from "../../LIBS/Button";
import {
  formatNumber,
  swalWithCustomConfiguration,
} from "../../utility/constant";
import { useCart } from "../../Context/cartContext";
import { useTheme } from "../../Context/themeContext";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const CartCard = ({ product, authToken, setCartItem }) => {
  const { setCartCount } = useCart();
  const { theme } = useTheme();
  const [isUpdating, setIsUpdating] = useState(false);
  const isDark = theme === "dark";
  const sellingPrice =
    product?.sellingPrice || product?.price || product?.mrpPrice || 0;

  const updateCart = async (newQuantity = 0) => {
    try {
      setIsUpdating(true);
      const res = await axios({
        method: "POST",
        url: `${SERVER_URL}/api/user/update-cart`,
        data: { productId: product?.id, quantity: newQuantity },
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setCartCount(res?.data?.cartCount);

      if (newQuantity <= 0) {
        setCartItem((prev) =>
          prev.filter(
            (item) =>
              (item?.id || item?._id) !==
              (res?.data?.removedProductId || product?.id || product?._id)
          )
        );
        return;
      }

      if (res?.data?.updatedCartItem) {
        setCartItem((prev) =>
          prev.map((item) =>
            (item?.id || item?._id) ===
            (res?.data?.updatedCartItem?.id || res?.data?.updatedCartItem?._id)
              ? { ...item, ...res?.data?.updatedCartItem }
              : item
          )
        );
      }
    } catch (error) {
      console.log(error);
      swalWithCustomConfiguration?.fire(
        "Something went wrong!",
        "Cant update cart",
        "error"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIncrement = () => {
    if (isUpdating) return;
    updateCart((product?.quantity || 1) + 1);
  };

  const handleDecrement = () => {
    if (isUpdating) return;
    updateCart((product?.quantity || 1) - 1);
  };

  const handleRemoveClicked = () => {
    if (isUpdating) return;
    updateCart();
  };

  return (
    <article
      className={`rounded-[24px] border p-4 transition-all duration-300 ${
        isDark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-gray-50/80"
      }`}
    >
      <div className="flex gap-4 mobile:flex-col small-device:flex-row">
        <div className="flex w-full gap-4">
          <div
            className={`h-28 w-28 flex-shrink-0 overflow-hidden rounded-2xl border ${
              isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
            }`}
          >
            <img
              src={product?.image || ""}
              alt={product?.name || ""}
              className="h-full w-full object-cover object-top"
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="line-clamp-2 font-roboto text-lg font-semibold">
                    {product?.name}
                  </h3>
                  <p
                    className={`mt-2 line-clamp-2 text-sm leading-6 ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {product?.description}
                  </p>
                </div>
                <Button
                  btntext="Remove"
                  icon={<FiTrash2 />}
                  className={`hidden rounded-full px-3 py-2 text-sm small-device:inline-flex ${
                    isDark
                      ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={handleRemoveClicked}
                  disabled={isUpdating}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex flex-col">
                <span className="font-roboto text-xl font-bold">
                  {formatNumber(sellingPrice)}
                </span>
                {product?.mrpPrice && product?.mrpPrice > sellingPrice ? (
                  <span
                    className={`text-sm line-through ${
                      isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    {formatNumber(product?.mrpPrice)}
                  </span>
                ) : null}
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center gap-2 rounded-full border px-2 py-2 ${
                    isDark ? "border-gray-700 bg-gray-950" : "border-gray-200 bg-white"
                  }`}
                >
                  <button
                    type="button"
                    className={`rounded-full p-2 transition-all duration-300 ${
                      isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                    } ${isUpdating ? "pointer-events-none opacity-50" : ""}`}
                    onClick={handleDecrement}
                  >
                    <FaMinus className="text-xs" />
                  </button>
                  <span
                    className={`min-w-10 rounded-full px-3 py-1 text-center text-sm font-semibold ${
                      isDark ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {product?.quantity}
                  </span>
                  <button
                    type="button"
                    className={`rounded-full p-2 transition-all duration-300 ${
                      isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                    } ${isUpdating ? "pointer-events-none opacity-50" : ""}`}
                    onClick={handleIncrement}
                  >
                    <FaPlus className="text-xs" />
                  </button>
                </div>

                <div className="text-right">
                  <p
                    className={`text-xs uppercase tracking-[0.18em] ${
                      isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    Total
                  </p>
                  <p className="font-roboto text-lg font-bold">
                    {formatNumber(sellingPrice * (product?.quantity || 0))}
                  </p>
                </div>
              </div>
            </div>

            <Button
              btntext="Remove"
              icon={<FiTrash2 />}
              className={`rounded-full px-3 py-2 text-sm small-device:hidden ${
                isDark
                  ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              onClick={handleRemoveClicked}
              disabled={isUpdating}
            />
          </div>
        </div>
      </div>
    </article>
  );
};

export default CartCard;

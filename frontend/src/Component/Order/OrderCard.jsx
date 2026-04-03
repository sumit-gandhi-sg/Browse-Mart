import React, { useState } from "react";
import { Button } from "../../LIBS";
import { Link } from "react-router-dom";
import { formatNumber, months } from "../../utility/constant";
import { useTheme } from "../../Context/themeContext";

const getStatusClasses = (status, theme) => {
  if (status === "cancelled") {
    return theme === "dark"
      ? "bg-red-500/15 text-red-300 border-red-500/20"
      : "bg-red-100 text-red-600 border-red-200";
  }
  if (status === "delivered") {
    return theme === "dark"
      ? "bg-green-500/15 text-green-300 border-green-500/20"
      : "bg-green-100 text-green-700 border-green-200";
  }
  return theme === "dark"
    ? "bg-blue-500/15 text-blue-300 border-blue-500/20"
    : "bg-blue-100 text-blue-700 border-blue-200";
};

const OrderCard = ({ order }) => {
  const [isOrderItemExpanded, setIsOrderItemExpanded] = useState(false);
  const { theme } = useTheme();
  const isCancelled = order?.orderStatus === "cancelled";
  const displayItem = order?.orderItems?.slice(
    0,
    isOrderItemExpanded ? order?.orderItems?.length : 2,
  );

  return (
    <div
      className={`w-full overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 ${
        theme === "dark"
          ? "border-gray-800 bg-gray-950 text-white"
          : "border-gray-200 bg-white text-gray-900"
      }`}
    >
      <div
        className={`border-b p-4 small-device:p-5 ${
          theme === "dark" ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <div className="flex flex-col gap-4 laptop:flex-row laptop:items-start laptop:justify-between">
          <div className="grid grid-cols-1 gap-3 small-device:grid-cols-2 laptop:grid-cols-3 laptop:gap-6">
            <div className="min-w-0">
              <p
                className={`text-xs font-semibold uppercase tracking-wide ${
                  theme === "dark" ? "text-gray-400" : "text-gray-400"
                }`}
              >
                Order Number
              </p>
              <p
                className={`mt-1 break-all text-sm font-semibold small-device:text-base ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {(order?.orderId || order?.id)?.toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Order Date
              </p>
              <p
                className={`mt-1 text-sm font-medium small-device:text-base ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {months?.[order?.orderDate?.month - 1]?.alphabetics}{" "}
                {order?.orderDate?.day}, {order?.orderDate?.year}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Total Amount
              </p>
              <p
                className={`mt-1 text-sm font-semibold small-device:text-base ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {formatNumber(order?.totalAmount)}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 small-device:flex-row laptop:flex-col laptop:items-end">
            <span
              className={`w-max rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                order?.orderStatus,
                theme,
              )}`}
            >
              {order?.orderStatus?.toCapitalize()}
            </span>

            <div className="flex flex-col gap-2 small-device:flex-row">
              <Link to={`/order/${order?.orderId || order?._id || order?.id}`}>
                <Button
                  btntext="View Order"
                  className="w-full small-device:w-auto min-w-[110px] whitespace-nowrap rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                />
              </Link>
              <Button
                btntext="View Invoice"
                disabled={true}
                className={`w-full small-device:w-auto min-w-[110px] whitespace-nowrap cursor-not-allowed rounded-lg border px-3 py-1.5 text-sm font-medium ${
                  theme === "dark"
                    ? "border-gray-700 bg-gray-800 text-gray-500"
                    : "border-gray-200 bg-gray-100 text-gray-400"
                }`}
              />
            </div>
          </div>
        </div>

        {isCancelled && (
          <div
            className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${
              theme === "dark"
                ? "border-red-500/20 bg-red-500/10 text-red-300"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            This order has been cancelled.
          </div>
        )}
      </div>

      <div
        className={`divide-y ${
          theme === "dark" ? "divide-gray-800" : "divide-gray-200"
        }`}
      >
        {displayItem?.map((item, index) => (
          <div
            key={item?.productId || item?.id || item?._id || index}
            className="p-4 small-device:p-5"
          >
            <div className="flex flex-col gap-4 small-device:flex-row">
              <img
                src={item?.productImage}
                className="h-24 w-24 rounded-xl object-cover small-device:h-28 small-device:w-28"
                alt={item?.productName}
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-3 laptop:flex-row laptop:items-start laptop:justify-between">
                  <div className="min-w-0">
                    <p
                      className={`line-clamp-2 text-base font-semibold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {item?.productName}
                    </p>
                    <p
                      className={`mt-2 line-clamp-2 text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {item?.productDescription}
                    </p>
                  </div>

                  <div
                    className={`grid grid-cols-3 gap-3 rounded-xl p-3 text-sm small-device:w-max laptop:min-w-[220px] ${
                      theme === "dark" ? "bg-gray-900" : "bg-gray-50"
                    }`}
                  >
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">
                        Price
                      </p>
                      <p
                        className={`mt-1 font-semibold ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {formatNumber(item?.price)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">
                        Qty
                      </p>
                      <p
                        className={`mt-1 font-semibold ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {item?.quantity}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">
                        Amount
                      </p>
                      <p
                        className={`mt-1 font-semibold ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {formatNumber(item?.price * item?.quantity)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 small-device:flex-row small-device:items-center small-device:justify-between">
                  <p
                    className={`text-sm font-medium ${
                      isCancelled
                        ? theme === "dark"
                          ? "text-red-300"
                          : "text-red-500"
                        : theme === "dark"
                          ? "text-gray-300"
                          : "text-gray-600"
                    }`}
                  >
                    Order Status: {order?.orderStatus?.toCapitalize()}
                  </p>

                  <div className="flex items-center gap-3">
                    <Link
                      to={`/product/${item?.productId || item?.id || item?._id}`}
                    >
                      <Button
                        btntext="View Product"
                        className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                          theme === "dark"
                            ? "text-indigo-300 hover:bg-indigo-500/10"
                            : "text-indigo-600 hover:bg-indigo-50"
                        }`}
                      />
                    </Link>
                    <Link
                      to={`/product/buy/${
                        item?.productId || item?.id || item?._id
                      }`}
                    >
                      <Button
                        btntext="Buy Again"
                        className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                          theme === "dark"
                            ? "text-indigo-300 hover:bg-indigo-500/10"
                            : "text-indigo-600 hover:bg-indigo-50"
                        }`}
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {order?.orderItems?.length > 2 && (
        <div
          className={`border-t px-4 py-3 text-center small-device:px-5 ${
            theme === "dark" ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <button
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-300 ${
              theme === "dark"
                ? "text-blue-300 hover:bg-blue-500/10"
                : "text-blue-600 hover:bg-blue-50"
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOrderItemExpanded((prev) => !prev);
            }}
          >
            {isOrderItemExpanded
              ? "Show Less"
              : `Show ${order?.orderItems?.length - displayItem?.length} More`}
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderCard;

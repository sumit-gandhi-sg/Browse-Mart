import React, { useState } from "react";
import { Button } from "../../LIBS";
import { Link } from "react-router-dom";
import { formatNumber, months } from "../../utility/constant";

const getStatusClasses = (status) => {
  if (status === "cancelled") {
    return "bg-red-100 text-red-600 border-red-200";
  }
  if (status === "delivered") {
    return "bg-green-100 text-green-700 border-green-200";
  }
  return "bg-blue-100 text-blue-700 border-blue-200";
};

const OrderCard = ({ order }) => {
  const [isOrderItemExpanded, setIsOrderItemExpanded] = useState(false);
  const isCancelled = order?.orderStatus === "cancelled";
  const displayItem = order?.orderItems?.slice(
    0,
    isOrderItemExpanded ? order?.orderItems?.length : 2
  );

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300">
      <div className="border-b border-gray-200 p-4 small-device:p-5">
        <div className="flex flex-col gap-4 laptop:flex-row laptop:items-start laptop:justify-between">
          <div className="grid grid-cols-1 gap-3 small-device:grid-cols-2 laptop:grid-cols-3 laptop:gap-6">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Order Number
              </p>
              <p className="mt-1 break-all text-sm font-semibold text-gray-900 small-device:text-base">
                {(order?.orderId || order?.id)?.toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Order Date
              </p>
              <p className="mt-1 text-sm font-medium text-gray-900 small-device:text-base">
                {months?.[order?.orderDate?.month - 1]?.alphabetics}{" "}
                {order?.orderDate?.day}, {order?.orderDate?.year}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Total Amount
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900 small-device:text-base">
                {formatNumber(order?.totalAmount)}
              </p>
            </div>
          </div>

            <div className="flex flex-col gap-3 small-device:flex-row laptop:flex-col laptop:items-end">
            <span
              className={`w-max rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                order?.orderStatus
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
                className="w-full small-device:w-auto min-w-[110px] whitespace-nowrap cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-400"
              />
            </div>
          </div>
        </div>

        {isCancelled && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            This order has been cancelled.
          </div>
        )}
      </div>

      <div className="divide-y divide-gray-200">
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
                    <p className="line-clamp-2 text-base font-semibold text-gray-900">
                      {item?.productName}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                      {item?.productDescription}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 rounded-xl bg-gray-50 p-3 text-sm small-device:w-max laptop:min-w-[220px]">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">
                        Price
                      </p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {formatNumber(item?.price)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">
                        Qty
                      </p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {item?.quantity}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">
                        Amount
                      </p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {formatNumber(item?.price * item?.quantity)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 small-device:flex-row small-device:items-center small-device:justify-between">
                  <p
                    className={`text-sm font-medium ${
                      isCancelled ? "text-red-500" : "text-gray-600"
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
                        className="rounded-lg px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
                      />
                    </Link>
                    <Link
                      to={`/product/buy/${
                        item?.productId || item?.id || item?._id
                      }`}
                    >
                      <Button
                        btntext="Buy Again"
                        className="rounded-lg px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
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
        <div className="border-t border-gray-200 px-4 py-3 text-center small-device:px-5">
          <button
            className="rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition-all duration-300 hover:bg-blue-50"
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

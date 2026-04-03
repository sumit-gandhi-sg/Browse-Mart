import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Loader, ServerError } from "../../LIBS";
import OrderCard from "./OrderCard";
import { useTheme } from "../../Context/themeContext";
import { useAuth } from "../../Context/authContext";
import { useUser } from "../../Context/userContext";
const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const OrdersContainer = ({ embedded = false }) => {
  const [ordersArr, setOrdersArr] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [orderCount, setOrderCount] = useState(0);
  const [orderRange, setOrderRange] = useState({});
  const [isOrdersFetching, setIsOrdersFetching] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { authToken } = useAuth();
  const { userDetail } = useUser();
  const visiblePages = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  )
    .filter((page) => page >= Math.max(1, currentPage - 1))
    .filter((page) => page <= Math.min(totalPages, currentPage + 1));

  const getAllOrders = () => {
    setIsOrdersFetching(true);
    axios({
      method: "POST",
      url: `${SERVER_URL}/api/order/get-all-order`,
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${authToken}`,
      },
      params: { page: currentPage },
      data: { userId: userDetail?.id },
    })
      .then((response) => {
        const { data, status } = response;
        if (status === 200) {
          setOrdersArr(data?.ordersArr);
          setTotalPages(data?.totalPages || 1);
          setOrderCount(data?.totalOrders || 0);
          setOrderRange({
            startOrderIndex: data?.startOrderIndex || 0,
            endOrderIndex: data?.endOrderIndex || 0,
          });
        }
      })
      .catch((error) => {
        const { data, status } = error?.response || {};
        if (status === 404) {
          setError({ message: data?.message, status: status });
        } else {
          setError({ error: "Internal Server Error", status: 500 });
        }
      })
      .finally(() => {
        setIsOrdersFetching(false);
      });
  };
  useEffect(() => {
    if (!authToken) {
      navigate(`/login? redirect=${encodeURIComponent(location?.pathname)}`);
    } else {
      getAllOrders();
    }
    // <Navigate to={"/login?redirect-from=order"} />;
  }, [authToken, currentPage]);

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top on component mount
  }, [currentPage]);

  if (isOrdersFetching) {
    return <Loader />;
  }
  if (error?.status === 500) {
    return <ServerError />;
  }
  if (!ordersArr.length && !isOrdersFetching) {
    return (
      <div
        className={`${embedded ? "min-h-full" : "min-h-screen"} flex justify-center items-center text-4xl ${
          theme === "dark"
            ? " bg-gray-900 text-white"
            : "bg-white text-gray-900"
        } transition-all duration-300`}
      >
        No order Available
      </div>
    );
  }
  return (
    ordersArr?.length > 0 && (
      <div
        className={`${embedded ? "min-h-full" : "min-h-screen"}  ${
          theme === "dark"
            ? " bg-gray-900 text-white"
            : "bg-white text-gray-900"
        } transition-all duration-300`}
      >
        <div
          className={`grid ${embedded ? "min-h-full mt-0 py-4" : "min-h-screen mt-5 py-8"} gap-4 w-full max-w-6xl m-auto px-3 tablet:px-6`}
        >
          <h2 className=" font-roboto text-2xl font-bold">Order History</h2>
          <div className="grid grid-cols-1 gap-4">
            {ordersArr?.map((order, index) => (
              // <Link
              //   to={`/order/${order?._id || order?.id}`}
              //   key={order?._id || order?.id}
              // >
              <OrderCard order={order} key={order?._id || order?.id} />
              // </Link>
            ))}
          </div>

          <div
            className={`sticky bottom-0 z-10 mt-4 flex items-center justify-between gap-4 border-t px-3 py-3 mobile:flex-col small-device:flex-row ${
              theme === "dark"
                ? "border-gray-700 bg-gray-900/95"
                : "border-gray-200 bg-gray-100/95"
            } backdrop-blur`}
          >
            <p className="text-gray-500">
              Showing {orderRange?.startOrderIndex} to{" "}
              {orderRange?.endOrderIndex} of {orderCount} results
            </p>
            <div className="flex flex-wrap justify-center gap-2">
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

              {currentPage > 2 && (
                <>
                  <Button
                    className={`px-3 py-1 rounded-md ${
                      theme === "dark"
                        ? "bg-gray-700 text-white"
                        : "bg-gray-300 text-gray-900"
                    }`}
                    btntext={1}
                    onClick={() => setCurrentPage(1)}
                  />
                  {currentPage > 3 && <span className="px-1 py-1">...</span>}
                </>
              )}

              {visiblePages.map((page) => (
                <Button
                  className={`px-3 py-1 rounded-md ${
                    page === currentPage
                      ? "bg-purple-600 text-white"
                      : theme === "dark"
                        ? "bg-gray-700 text-white"
                        : "bg-gray-300 text-gray-900"
                  }`}
                  key={page}
                  btntext={page}
                  onClick={() => setCurrentPage(page)}
                />
              ))}

              {currentPage < totalPages - 1 && (
                <>
                  {currentPage < totalPages - 2 && (
                    <span className="px-1 py-1">...</span>
                  )}
                  <Button
                    className={`px-3 py-1 rounded-md ${
                      theme === "dark"
                        ? "bg-gray-700 text-white"
                        : "bg-gray-300 text-gray-900"
                    }`}
                    btntext={totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                  />
                </>
              )}

              <Button
                className={`px-3 py-1 rounded-md disabled:opacity-50 ${
                  theme === "dark"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-300 text-gray-900"
                }`}
                btntext="Next"
                onClick={() =>
                  setCurrentPage((prev) =>
                    prev < totalPages ? prev + 1 : prev,
                  )
                }
                disabled={currentPage === totalPages}
              />
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default OrdersContainer;

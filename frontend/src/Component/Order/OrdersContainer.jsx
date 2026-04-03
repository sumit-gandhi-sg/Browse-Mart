import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader, ServerError } from "../../LIBS";
import OrderCard from "./OrderCard";
import { useTheme } from "../../Context/themeContext";
import { useAuth } from "../../Context/authContext";
import { useUser } from "../../Context/userContext";
const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const OrdersContainer = () => {
  const [ordersArr, setOrdersArr] = useState([]);
  const [filtertedOrdersArr, setFiltertedOrdersArr] = useState([]);
  const [isOrdersFetching, setIsOrdersFetching] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { authToken } = useAuth();
  const { userDetail } = useUser();
  const getAllOrders = () => {
    setIsOrdersFetching(true);
    axios({
      method: "POST",
      url: `${SERVER_URL}/api/order/get-all-order`,
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${authToken}`,
      },
      data: { userId: userDetail?.id },
    })
      .then((response) => {
        const { data, status } = response;
        if (status === 200) {
          setOrdersArr(data?.ordersArr);
          setFiltertedOrdersArr(data?.ordersArr);
          setIsOrdersFetching(false);
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
  }, [authToken]);

  useEffect(() => {
    if (ordersArr?.length > 0) {
      setFiltertedOrdersArr(() =>
        [...ordersArr].sort((a, b) => {
          const dateA = new Date(
            a?.orderDate?.year,
            a?.orderDate?.month - 1,
            a?.orderDate?.day,
          );
          const dateB = new Date(
            b?.orderDate?.year,
            b?.orderDate?.month - 1,
            b?.orderDate?.day,
          );
          return dateB - dateA;
        }),
      );
    }
  }, [ordersArr]);
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top on component mount
  }, []);

  if (isOrdersFetching) {
    return <Loader />;
  }
  if (error?.status === 500) {
    return <ServerError />;
  }
  if (!filtertedOrdersArr.length && !isOrdersFetching) {
    return (
      <div
        className={`min-h-screen flex justify-center items-center text-4xl ${
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
    filtertedOrdersArr?.length > 0 && (
      <div
        className={`min-h-screen  ${
          theme === "dark"
            ? " bg-gray-900 text-white"
            : "bg-white text-gray-900"
        } transition-all duration-300`}
      >
        <div
          className={`grid min-h-screen gap-4 w-[70%] mobile:w-full tablet:w-[70%] m-auto  mt-5 py-8 mobile:p-3 `}
        >
          <h2 className=" font-roboto text-2xl font-bold">Order History</h2>
          <div className="grid grid-cols-4 mobile:grid-cols-1  gap-3">
            {filtertedOrdersArr?.map((order, index) => (
              // <Link
              //   to={`/order/${order?._id || order?.id}`}
              //   key={order?._id || order?.id}
              // >
              <OrderCard order={order} key={order?._id || order?.id} />
              // </Link>
            ))}
          </div>
        </div>
      </div>
    )
  );
};

export default OrdersContainer;

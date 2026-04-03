import axios from "axios";
import React, { useEffect, useState } from "react";
import { Loader, ServerError, Button } from "../../LIBS";
import { Link, useNavigate } from "react-router-dom";
import CartCard from "./CartCard";
import EmptyCart from "./EmptyCart";
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
  let totalAmount = 0;

  const getCartItem = async () => {
    try {
      setIsDataFetching(true);
      const response = await axios.post(
        `${SERVER_URL}/api/user/get-cart-items`,
        { userId: userDetail?.id },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setCartItem(response?.data?.cartProduct || []);
    } catch (error) {
      // console.error(error);
      const { data, status } = error?.response || {};
      if (status === 404) {
        setError({ message: data?.message, status: status });
      } else {
        setError({ error: "Internal Server Error", status: 500 });
      }
    } finally {
      setIsDataFetching(false);
    }
  };

  // Check if user is authenticated
  useEffect(() => {
    if (!authToken) {
      navigate("/login");
    } else {
      getCartItem();
    }
  }, [authToken, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top on component mount
  }, []);
  // Calculate total amount
  if (cartItem) {
    cartItem.forEach((item) => {
      totalAmount += (item?.price || item?.mrpPrice) * item?.quantity;
    });
  }
  //display Loading UI while fetaching CartItem
  if (isDataFetching) return <Loader />;
  //Display EmptyCart UI when cart is empty
  if (error?.status === 500) return <ServerError />;
  if (!isDataFetching && cartItem?.length === 0) return <EmptyCart />;

  return (
    <div
      className={`flex gap-5 p-3  min-h-screen mobile:h-full mobile:flex-col tablet:flex-row ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      } transition-all duration-300 `}
    >
      {/* Shopping cart section */}
      <div className="w-10/12 h-min  mobile:w-full tablet:w-10/12 p-6 flex flex-col gap-5 bg-inherit rounded-md overflow-hidden">
        <div className="flex justify-between items-center p-2 border-b-2">
          <span className="font-semibold font-roboto text-3xl">
            Shopping Cart
          </span>
          <span className=" font-semibold font-roboto text-xl">
            {cartItem?.length} Items
          </span>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex w-full gap-4  font-medium items-center p-2 border-b-2 mobile:hidden tablet:flex">
            <span className="w-1/2">Product Details</span>

            <div className="w-1/2 gap-2 flex justify-between items-center">
              <span className="w-1/3 flex justify-center items-center">
                Price
              </span>
              <span className="w-1/3 flex justify-center items-center">
                Quantity
              </span>
              <span className="w-1/3 flex justify-center items-center">
                Total
              </span>
            </div>
          </div>
          {cartItem &&
            cartItem?.map((product, index) => {
              return (
                <CartCard
                  product={product}
                  key={product?._id || product?.id}
                  authToken={authToken}
                  setCartItem={setCartItem}
                />
              );
            })}
        </div>
      </div>

      {/* check Out Section */}
      <div
        className={`w-4/12 h-min mobile:flex mobile:w-full tablet:w-4/12 tablet:flex p-6 flex flex-col gap-5 rounded-md justify-between  transition-all duration-300 ${
          theme === "dark" ? "bg-gray-800" : "bg-gray-100"
        }`}
      >
        <div className="flex justify-between items-center p-2 border-b-2">
          <span className="font-semibold font-roboto text-3xl">
            Order Summary
          </span>
        </div>
        <div className="w-full flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            {/* <div className="w-full flex justify-between items-center">
              <span className="w-1/2">Total Items:</span>{" "}
              <span className="w-1/2"> {cartItem?.length}</span>
            </div> */}
            <div className="w-full flex justify-between items-center">
              <span className="w-1/2">Total Amount:</span>{" "}
              <span className="w-1/2 text-lg font-bold">
                {" "}
                {formatNumber(totalAmount)}
              </span>
            </div>

            <div className="w-full flex justify-between items-center">
              <span className="w-1/2">Discount</span>
              <span className="w-1/2 text-lg font-bold">
                {formatNumber(
                  cartItem?.reduce((total, product) => {
                    return (
                      total +
                      (product?.mrpPrice - product?.sellingPrice) *
                        product?.quantity
                    );
                  }, 0)
                ) || 0}
              </span>
            </div>

            <div className="w-full flex justify-between items-center">
              <span className="w-1/2">Total</span>
              <span className="w-1/2 text-lg font-bold">
                {formatNumber(
                  cartItem?.reduce((total, product) => {
                    return (
                      total +
                      (product?.sellingPrice || product?.price) *
                        product?.quantity
                    );
                  }, 0)
                ) || 0}
              </span>
            </div>
          </div>
          <Link to={"/checkout"}>
            <Button
              btntext={"Check Out"}
              className={"bg-indigo-600 text-white p-2 rounded-full w-full"}
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;

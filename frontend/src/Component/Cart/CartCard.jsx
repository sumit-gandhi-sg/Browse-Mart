import React, { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { FaRupeeSign } from "react-icons/fa";
import axios from "axios";
import Button from "../../LIBS/Button";
import {
  formatNumber,
  swalWithCustomConfiguration,
} from "../../utility/constant";
import { useCart } from "../../Context/cartContext";
import { useTheme } from "../../Context/themeContext";
const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const CartCard = ({
  product,
  authToken,
  isDataFetching,
  setIsDataFetching,
  getCartItem,
}) => {
  const [quantity, setQuantity] = useState(product?.quantity || 1);
  const { setCartCount } = useCart();
  const { theme } = useTheme();
  // const handleIncrement = () => {
  //   setQuantity((prevQuantity) => prevQuantity + 1);
  // };

  // const handleDecrement = () => {
  //   if (quantity > 1) {
  //     setQuantity((prevQuantity) => prevQuantity - 1);
  //   }
  // };
  const updateCart = async (newQuantity = 0) => {
    // setIsDataFetching((prevState) => !prevState);
    axios({
      method: "POST",
      url: `${SERVER_URL}/api/user/update-cart`,
      data: { productId: product?.id, quantity: newQuantity },
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((res) => {
        // setIsDataFetching((prevState) => !prevState);
        setCartCount(res?.data?.cartCount);
        getCartItem();
      })
      .catch((error) => {
        console.log(error);
        // setIsDataFetching((prevState) => !prevState);
        swalWithCustomConfiguration?.fire(
          "Something went wrong!",
          "Cant update cart",
          "error"
        );
      });
  };

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
    updateCart(quantity + 1);
  };
  const handleDecrement = () => {
    // if (quantity > 1) {
    setQuantity((prev) => prev - 1);
    updateCart(quantity - 1);
    // }
  };
  //   const handleDecrement = () => {
  //   if (quantity > 1) {
  //     const newQty = quantity - 1;
  //     setQuantity(newQty);
  //     updateCart(newQty);
  //   }
  // };

  const handleRemoveClicked = () => {
    updateCart();
  };
  return (
    <div
      className={`flex gap-4 w-full  rounded max-h-[200px] items-center p-2 mobile:flex-col small-device:flex-row ${
        theme === "dark" ? "bg-gray-800" : "bg-gray-100"
      }  transition-all duration-300`}
    >
      <div className="w-1/2 flex gap-4 items-center justify-between overflow-scroll  mobile:w-full small-device:w-1/2">
        <div className="w-2/5">
          <img
            src={product?.image || ""}
            alt={product?.name || ""}
            className=" min-w-[70px] min-h-[70px] max-w-[100px] max-h-[100px] w-full object-cover object-top aspect-square rounded"
          />
        </div>

        <div className="h-full w-3/5  flex flex-col gap-2 overflow-scroll">
          <span className="text-lg font-roboto font-semibold text-ellipsis overflow-hidden whitespace-nowrap">
            {product?.name}
          </span>
          <span className="text-sm font-roboto text-ellipsis line-clamp-2 ">
            {product?.description}
          </span>
          {/* <span>{product?.item?.price}</span> */}
          <Button
            btntext={"remove"}
            className={`w-min py-1 px-2 bg-blue-100 ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-100"
            }  rounded mobile:hidden small-device:block bg-indigo-600 text-white  transition-all duration-300 relative`}
            onClick={handleRemoveClicked}
          />
        </div>
      </div>
      <div className="flex gap-2 items-center w-1/2 justify-between font-medium text-sm mobile:w-full small-device:w-1/2">
        <span className="w-1/3 flex justify-center text-base items-center mobile:hidden small-device:flex">
          {formatNumber(product?.price || product?.mrpPrice)}
        </span>
        <div className="w-1/3 flex justify-center items-center gap-3">
          <span
            className={`cursor-pointer p-1 rounded-full ${
              theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"
            }`}
            onClick={handleDecrement}
          >
            <FaMinus />
          </span>
          <span
            className={`px-3 py-1 transition-all duration-300 text-center  border border-gray-600 rounded-md ${
              theme === "dark" ? "bg-gray-700 " : "bg-gray-200 "
            }`}
            // className=" bg-blue-100 border-blue-300 border-2 px-3 py-1"
          >
            {product?.quantity}
          </span>
          <span
            className={`cursor-pointer p-1 rounded-full ${
              theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"
            }`}
            onClick={handleIncrement}
          >
            <FaPlus />
          </span>
        </div>
        <span className="w-1/3 flex justify-center items-center text-lg">
          {/* <FaRupeeSign className="font-roboto font-medium text-sm" /> */}
          {formatNumber(
            (product?.price || product?.mrpPrice) * product?.quantity
          )}
        </span>
      </div>
    </div>
  );
};

export default CartCard;

import React, { useState } from "react";
import { Button } from "../LIBS";
import { useCart } from "../Context/cartContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { swalWithCustomConfiguration } from "./constant";
import axios from "axios";
const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const AddToCartButton = ({ userDetail, productId, authToken, className }) => {
  const [isProductAdding, setIsProductAdding] = useState(false);
  const { setCartCount } = useCart();
  const navigate = useNavigate();

  const addToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!productId) {
      return;
    }

    if (!userDetail || !authToken) {
      await swalWithCustomConfiguration.fire({
        title: "Error!",
        text: "Please login first!",
        icon: "warning",
        // allowOutsideClick: false,
      });
      return;
    }
    setIsProductAdding(true);
    try {
      const response = await axios.post(
        `${SERVER_URL}/api/user/add-to-cart`,
        {
          userId: userDetail?.id,
          productId: productId,
          quantity: 1,
        },
        {
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const { status, data } = response;
      if (status === 200) {
        setIsProductAdding(false);
        setCartCount(() => data?.cartCount);
        let shouldNavigateToCart = false;
        await swalWithCustomConfiguration.fire({
          title: "Product Added!",
          text: "Your product has been added to the cart. You can proceed to checkout.",
          icon: "success",
          confirmButtonText: "View Cart",
          cancelButtonText: "Continue Shopping",
          showCancelButton: true,
          reverseButtons: true,
          preConfirm: () => {
            shouldNavigateToCart = true;
          },
          didClose: () => {
            if (shouldNavigateToCart) {
              navigate("/cart");
            }
          },
        });
      } else return;
    } catch (error) {
      console?.log(error);
      if (error?.message === "Network Error") {
        alert("Please check your Internet Connection");
        return;
      }
      const { status, data } = error?.response;
      const errorMsg = data?.message || "Something went wrong.";
      const errorTitle =
        status === 401
          ? "Unauthorized!"
          : status === 404
          ? "Not Found!"
          : status === 500
          ? "Server Error!"
          : "Error!";
      await Swal.fire({
        title: errorTitle,
        text: errorMsg,
        icon: "error",
      });
    } finally {
      setIsProductAdding(false);
    }
  };

  return (
    <Button
      btntext={`${isProductAdding ? "Adding..." : "Add to Cart"}`}
      className={className || "btn btn-primary"}
      disabled={isProductAdding}
      //   loading={isProductAdding}
      onClick={addToCart}
    />
  );
};

export default AddToCartButton;

import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { customToast } from "./constant";
import { useTheme } from "../Context/themeContext";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const AddRemoveProductFromWishListButton = ({
  authToken,
  productId,
  userDetail,
  isAddedToWislist = false, // initial state from product data
}) => {
  const { theme } = useTheme();
  // Initialize from the prop so the heart is filled on first render
  // if the product is already in the user's wishlist
  const [isSaved, setIsSaved] = useState(isAddedToWislist);
  const [isLoading, setIsLoading] = useState(false);

  // Sync if the prop changes (e.g. product list re-fetched after login)
  useEffect(() => {
    setIsSaved(isAddedToWislist);
  }, [isAddedToWislist]);

  const toggleWishList = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!authToken || !userDetail) return;
    if (isLoading) return;

    // Optimistic UI update
    setIsSaved((prev) => !prev);
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${SERVER_URL}/api/user/add-to-wishlist`,
        { productId },
        {
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const { data, status } = response;

      if (status === 201) {
        // Newly added
        setIsSaved(true);
        customToast(theme).fire({
          title: "Added to Wishlist",
          icon: "success",
        });
      } else if (status === 200) {
        // Toggled by backend (removed or re-added)
        const isNowSaved = !data?.isRemoved;
        setIsSaved(isNowSaved);
        customToast(theme).fire({
          title: data?.message || (isNowSaved ? "Added to Wishlist" : "Removed from Wishlist"),
          icon: "success",
        });
      }
    } catch (error) {
      // Revert optimistic update on failure
      setIsSaved((prev) => !prev);
      console.log("Wishlist toggle error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <span
      className={`
        h-8 w-8 flex items-center justify-center rounded-full shadow-md
        bg-white/90 backdrop-blur-sm
        transition-all duration-200
        ${isLoading ? "opacity-50 cursor-wait" : "hover:scale-110 active:scale-95 cursor-pointer"}
        ${!authToken ? "hidden" : ""}
      `}
      onClick={toggleWishList}
      title={isSaved ? "Remove from Wishlist" : "Add to Wishlist"}
    >
      {isSaved ? (
        <FaHeart className="text-red-500 w-4 h-4" />
      ) : (
        <FaRegHeart className="text-gray-400 w-4 h-4" />
      )}
    </span>
  );
};

export default AddRemoveProductFromWishListButton;

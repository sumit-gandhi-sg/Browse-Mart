import axios from "axios";
import React, { useEffect, useState } from "react";
import ProductCard from "../Product/ProductCard";
import { Loader, ServerError } from "../../LIBS";
import { useTheme } from "../../Context/themeContext";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const WishListContainer = ({ authToken }) => {
  const [wishList, setWishList] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const { theme } = useTheme();

  const getAllWishList = async () => {
    setIsFetching(true);
    setError(null);

    try {
      const response = await axios.post(
        `${SERVER_URL}/api/user/get-wishlist`,
        {
          userId: "",
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
        setWishList(data?.wishListProducts || []);
      }
    } catch (error) {
      const { status } = error?.response || {};
      if (status === 204) {
        setWishList([]);
      } else {
        setError({ status: status || 500 });
      }
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      getAllWishList();
    }
  }, [authToken]);

  if (isFetching) {
    return <Loader />;
  }

  if (error?.status === 500) {
    return <ServerError />;
  }

  return (
    <div
      className={`h-full w-full overflow-y-auto ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-slate-50 text-gray-900"
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 small-device:p-5">
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-[0.18em] ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Saved Items
          </p>
          <h2 className="mt-2 font-roboto text-2xl font-bold">My Wishlist</h2>
        </div>

        {wishList?.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 small-device:grid-cols-2 laptop:grid-cols-2">
            {wishList.map((product) => (
              <div key={product?.id || product?._id} className="min-w-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`rounded-[28px] border border-dashed p-8 text-center ${
              theme === "dark"
                ? "border-gray-700 bg-gray-950 text-gray-400"
                : "border-gray-300 bg-white text-gray-500"
            }`}
          >
            No wishlist items yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default WishListContainer;

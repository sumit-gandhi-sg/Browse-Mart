import axios from "axios";
import React, { useEffect, useState } from "react";
import { FiArrowRight, FiHeart, FiShoppingCart, FiTrash2 } from "react-icons/fi";
import { Link } from "react-router-dom";
import AddToCartButton from "../../utility/AddToCartButton";
import { Loader, ServerError, Button } from "../../LIBS";
import { customToast, formatNumber, swalWithCustomConfiguration } from "../../utility/constant";
import { useTheme } from "../../Context/themeContext";
import { useUser } from "../../Context/userContext";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const ITEMS_PER_PAGE = 4;

const WishListItem = ({ product, authToken, onRemove }) => {
  const { theme } = useTheme();
  const { userDetail } = useUser();
  const [isRemoving, setIsRemoving] = useState(false);
  const isDark = theme === "dark";
  const productId = product?.id || product?._id;
  const sellingPrice = product?.sellingPrice || product?.price || 0;
  const mrpPrice = product?.mrpPrice || sellingPrice;
  const discountPct =
    mrpPrice > sellingPrice
      ? Math.round(((mrpPrice - sellingPrice) / mrpPrice) * 100)
      : null;

  const handleRemove = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!productId || isRemoving) {
      return;
    }

    setIsRemoving(true);
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

      const removed = response?.status === 200 ? response?.data?.isRemoved !== false : true;
      if (removed) {
        onRemove(productId);
        customToast(theme).fire({
          title: response?.data?.message || "Removed from Wishlist",
          icon: "success",
        });
      }
    } catch (error) {
      swalWithCustomConfiguration?.fire(
        "Something went wrong",
        error?.response?.data?.message || "Unable to update wishlist right now.",
        "error"
      );
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <article
      className={`overflow-hidden rounded-[28px] border transition-all duration-300 ${
        isDark ? "border-gray-800 bg-gray-950/70" : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex h-full gap-4 p-4 mobile:flex-col small-device:flex-row">
        <Link
          to={`/product/${productId}`}
          className={`relative block overflow-hidden rounded-[22px] border mobile:h-56 mobile:w-full small-device:h-auto small-device:w-44 small-device:min-w-44 ${
            isDark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-gray-50"
          }`}
        >
          <img
            src={product?.image || ""}
            alt={product?.name || "Wishlist product"}
            className="h-full w-full object-cover object-top"
          />
          {discountPct ? (
            <span className="absolute left-3 top-3 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white">
              {discountPct}% OFF
            </span>
          ) : null}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {product?.category?.name ? (
                  <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? "text-indigo-300" : "text-indigo-600"}`}>
                    {product?.category?.name}
                  </p>
                ) : null}
                <Link to={`/product/${productId}`}>
                  <h3 className="mt-1 line-clamp-2 font-roboto text-xl font-bold mobile:text-lg">
                    {product?.name}
                  </h3>
                </Link>
                <p className={`mt-2 line-clamp-2 text-sm leading-6 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  {product?.description || "Saved for later in your wishlist."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleRemove}
                disabled={isRemoving}
                className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                  isDark
                    ? "bg-gray-900 text-gray-300 hover:bg-gray-800"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                } ${isRemoving ? "cursor-wait opacity-50" : ""}`}
                title="Remove from wishlist"
              >
                <FiTrash2 />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="font-roboto text-2xl font-bold">
                {formatNumber(sellingPrice)}
              </span>
              {mrpPrice > sellingPrice ? (
                <span className={`text-sm line-through ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                  {formatNumber(mrpPrice)}
                </span>
              ) : null}
              {!product?.stock ? (
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-500">
                  Out of stock
                </span>
              ) : (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                  In stock
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {product?.stock ? (
              <AddToCartButton
                authToken={authToken}
                userDetail={userDetail}
                productId={productId}
                className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              />
            ) : (
              <Button
                btntext="Unavailable"
                disabled={true}
                className="cursor-not-allowed rounded-2xl bg-gray-300 px-5 py-3 text-sm font-semibold text-gray-500"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />
            )}

            <Link
              to={`/product/${productId}`}
              className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300 ${
                isDark
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              View Product
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

const WishListContainer = ({ authToken }) => {
  const [wishList, setWishList] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [wishListCount, setWishListCount] = useState(0);
  const [wishListRange, setWishListRange] = useState({
    startProductIndex: 0,
    endProductIndex: 0,
  });
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const getAllWishList = async (page = currentPage) => {
    setIsFetching(true);
    setError(null);

    try {
      const response = await axios.post(
        `${SERVER_URL}/api/user/get-wishlist`,
        {
          userId: "",
          page,
          limit: ITEMS_PER_PAGE,
        },
        {
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response?.status === 200) {
        setWishList(response?.data?.wishListProducts || []);
        setTotalPages(response?.data?.totalPages || 1);
        setWishListCount(response?.data?.totalWishListProducts || 0);
        setWishListRange({
          startProductIndex: response?.data?.startProductIndex || 0,
          endProductIndex: response?.data?.endProductIndex || 0,
        });
        setCurrentPage(response?.data?.currentPage || page);
      }
    } catch (requestError) {
      const { status } = requestError?.response || {};
      if (status === 204) {
        setWishList([]);
        setCurrentPage(1);
        setTotalPages(1);
        setWishListCount(0);
        setWishListRange({
          startProductIndex: 0,
          endProductIndex: 0,
        });
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
  }, [authToken, currentPage]);

  const handleRemoveItem = () => {
    if (wishList.length === 1 && currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
      return;
    }

    getAllWishList(currentPage);
  };

  const visiblePages = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  )
    .filter((page) => page >= Math.max(1, currentPage - 1))
    .filter((page) => page <= Math.min(totalPages, currentPage + 1));

  if (isFetching) {
    return <Loader />;
  }

  if (error?.status === 500) {
    return <ServerError />;
  }

  return (
    <div
      className={`h-full w-full overflow-y-auto ${
        isDark ? "bg-gray-900 text-white" : "bg-slate-50 text-gray-900"
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 small-device:p-5">
        <section
          className={`overflow-hidden rounded-[28px] border px-5 py-6 shadow-sm ${
            isDark
              ? "border-gray-800 bg-gradient-to-br from-gray-900 via-gray-800 to-rose-950"
              : "border-rose-100 bg-gradient-to-br from-white via-rose-50 to-orange-50"
          }`}
        >
          <div className="flex flex-col gap-5 laptop:flex-row laptop:items-end laptop:justify-between">
            <div className="max-w-2xl">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                  isDark ? "bg-white/10 text-rose-200" : "bg-white text-rose-600 shadow-sm"
                }`}
              >
                <FiHeart />
                Saved items
              </span>
              <h2 className="mt-4 font-roboto text-3xl font-bold mobile:text-2xl">
                Your wishlist is now easier to scan and manage.
              </h2>
              <p className={`mt-2 text-sm leading-6 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                Keep track of favorites, jump back into product details, or move items
                into your cart without leaving the profile page.
              </p>
            </div>

            <div className="grid gap-3 small-device:grid-cols-2">
              <div
                className={`rounded-2xl border px-4 py-4 ${
                  isDark ? "border-white/10 bg-white/5" : "border-white bg-white/80"
                }`}
              >
                <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Saved
                </p>
                <p className="mt-2 text-2xl font-bold">{wishListCount}</p>
              </div>
              <div
                className={`rounded-2xl border px-4 py-4 ${
                  isDark ? "border-white/10 bg-white/5" : "border-white bg-white/80"
                }`}
              >
                <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  On this page
                </p>
                <p className="mt-2 text-2xl font-bold">
                  {wishList.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        {wishList?.length > 0 ? (
          <div className="flex flex-col gap-4">
            {wishList.map((product) => (
              <WishListItem
                key={product?.id || product?._id}
                product={product}
                authToken={authToken}
                onRemove={handleRemoveItem}
              />
            ))}

            {totalPages > 1 ? (
              <div
                className={`sticky bottom-0 z-10 mt-4 flex items-center justify-between gap-4 border-t px-3 py-3 mobile:flex-col small-device:flex-row ${
                  isDark
                    ? "border-gray-700 bg-gray-900/95"
                    : "border-gray-200 bg-gray-100/95"
                }`}
              >
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Showing {wishListRange?.startProductIndex}-
                  {wishListRange?.endProductIndex} of {wishListCount} saved items
                </p>

                <div className="flex flex-wrap justify-center gap-2">
                  <Button
                    className={`px-3 py-1 rounded-md disabled:opacity-50 ${
                      isDark
                        ? "bg-gray-700 text-white"
                        : "bg-gray-300 text-gray-900"
                    }`}
                    btntext="Previous"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  />

                  {currentPage > 2 && (
                    <>
                      <Button
                        className={`px-3 py-1 rounded-md ${
                          isDark
                            ? "bg-gray-700 text-white"
                            : "bg-gray-300 text-gray-900"
                        }`}
                        btntext={1}
                        onClick={() => setCurrentPage(1)}
                      />
                      {currentPage > 3 && (
                        <span className="px-1 py-1 text-gray-500">...</span>
                      )}
                    </>
                  )}

                  {visiblePages.map((page) => (
                    <Button
                      className={`px-3 py-1 rounded-md ${
                        page === currentPage
                          ? "bg-purple-600 text-white"
                          : isDark
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
                        <span className="px-1 py-1 text-gray-500">...</span>
                      )}
                      <Button
                        className={`px-3 py-1 rounded-md ${
                          isDark
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
                      isDark
                        ? "bg-gray-700 text-white"
                        : "bg-gray-300 text-gray-900"
                    }`}
                    btntext="Next"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div
            className={`rounded-[28px] border border-dashed p-8 text-center ${
              isDark
                ? "border-gray-700 bg-gray-950 text-gray-400"
                : "border-gray-300 bg-white text-gray-500"
            }`}
          >
            <FiShoppingCart className="mx-auto mb-3 text-3xl opacity-70" />
            <h3 className="font-roboto text-xl font-bold">No wishlist items yet</h3>
            <p className="mt-2 text-sm">
              Explore products and save the ones you want to revisit later.
            </p>
            <Link
              to="/products"
              className={`mt-5 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300 ${
                isDark
                  ? "bg-gray-800 text-white hover:bg-gray-700"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              Browse Products
              <FiArrowRight />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishListContainer;

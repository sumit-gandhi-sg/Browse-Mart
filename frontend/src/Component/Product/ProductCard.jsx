import Button from "../../LIBS/Button";
import React from "react";
import { useNavigate } from "react-router-dom";
import { formatNumber } from "../../utility/constant";
import {
  AddToCartButton,
  AddRemoveProductFromWishListButton,
} from "../../utility";
import { useTheme } from "../../Context/themeContext";
import { useAuth } from "../../Context/authContext";
import { useUser } from "../../Context/userContext";

const ProductCard = ({ product }) => {
  const {
    image,
    name,
    price,
    mrpPrice,
    category,
    id,
    rating,
    stock,
    sellingPrice,
    ratingNumber,
    isAddedToWislist,
  } = product;
  const { theme } = useTheme();
  const { authToken } = useAuth();
  const { userDetail } = useUser();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const handleCardClick = () => {
    navigate(`/product/${id}`);
  };

  const selling = sellingPrice || price;
  const discountPct =
    mrpPrice && selling && mrpPrice > selling
      ? Math.round(((mrpPrice - selling) / mrpPrice) * 100)
      : null;

  return (
    <div
      onClick={handleCardClick}
      className={`
        group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer
        border transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-xl
        ${isDark
          ? "bg-gray-800 border-gray-700 hover:border-indigo-500/50 hover:shadow-indigo-900/30"
          : "bg-white border-gray-200 hover:border-indigo-200 hover:shadow-indigo-100/80"
        }
      `}
    >
      {/* ── Image Section ───────────────────────────────────────── */}
      <div className="relative overflow-hidden aspect-square bg-gray-100">
        <img
          src={image || "#"}
          alt={name}
          className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-110"
        />

        {/* Out of Stock Overlay */}
        {!stock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs font-bold font-roboto px-3 py-1.5 bg-red-500 rounded-full tracking-wide">
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* Discount Badge */}
        {discountPct && stock ? (
          <span className="absolute top-2.5 left-2.5 bg-green-500 text-white text-[11px] font-bold font-roboto px-2 py-0.5 rounded-full shadow-sm">
            {discountPct}% OFF
          </span>
        ) : null}

        {/* Wishlist Button */}
        <div className="absolute top-2.5 right-2.5">
          <AddRemoveProductFromWishListButton
            authToken={authToken}
            productId={id}
            userDetail={userDetail}
            isAddedToWislist={isAddedToWislist}
          />
        </div>

        {/* Category Badge — slides up on hover */}
        {category && (
          <div className={`
            absolute bottom-0 left-0 right-0
            px-3 py-1.5
            translate-y-full group-hover:translate-y-0
            transition-transform duration-300
            ${isDark ? "bg-gray-900/85" : "bg-white/85"}
            backdrop-blur-sm
          `}>
            <span className={`text-[10px] font-semibold font-roboto uppercase tracking-widest
              ${isDark ? "text-indigo-400" : "text-indigo-500"}`}>
              {category?.name}
            </span>
          </div>
        )}
      </div>

      {/* ── Info Section ────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-3 gap-2">

        {/* Product Name — fixed 2-line height so all cards align */}
        <p className={`
          font-semibold font-roboto text-sm leading-snug
          line-clamp-2 min-h-[2.5rem]
          transition-colors duration-200
          ${isDark
            ? "text-gray-100 group-hover:text-indigo-300"
            : "text-gray-900 group-hover:text-indigo-600"
          }
        `}>
          {name}
        </p>

        {/* Star Rating — always occupies fixed height (h-5) so cards stay aligned
            whether or not a product has reviews */}
        <div className="h-5 flex items-center gap-1.5">
          {!!rating && (
            <>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((index) => (
                  <svg
                    key={index}
                    className={`w-3.5 h-3.5 ${
                      index <= Math.round(rating)
                        ? "text-yellow-400"
                        : isDark
                        ? "text-gray-600"
                        : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
                  </svg>
                ))}
              </div>
              {ratingNumber && (
                <span
                  className={`text-[11px] font-roboto font-medium ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  ({ratingNumber})
                </span>
              )}
            </>
          )}
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span
            className={`text-base font-bold font-roboto ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {formatNumber(selling)}
          </span>
          {mrpPrice && mrpPrice > selling && (
            <span
              className={`text-xs font-roboto line-through ${
                isDark ? "text-gray-500" : "text-gray-400"
              }`}
            >
              {formatNumber(mrpPrice)}
            </span>
          )}
        </div>

        {/* Add to Cart / Out of Stock Button */}
        <div className="mt-auto pt-1">
          {stock ? (
            <AddToCartButton
              authToken={authToken}
              userDetail={userDetail}
              productId={id}
              className={`
                w-full py-2 rounded-xl font-roboto font-semibold text-xs
                transition-all duration-200
                bg-indigo-600 hover:bg-indigo-700 text-white
                flex items-center justify-center gap-1.5
                hover:shadow-md active:scale-95
              `}
            />
          ) : (
            <Button
              btntext="Out of Stock"
              className="w-full py-2 rounded-xl font-roboto font-semibold text-xs text-red-500 bg-red-50 border border-red-200 flex items-center justify-center cursor-not-allowed"
              disabled={true}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

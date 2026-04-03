import Button from "../../LIBS/Button";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatNumber } from "../../utility/constant";
// import { FaRegHeart } from "react-icons/fa";
// import { FaHeart } from "react-icons/fa";
import {
  AddToCartButton,
  AddRemoveProductFromWishListButton,
} from "../../utility";
import { useTheme } from "../../Context/themeContext";
// const ProductCard = ({ product, userDetail, authToken }) => {
//   const { image, name, price, category, id, rating, stock, sellingPrice } =
//     product;
//   const { theme } = useTheme();

//   return (
//     <div
//       className={`product-card group w-full h-full max-h-[400px] max-w-[300px]  gap-4 border-2  border-gray-00
//  rounded-md p-2 shadow-md relative laptop:hover:scale-105 transition-all duration-300 ease-in-out ${
//    theme === "dark" ? "bg-gray-800" : "bg-gray-100"
//  }`}
//     >
//       <AddRemoveProductFromWishListButton
//         authToken={authToken}
//         productId={id}
//         userDetail={userDetail}
//       />

//       {/* <Link to={"/product/" + id} className="w-full"> */}
//       <img
//         src={image || image[0]}
//         className="aspect-square object-cover w-full z-10 rounded-md object-top "
//         alt={name}
//       />
//       {/* </Link> */}

//       <div className="product-info w-full text-left p-2 relative">
//         {/* <Link to={"/product/" + id} className="w-full"> */}
//         <div className="product-name w-full text-ellipsis overflow-hidden whitespace-nowrap font-roboto text-2xl hover:text-gray-400 mobile:text-lg laptop:text-2xl font-bold">
//           {name}
//         </div>
//         {/* </Link> */}
//         <div className="flex gap-1 items-center justify-between my-1">
//           <div className="product-price font-bold text-xl flex justify-center items-center mobile:text-lg tablet:text-xl font-roboto my-1 ">
//             {/* ₹{(price * 83.71)?.toFixed(2)} */}
//             {formatNumber(price || sellingPrice)}
//           </div>
//           {rating && rating !== null && (
//             <div className="hidden tablet:flex">
//               {[1, 2, 3, 4, 5]?.map((index) => {
//                 return (
//                   <svg
//                     key={index}
//                     className={`w-5 h-5 cursor-pointer ${
//                       index <= Math.round(rating)
//                         ? "text-yellow-500"
//                         : "text-gray-300"
//                     }`}
//                     fill="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
//                   </svg>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//         <div className="w-1/2 text-ellipsis overflow-hidden whitespace-nowrap font-roboto text-base mobile:text-xs tablet:text-sm">
//           {category?.toCapitalize()}
//         </div>
//         <div className="add-to-cart-btn absolute bottom-2 right-0  mobile:bottom-1 laptop::bottom-2 ">
//           {stock > 0 ? (
//             // <Button
//             //   btntext={"Add to Cart"}
//             //   className={
//             //     " py-1 px-2 min-w-16 bg-blue-100 text-blue-600 rounded flex justify-center items-center z-10 font-roboto  outline-none hover:bg-blue-500 hover:text-white mobile:text-xs  tablet:text-[13px] laptop:text-sm laptop:w-max large-device:text-base"
//             //   }
//             //   disabled={false}
//             //   loading={productAdding}
//             //   onClick={(e) => {
//             //     e.preventDefault();
//             //     e.stopPropagation();

//             //     handleAddToCart(
//             //       userDetail,
//             //       id,
//             //       authToken,
//             //       setProductAdding,
//             //       navigate,
//             //       setCartCount
//             //     );
//             //   }}
//             // />
//             <AddToCartButton
//               authToken={authToken}
//               userDetail={userDetail}
//               productId={id}
//               className={
//                 "py-1 px-2 min-w-16   bg-indigo-600 text-white rounded flex justify-center items-center z-10 font-roboto  outline-none hover:bg-indigo-700 hover:text-white mobile:text-xs  tablet:text-[13px] laptop:text-sm laptop:w-max large-device:text-base"
//               }
//               // bg-blue-100 text-blue-600
//             />
//           ) : (
//             <Button
//               btntext={"Out of Stock"}
//               className={
//                 " py-1 px-2 text-red-600 bg-red-100 flex justify-center items-center  text-xs font-roboto rounded mobile:text-xs  tablet:text-[13px] laptop:text-sm laptop:w-max large-device:text-base"
//               }
//               disabled={true}
//               onClick={(e) => {
//                 e.preventDefault();
//                 return;
//               }}
//             />

//             // <p className="text-red-600 flex justify-center items-center bg-red-100 text-xs p-1 font-roboto rounded mobile:text-xs mobile:w-20 tablet:text-[13px] laptop:text-sm laptop:w-max large-device:text-base">
//             //   Out of Stock
//             // </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductCard;

// import { useState } from "react";
// import { Heart } from "lucide-react";
import { FaHeart } from "react-icons/fa";
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
  } = product;
  const { theme } = useTheme();
  // const [isFavorite, setIsFavorite] = useState(false);
  const { authToken } = useAuth();
  const { userDetail } = useUser();
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/product/${id}`);
  };

  return (
    <div
      className={`max-w-xs h-full flex flex-col relative rounded-2xl shadow-lg overflow-hidden border cursor-pointer ${
        theme === "dark" ? "bg-gray-800" : "bg-gray-100"
      } transition-all duration-300`}
      onClick={handleCardClick}
    >
      <div className="relative">
        {/* <img src={image} alt={name} className="w-full h-48 object-cover" /> */}
        <img
          src={image || "#"}
          alt=""
          className="aspect-video object-cover h-36 w-full z-10 border-none rounded-t-2xl "
        />
        {/* <button
          className="absolute top-2 right-2 bg-white rounded-full p-2 shadow"
          onClick={() => setIsFavorite(!isFavorite)}
        >
          <FaHeart
            className={
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"
            }
          />
        </button> */}
        <AddRemoveProductFromWishListButton
          authToken={authToken}
          productId={id}
          userDetail={userDetail}
        />
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div>
          <p className="text-lg font-semibold   product-name w-full text-ellipsis overflow-hidden whitespace-nowrap font-roboto  hover:text-gray-400 mobile:text-lg laptop:text-2xl ">
            {name}
          </p>
          {rating && rating !== null && (
            <>
              <div className="flex gap-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5]?.map((index) => {
                    return (
                      <svg
                        key={index}
                        className={`w-5 h-5 cursor-pointer ${
                          index <= Math.round(rating)
                            ? "text-yellow-500"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
                      </svg>
                    );
                  })}
                </div>
                {ratingNumber && (
                  <span
                    className={`text-gray-500 font-semibold text-sm ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    ({ratingNumber})
                  </span>
                )}
              </div>
            </>
          )}
          {/* <div className="flex items-center space-x-1 text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <span key={i}>★</span>
          ))}
          <span className="text-gray-400">☆</span>
          <span className="text-gray-500 text-sm">({ratingNumber})</span>
        </div> */}
          <div className="flex items-center mt-2">
            <span className="text-xl font-bold">
              {formatNumber(price || sellingPrice)}
            </span>
            <span className="text-gray-400 line-through ml-2">
              {formatNumber(mrpPrice)}
            </span>
          </div>
          {/* <Button
          btntext={"Add to Cart"}
          className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        /> */}
        </div>
        <div className="w-full min-h-10 mt-2 flex-1 relative">
          {stock ? (
            <AddToCartButton
              authToken={authToken}
              userDetail={userDetail}
              productId={id}
              className={
                " py-2 mt-3 min-w-16  absolute bottom-0 w-full rounded-lg  bg-[#4f46e5] text-white  flex justify-center items-center z-10 font-roboto  outline-none hover:bg-indigo-700 hover:text-white mobile:text-xs  tablet:text-[13px] laptop:text-sm large-device:text-base"
              }
              // bg-blue-100 text-blue-600
            />
          ) : (
            <Button
              btntext={"Out of Stock"}
              className={
                "  py-2 mt-3 min-w-16  absolute bottom-0 w-full rounded-lg text-red-600 bg-red-100 flex justify-center items-center  text-xs font-roboto  mobile:text-xs  tablet:text-[13px] laptop:text-sm  large-device:text-base"
              }
              disabled={true}
              onClick={(e) => {
                e.preventDefault();
                return;
              }}
            />
          )}
        </div>
        {/* <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          Add to Cart
        </button> */}
      </div>

      {sellingPrice < mrpPrice && (
        <span className="py-1  px-2 bg-green-500 absolute min-w-20 text-center text-white font-semibold text-lg top-0 left-0 rounded-br-2xl">
          {(((mrpPrice - sellingPrice) / mrpPrice) * 100).toFixed(0)}% OFF
        </span>
      )}
    </div>
  );
};

export default ProductCard;

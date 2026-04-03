import React, { useState, useEffect } from "react";
import { Button, SectionTitle } from "../../LIBS";
import { useTheme } from "../../Context/themeContext";
import { Link, useNavigate } from "react-router-dom";
import { productCategory } from "../../utility/constant";
import ProductCard from "../Product/ProductCard";
import { useAuth } from "../../Context/authContext";

const HomePage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const themeClass =
    theme === "dark" ? " bg-gray-900 text-white" : "bg-white text-gray-900";

  const [recentlyViewedProduct, setRecentlyViewedProduct] = useState([]);

  const bestSellers = [
    {
      id: 1,
      name: "Product 1",
      description: "Best-selling product description.",
    },
    {
      id: 2,
      name: "Product 2",
      description: "Best-selling product description.",
    },
    {
      id: 3,
      name: "Product 3",
      description: "Best-selling product description.",
    },
    {
      id: 4,
      name: "Product 4",
      description: "Best-selling product description.",
    },
    {
      id: 5,
      name: "Product 5",
      description: "Best-selling product description.",
    },
    {
      id: 6,
      name: "Product 6",
      description: "Best-selling product description.",
    },
    {
      id: 7,
      name: "Product 7",
      description: "Best-selling product description.",
    },
    {
      id: 8,
      name: "Product 8",
      description: "Best-selling product description.",
    },
    {
      id: 9,
      name: "Product 9",
      description: "Best-selling product description.",
    },
    {
      id: 10,
      name: "Product 10",
      description: "Best-selling product description.",
    },
  ];
  useEffect(() => {
    setRecentlyViewedProduct(() => {
      return JSON.parse(localStorage?.getItem("recentlyViewed")) || [];
    });
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top on component mount
  }, []);
  return (
    <div className={`${themeClass} min-h-screen transition-all duration-300`}>
      <header
        className={`text-center py-16 px-4 ${
          theme === "dark"
            ? "bg-indigo-900 text-white "
            : "bg-indigo-100 text-gray-900"
        } shadow-lg transition-all duration-300 `}
      >
        <SectionTitle
          title="Discover Amazing Deals"
          className="text-4xl font-bold"
        />
        <p
          className={` ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          } mt-2 transition-all duration-300 `}
        >
          Shop the latest trends with up to 50% off
        </p>
        <Button
          className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700"
          btntext="Shop Now"
          onClick={() => navigate("/products")}
        />
      </header>

      {/* Search by  Categories Section */}
      <section
        className={`  flex flex-col gap-5 p-10 mobile:p-4 mobile:py-6 small-device:p-6 laptop:p-10 ${
          theme === "dark"
            ? " bg-gray-800 text-white"
            : "bg-[#f9fafb] text-gray-900"
        } transition-all duration-300 `}
      >
        <h2 className="font-roboto text-2xl mobile:text-lg font-bold">
          Shop By Category
        </h2>
        <div className="flex justify-center w-full flex-wrap gap-4 ">
          {productCategory?.map((category) => (
            <Button
              key={category.id}
              btntext={category.value}
              className={`px-4 py-2   rounded-md mobile:text-sm tablet:text-base font-medium ${
                theme === "dark"
                  ? "bg-gray-700 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
              onClick={() => {
                navigate(`/products?category=${category.value}`);
              }}
            />
          ))}
        </div>
      </section>
      {/* Recently Viewed Product Section */}
      {recentlyViewedProduct.length > 0 && (
        <section className="flex flex-col gap-5 p-10 mobile:p-4 mobile:py-6 small-device:p-6 laptop:p-10 transition-all duration-300">
          <h2 className="font-roboto text-2xl mobile:text-lg font-bold">
            Recently Viewed Items
          </h2>
          <div className=" grid gap-4 grid-cols-1 mobile:grid-cols-2 small-device:grid-cols-3 tablet:grid-cols-4 laptop:grid-cols-4 desktop:grid-cols-6 large-device:grid-cols-6">
            {recentlyViewedProduct?.map((item) => (
              <Link
                to={"/product/" + (item?.id || item?._id)}
                className="w-full h-full "
                key={item?.id || item?._id}
              >
                <ProductCard product={item} />
              </Link>
            ))}
          </div>
        </section>
      )}
      {/* Best Seller Items */}
      {/* <section
        className={`  flex flex-col gap-5 p-10 mobile:p-4 mobile:py-6 small-device:p-6 laptop:p-10  transition-all duration-300 `}
      >
        <h2 className="font-roboto text-2xl mobile:text-lg font-bold">
          Best Sellers
        </h2>
        <div className="grid grid-cols-1 mobile:grid-cols-2 mobile:gap-3 small-device:grid-cols-3 small-device:gap-4 tablet:grid-cols-4 tablet:gap-5 laptop:grid-cols-5 laptop:gap-6 gap-6 ">
          {bestSellers.map((product) => (
            <ProductCard product={product} key={product?.id} />
          ))}
        </div>
      </section> */}
    </div>
  );
};
export default HomePage;

// import { useState, useRef, useEffect } from "react";
// import {
//   FaSun,
//   FaMoon,
//   FaShoppingCart,
//   FaHeart,
//   FaSearch,
// } from "react-icons/fa";
// import { useTheme } from "../../Context/themeContext";

// const HomePage = () => {
//   const { theme, toggleTheme } = useTheme();

//   return (
//     <div className={theme === "dark" ? "dark" : ""}>
//       <div
//         className={`min-h-screen  ${
//           theme === "dark" ? "text-white bg-gray-900" : "text-gray-900 bg-white"
//         }`}
//       >
//         {/* Navbar */}
//         <nav className={`flex justify-between items-center p-4 shadow-md`}>
//           <h1 className="text-xl font-bold text-purple-600">Browse Mart</h1>
//           <div className="flex items-center gap-4">
//             <input
//               type="text"
//               placeholder="Search products..."
//               className={`px-2 py-1 border rounded-md  ${
//                 theme === "dark" ? "text-white bg-gray-700" : ""
//               }`}
//             />
//             <FaSearch
//               className={` ${
//                 theme === "dark" ? "text-white" : "text-gray-600"
//               }`}
//             />
//             <FaHeart
//               className={` ${
//                 theme === "dark" ? "text-white" : "text-gray-600"
//               }`}
//             />
//             <FaShoppingCart
//               className={` ${
//                 theme === "dark" ? "text-white" : "text-gray-600"
//               }`}
//             />
//             <button onClick={toggleTheme} className="p-2">
//               {toggleTheme === "dark" ? (
//                 <FaSun className="text-yellow-400" />
//               ) : (
//                 <FaMoon className="text-gray-600" />
//               )}
//             </button>
//           </div>
//         </nav>

//         {/* Hero Section */}
//         <section
//           className={` text-center p-10   ${
//             theme === "dark" ? "bg-gray-800" : "bg-purple-100"
//           }`}
//         >
//           <h2 className="text-3xl font-bold">Discover Amazing Deals</h2>
//           <p className="mt-2">
//             Shop the latest trends with up to 50% off on selected items
//           </p>
//           <button className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-md">
//             Shop Now
//           </button>
//         </section>

//         {/* Categories */}
//         <section className="flex justify-center gap-4 p-6">
//           {["Electronics", "Fashion", "Home", "Sports", "Books", "More"].map(
//             (category) => (
//               <button
//                 key={category}
//                 className={`px-4 py-2   rounded-md ${
//                   theme === "dark" ? "bg-gray-700" : "bg-gray-200"
//                 }`}
//               >
//                 {category}
//               </button>
//             )
//           )}
//         </section>

//         {/* Best Sellers */}
//         <section className="p-6">
//           <h3 className="text-xl font-bold">Best Sellers</h3>
//           <div className="grid grid-cols-1 mobile:grid-cols-2 laptop:grid-cols-4 gap-4 mt-4">
//             {[
//               {
//                 name: "Premium Smartphone",
//                 price: "$899",
//                 oldPrice: "$999",
//                 reviews: "245",
//               },
//               {
//                 name: "Wireless Headphones",
//                 price: "$199",
//                 oldPrice: "$249",
//                 reviews: "189",
//               },
//               {
//                 name: "Smart Watch",
//                 price: "$299",
//                 oldPrice: "$349",
//                 reviews: "158",
//               },
//               {
//                 name: "Wireless Earbuds",
//                 price: "$149",
//                 oldPrice: "$199",
//                 reviews: "268",
//               },
//             ].map((product) => (
//               <div
//                 key={product.name}
//                 className={`border p-4 rounded-md  ${
//                   theme === "dark" ? "" : "bg-gray-800"
//                 }`}
//               >
//                 <div className="flex justify-between items-center">
//                   <h4 className="text-lg font-semibold">{product.name}</h4>
//                   <FaHeart
//                     className={` ${
//                       theme === "dark" ? "text-white" : "text-gray-600"
//                     }`}
//                   />
//                 </div>
//                 <p className="text-purple-600 font-bold">
//                   {product.price}{" "}
//                   <span className="line-through text-gray-500">
//                     {product.oldPrice}
//                   </span>
//                 </p>
//                 <p
//                   className={`text-sm   ${
//                     theme === "dark" ? "text-gray-300" : "text-gray-500"
//                   }`}
//                 >
//                   ⭐ {product.reviews} reviews
//                 </p>
//                 <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md">
//                   Add to Cart
//                 </button>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Footer */}
//         <footer className="p-6 bg-gray-900 text-white">
//           <div className="grid grid-cols-1 laptop:grid-cols-4 gap-4">
//             <div>
//               <h4 className="font-bold">Browse Mart</h4>
//               <p>Your one-stop shop for all things amazing.</p>
//             </div>
//             <div>
//               <h4 className="font-bold">Quick Links</h4>
//               <ul>
//                 <li>About Us</li>
//                 <li>Contact</li>
//                 <li>FAQs</li>
//                 <li>Shipping</li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="font-bold">Customer Service</h4>
//               <ul>
//                 <li>My Account</li>
//                 <li>Track Order</li>
//                 <li>Returns</li>
//                 <li>Wishlist</li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="font-bold">Newsletter</h4>
//               <input
//                 type="email"
//                 placeholder="Your email"
//                 className="px-2 py-1 w-full text-black rounded-md"
//               />
//               <button className="mt-2 w-full px-4 py-2 bg-purple-600 text-white rounded-md">
//                 Subscribe
//               </button>
//             </div>
//           </div>
//           <p className="text-center mt-4">
//             © 2025 Browse Mart. All rights reserved.
//           </p>
//         </footer>
//       </div>
//     </div>
//   );
// };

// export default HomePage;
// flex flex-col gap-5 p-10 mobile:p-4 mobile:py-6 small-device:p-6 laptop:p-10 transition-all duration-300
// flex overflow-scroll gap-4 grid-cols-1 mobile:grid-cols-2 small-device:grid-cols-3 tablet:grid-cols-4 laptop:grid-cols-4 desktop:grid-cols-6 large-device:grid-cols-6

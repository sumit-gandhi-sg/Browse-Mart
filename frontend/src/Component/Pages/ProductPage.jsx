import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaShare, FaShieldAlt, FaTruck, FaUndo } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { BsBoxSeam, BsLightningChargeFill } from "react-icons/bs";
import { FiShoppingCart } from "react-icons/fi";
import ProductCard from "../Product/ProductCard";
import { Button, Loader, ServerError } from "../../LIBS";
import { ReviewForm, ReviewCard } from "../Review";
import ProductImage from "../Product/ProductImage";
import { formatNumber, socialMedia } from "../../utility/constant";
import AddToCartButton from "../../utility/AddToCartButton";
import { useTheme } from "../../Context/themeContext";
import { useAuth } from "../../Context/authContext";
import pageNotFind from "../../assets/images/pageNotFind.jpg";
import { useUser } from "../../Context/userContext";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

// ── Trust Badge Component ──────────────────────────────────────────────────────
const TrustBadge = ({ icon, label, sub, isDark }) => (
  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 min-w-[120px]
    ${isDark ? "border-gray-700 bg-gray-800/60" : "border-gray-200 bg-gray-50"}`}
  >
    <span className="text-indigo-500 text-xl flex-shrink-0">{icon}</span>
    <div>
      <p className={`text-xs font-semibold font-roboto ${isDark ? "text-white" : "text-gray-800"}`}>{label}</p>
      <p className={`text-[10px] font-roboto ${isDark ? "text-gray-400" : "text-gray-500"}`}>{sub}</p>
    </div>
  </div>
);

// ── Star Rating Row ────────────────────────────────────────────────────────────
const StarRow = ({ rating, count, isDark }) => (
  <div className="flex items-center gap-2">
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i <= Math.round(rating) ? "text-yellow-400" : isDark ? "text-gray-600" : "text-gray-300"}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
        </svg>
      ))}
    </div>
    {count > 0 && (
      <span className={`text-sm font-roboto font-semibold ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
        {rating?.toFixed(1)} <span className={`font-normal ${isDark ? "text-gray-400" : "text-gray-500"}`}>({count} reviews)</span>
      </span>
    )}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
const ProductPage = () => {
  const currentURL = window.location.href;
  const { productId } = useParams();
  const [productData, setProductData] = useState({});
  const [relatedProduct, setRelatedProduct] = useState([]);
  const [isDataFetch, setIsDataFetch] = useState(false);
  const [isReviewClicked, setIsReviewClicked] = useState(false);
  const [isRefreshClicked, setIsRefreshClicked] = useState(false);
  const [isShareShow, setIsShareShow] = useState(false);
  const [isError, setIsError] = useState({});
  const [isExpened, setIsExpened] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const location = useLocation();
  const message = `🚀 Exciting News! 🌟\n\nI just discovered the **${productData?.name}** and I can't stop raving about it! 🎉\n\n✨ **Why You'll Love It**:\n- Top-notch quality that speaks for itself!\n- Perfect for tech enthusiasts.\n- Limited-time offer: Don't miss out! 🕒\n\n👉 Check it out here: ${currentURL}\n\n💬 Let me know what you think, and tag your friends who need this in their lives!`;
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { authToken } = useAuth();
  const { userDetail } = useUser();
  const isDark = theme === "dark";

  const handleClick = () => {
    setIsReviewClicked((isReview) => !isReview);
  };

  const getProductDataById = () => {
    setIsDataFetch(false);
    axios({
      method: "get",
      url: `${SERVER_URL}/api/product/${productId}`,
    })
      .then((response) => {
        const { data, status } = response;
        if (status === 200) {
          setProductData(data?.product);
        }
        setIsDataFetch(true);
      })
      .catch((error) => {
        const { data, status } = error?.response || {};
        if (status === 404) {
          console.log("Product not found", data);
          setIsError({ message: data?.message, status: status });
          setIsDataFetch(true);
        } else {
          setIsError({ error: "Internal Server Error", status: 500 });
          setIsDataFetch(true);
        }
      });
  };

  const addToRecentlyViewed = (product) => {
    let totalStarRating = 0;
    product?.review?.map((review) => (totalStarRating += review?.rating));
    let recentlyViewed =
      JSON.parse(localStorage.getItem("recentlyViewed")) || [];
    const modifiedProduct = {
      id: product?.id || product?._id,
      name: product?.name,
      price: product?.price,
      description: product?.description,
      image: product?.image?.[0],
      category: product?.category,
      stock: product?.stock,
      rating: Number(totalStarRating / product?.review?.length),
      ratingNumber: product?.review?.length,
      mrpPrice: product?.mrpPrice,
      sellingPrice: product?.sellingPrice,
      isAddedToWislist: false,
    };

    recentlyViewed = recentlyViewed.filter(
      (p) => (p.id || p._id) !== modifiedProduct.id
    );
    recentlyViewed.unshift(modifiedProduct);
    if (recentlyViewed.length > 5) {
      recentlyViewed.pop();
    }
    localStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed));
  };

  const getRelatedProduct = async () => {
    try {
      const response = await axios.get(
        `${SERVER_URL}/api/product/get-related-product`,
        {
          params: {
            category: productData?.category?._id || productData?.category,
            productId,
          },
        }
      );
      setRelatedProduct(response?.data?.product);
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  // eslint-disable-next-line
  useEffect(() => {
    getProductDataById();
  }, [productId, isRefreshClicked]);
  // eslint-disable-next-line
  useEffect(() => {
    if (productData?.id || productData?._id) {
      addToRecentlyViewed(productData);
    }
    if (productData?.category) {
      getRelatedProduct();
    }
  }, [productData]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Sticky Add-to-Cart bar scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 320);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Computed values ──────────────────────────────────────────────────────────
  const reviews = productData?.review || [];
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r?.rating || 0), 0) / reviews.length
      : 0;
  const mrp = productData?.mrpPrice;
  const selling = productData?.sellingPrice || productData?.price;
  const discountPct =
    mrp && selling && mrp > selling
      ? Math.round(((mrp - selling) / mrp) * 100)
      : null;
  const isLowStock = productData?.stock > 0 && productData?.stock < 10;

  // ── Error / Loading states ───────────────────────────────────────────────────
  if (!isDataFetch && !isReviewClicked) return <Loader />;
  if (isError?.status === 404) {
    return (
      <div className={`w-full h-screen flex justify-center items-center ${isDark ? "bg-gray-900 text-white" : "bg-gray-100"}`}>
        <div className="flex flex-col gap-4 items-center">
          <img src={pageNotFind} className="h-[400px] rounded-3xl" alt="Page Not Found" />
          <div className="font-roboto text-ellipsis text-lg">
            <p>Ohh....</p>
            <p className="">{isError?.message}!</p>
          </div>
        </div>
      </div>
    );
  }
  if (isError?.status === 500) return <ServerError />;

  // ── Main Render ──────────────────────────────────────────────────────────────
  return (
    productData && relatedProduct && (
      <div className={`product-page-section transition-all duration-300 ${isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>

        {/* ── Sticky Add-to-Cart Bar ─────────────────────────────────────────── */}
        <div className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-300 ease-in-out shadow-lg
          ${showStickyBar ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}
          ${isDark ? "bg-gray-900/95 border-b border-gray-700" : "bg-white/95 border-b border-gray-200"}
          backdrop-blur-md
        `}>
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <p className={`font-roboto font-semibold text-sm truncate flex-1 ${isDark ? "text-white" : "text-gray-900"}`}>
              {productData?.name}
            </p>
            <div className="flex items-center gap-3">
              <span className={`font-bold text-lg font-roboto ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
                {formatNumber(selling)}
              </span>
              {productData?.stock ? (
                userDetail && authToken ? (
                  <div className="flex gap-2">
                    <AddToCartButton
                      authToken={authToken}
                      userDetail={userDetail}
                      productId={productId}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-roboto px-4 py-2 rounded-lg transition-all duration-200"
                    />
                    <Link to={"/product/buy/" + productId}>
                      <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-roboto px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-1">
                        <BsLightningChargeFill className="text-xs" />
                        Buy Now
                      </button>
                    </Link>
                  </div>
                ) : (
                  <Link to={`/login?redirect=${encodeURIComponent(location?.pathname)}`}>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-roboto px-4 py-2 rounded-lg transition-all duration-200">
                      Login to Buy
                    </button>
                  </Link>
                )
              ) : (
                <span className="text-red-500 text-sm font-semibold font-roboto">Out of Stock</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Hero Section: Image + Info ─────────────────────────────────────── */}
        <div className="flex p-3 gap-3 mobile:flex-col tablet:flex-row max-w-7xl mx-auto">

          {/* Product Image Gallery */}
          <ProductImage productData={productData} />

          {/* Product Info Panel */}
          <div className="product-description w-1/2 mobile:w-full tablet:w-1/2 flex flex-col gap-4 py-4 pr-2">

            {/* Category Badge */}
            {productData?.category?.name && (
              <span className={`
                inline-flex w-max items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full font-roboto
                ${isDark ? "bg-indigo-900/50 text-indigo-300 border border-indigo-700" : "bg-indigo-50 text-indigo-600 border border-indigo-200"}
              `}>
                <BsBoxSeam className="text-xs" />
                {productData?.category?.name?.toUpperCase()}
              </span>
            )}

            {/* Product Title */}
            <h1 className={`product-name font-roboto font-bold text-2xl tablet:text-3xl text-left leading-snug ${isDark ? "text-white" : "text-gray-900"}`}>
              {productData?.name}
            </h1>

            {/* Ratings Row */}
            {reviews.length > 0 && (
              <StarRow rating={avgRating} count={reviews.length} isDark={isDark} />
            )}

            {/* Divider */}
            <div className={`border-t ${isDark ? "border-gray-700" : "border-gray-200"}`} />

            {/* Pricing Block */}
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className={`text-3xl font-bold font-roboto ${isDark ? "text-white" : "text-gray-900"}`}>
                  {formatNumber(selling)}
                </span>
                {mrp && mrp > selling && (
                  <span className={`text-lg line-through font-roboto ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    {formatNumber(mrp)}
                  </span>
                )}
                {discountPct && (
                  <span className="text-sm font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-roboto">
                    {discountPct}% OFF
                  </span>
                )}
              </div>
              <p className={`text-xs font-roboto ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Inclusive of all taxes
              </p>
            </div>

            {/* Low Stock Urgency */}
            {isLowStock && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl">
                <span className="text-red-500 text-sm">⚠️</span>
                <p className="text-red-600 font-semibold text-sm font-roboto">
                  Only {productData?.stock} left in stock — order soon!
                </p>
              </div>
            )}

            {/* Out of Stock */}
            {!productData?.stock && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl">
                <span className="text-red-500">❌</span>
                <p className="text-red-600 font-semibold text-sm font-roboto">Currently Out of Stock</p>
              </div>
            )}

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2">
              <TrustBadge icon={<FaTruck />} label="Free Delivery" sub="On orders above ₹499" isDark={isDark} />
              <TrustBadge icon={<FaUndo />} label="Easy Returns" sub="7-day return policy" isDark={isDark} />
              <TrustBadge icon={<FaShieldAlt />} label="Secure Payment" sub="100% safe checkout" isDark={isDark} />
            </div>

            {/* Divider */}
            <div className={`border-t ${isDark ? "border-gray-700" : "border-gray-200"}`} />

            {/* CTA Buttons */}
            <div className="buy-buttons flex gap-3 w-full">
              {userDetail && authToken ? (
                productData?.stock ? (
                  <div className="w-full flex gap-3">
                    <AddToCartButton
                      authToken={authToken}
                      userDetail={userDetail}
                      productId={productId}
                      className={`
                        flex-1 flex items-center justify-center gap-2
                        py-3 rounded-xl font-roboto font-semibold text-base
                        border-2 border-indigo-500 text-indigo-600
                        hover:bg-indigo-50 active:bg-indigo-100
                        transition-all duration-200
                        ${isDark ? "text-indigo-400 hover:bg-indigo-900/30 border-indigo-500" : ""}
                      `}
                    />
                    <Link to={"/product/buy/" + productId} className="flex-1">
                      <button className="
                        w-full py-3 rounded-xl font-roboto font-semibold text-base
                        bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
                        text-white flex items-center justify-center gap-2
                        shadow-md hover:shadow-indigo-200 transition-all duration-200
                        hover:scale-[1.02] active:scale-100
                      ">
                        <BsLightningChargeFill />
                        Buy Now
                      </button>
                    </Link>
                  </div>
                ) : null
              ) : (
                <Link to={`/login?redirect=${encodeURIComponent(location?.pathname)}`} className="w-full">
                  <button className="
                    w-full py-3 rounded-xl font-roboto font-semibold text-base
                    bg-indigo-600 hover:bg-indigo-700 text-white
                    flex items-center justify-center gap-2
                    shadow-md transition-all duration-200 hover:scale-[1.02]
                  ">
                    <FiShoppingCart />
                    Login to Buy
                  </button>
                </Link>
              )}
            </div>

            {/* Delivery Estimate */}
            <div className={`flex items-center gap-2 text-sm font-roboto ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              <FaTruck className="text-indigo-500" />
              <span>Estimated delivery: <strong className={isDark ? "text-white" : "text-gray-900"}>3–5 business days</strong></span>
            </div>

            {/* Share Button */}
            <div className={`border-t pt-3 ${isDark ? "border-gray-700" : "border-gray-200"}`}>
              <div className="flex flex-col gap-3">
                {/* Share trigger */}
                <button
                  onClick={() => setIsShareShow((prev) => !prev)}
                  className={`
                    flex items-center gap-2 w-max text-sm font-semibold font-roboto
                    px-4 py-2 rounded-xl border transition-all duration-200
                    ${isDark
                      ? "border-gray-600 text-gray-300 hover:border-indigo-500 hover:text-indigo-400 hover:bg-indigo-900/20"
                      : "border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
                    }
                  `}
                >
                  <FaShare className={`transition-transform duration-300 ${isShareShow ? "rotate-45" : "rotate-0"}`} />
                  {isShareShow ? "Close" : "Share this product"}
                </button>

                {/* Animated share panel */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isShareShow ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
                }`}>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      {
                        name: "WhatsApp",
                        href: `https://wa.me/?text=${encodeURIComponent(message)}`,
                        bg: "bg-[#25D366] hover:bg-[#1ebe5d]",
                        icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.997 2C6.477 2 2 6.477 2 11.997c0 1.761.459 3.411 1.26 4.845L2 22l5.27-1.236A9.953 9.953 0 0011.997 22c5.52 0 9.997-4.477 9.997-9.997S17.517 2 11.997 2zm0 18.188a8.176 8.176 0 01-4.165-1.138l-.299-.178-3.128.733.745-3.063-.194-.311a8.188 8.188 0 119.041 3.957z"/></svg>,
                      },
                      {
                        name: "LinkedIn",
                        href: `https://www.linkedin.com/messaging/compose?message=${encodeURIComponent(message)}`,
                        bg: "bg-[#0077B5] hover:bg-[#006399]",
                        icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
                      },
                      {
                        name: "Email",
                        href: `mailto:?body=${encodeURIComponent(message)}`,
                        bg: "bg-[#EA4335] hover:bg-[#d33b2c]",
                        icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>,
                      },
                    ].map((platform) => (
                      <a
                        key={platform.name}
                        href={platform.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-white text-xs font-semibold font-roboto transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm ${platform.bg}`}
                      >
                        {platform.icon}
                        {platform.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Product Description ────────────────────────────────────────────── */}
        <div className={`mx-auto max-w-7xl px-5 py-6 rounded-2xl mx-3 my-4
          ${isDark ? "bg-gray-800/40 border border-gray-700" : "bg-gray-50 border border-gray-200"}`}
        >
          <h2 className={`text-xl font-bold font-roboto mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
            Product Description
          </h2>
          <p className={`font-roboto text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            {isExpened
              ? productData?.description
              : productData?.description?.toString()?.substring(0, 300)}
            {productData?.description?.length > 300 && (
              <span
                className="text-indigo-500 font-semibold cursor-pointer ml-1 hover:text-indigo-400 transition-colors"
                onClick={() => setIsExpened(!isExpened)}
              >
                {isExpened ? " Read Less" : " Read More"}
              </span>
            )}
          </p>
        </div>

        {/* ── Reviews Section ────────────────────────────────────────────────── */}
        <div className="review-section px-4 py-6 max-w-7xl mx-auto">
          <div className="flex gap-3 justify-between mb-5 items-center">
            <div>
              <h2 className={`text-2xl font-bold font-roboto ${isDark ? "text-white" : "text-gray-900"}`}>
                Customer Reviews
              </h2>
              {reviews.length > 0 && (
                <p className={`text-sm font-roboto mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  {reviews.length} review{reviews.length !== 1 ? "s" : ""} · {avgRating.toFixed(1)} avg rating
                </p>
              )}
            </div>
            {userDetail && authToken && (
              <button
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-white font-roboto text-sm font-semibold transition-all duration-200 flex items-center gap-2 hover:scale-[1.02]"
                onClick={handleClick}
              >
                <MdVerified />
                Write a Review
              </button>
            )}
          </div>

          {reviews.length > 0 ? (
            <div className="flex gap-4 flex-wrap mobile:flex-col small-device:flex-row">
              {reviews.map((review, index) => (
                <ReviewCard review={review} key={index} />
              ))}
            </div>
          ) : (
            <div className={`
              flex flex-col items-center justify-center py-12 rounded-2xl border-2 border-dashed
              ${isDark ? "border-gray-700 text-gray-500" : "border-gray-300 text-gray-400"}
            `}>
              <svg className="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p className="text-base font-semibold font-roboto">No reviews yet</p>
              <p className="text-sm font-roboto mt-1">Be the first to share your experience!</p>
            </div>
          )}
        </div>

        {/* ── Related Products ───────────────────────────────────────────────── */}
        {relatedProduct.length > 0 && (
          <div className={`related-product-section px-4 py-6 mt-2 border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-7 bg-indigo-500 rounded-full" />
                <h2 className={`font-bold font-roboto text-2xl mobile:text-xl ${isDark ? "text-white" : "text-gray-900"}`}>
                  You May Also Like
                </h2>
              </div>
              <div className="w-full grid grid-cols-5 mobile:grid-cols-2 small-device:grid-cols-3 tablet:grid-cols-4 laptop:grid-cols-5 gap-3 items-stretch">
                {relatedProduct.map((product) => (
                  <div key={product?.id || product?._id}>
                    <ProductCard
                      product={product}
                      authToken={authToken}
                      userDetail={userDetail}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Review Popup ───────────────────────────────────────────────────── */}
        {isReviewClicked && (
          <ReviewForm
            onClose={handleClick}
            productId={productData?.["_id"]}
            setIsRefreshClicked={setIsRefreshClicked}
            userDetail={userDetail}
            authToken={authToken}
          />
        )}

      </div>
    )
  );
};

export default ProductPage;

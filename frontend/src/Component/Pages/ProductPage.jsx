import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaShare } from "react-icons/fa";
import ProductCard from "../Product/ProductCard";
import { Button, Loader, ServerError } from "../../LIBS";
import { ReviewForm, ReviewCard } from "../Review";
import ProductImage from "../Product/ProductImage";
import { formatNumber, socialMedia } from "../../utility/constant";
import AddToCartButton from "../../utility/AddToCartButton";
import { useTheme } from "../../Context/themeContext";
import { useAuth } from "../../Context/authContext";
// import { SERVER_URL } from "../../config";
import pageNotFind from "../../assets/images/pageNotFind.jpg";
import { useUser } from "../../Context/userContext";
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

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
  const location = useLocation();
  const message = `🚀 Exciting News! 🌟\n\nI just discovered the **${productData?.name}** and I can't stop raving about it! 🎉\n\n✨ **Why You’ll Love It**:\n- Top-notch quality that speaks for itself!\n- Perfect for tech enthusiasts.\n- Limited-time offer: Don't miss out! 🕒\n\n👉 Check it out here: ${currentURL}\n\n💬 Let me know what you think, and tag your friends who need this in their lives!`;
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { authToken } = useAuth();
  const { userDetail } = useUser();
  const handleClick = () => {
    setIsReviewClicked((isReview) => !isReview);
  };
  const getProductDataById = () => {
    setIsDataFetch(false);
    axios({
      method: "get",
      url: `${SERVER_URL}/api/product/${productId}`,
      // data: {
      //   productId: productId,
      //   quantity: 1,
      // },
    })
      .then((response) => {
        const { data, status } = response;
        if (status === 200) {
          setProductData(data?.product);
        } else {
          // Handle error
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
            category: productData?.category,
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

  if (!isDataFetch && !isReviewClicked) return <Loader />; // Loading state while data is fetched.  Replace with your own loading component.  e.g., <Loading /> or <CircularProgress /> from material-ui.  Also, add error handling here.  e.g., axios.get().catch(error => console.error(error))
  if (isError?.status === 404) {
    return (
      <div
        className={`w-full h-screen flex justify-center items-center  ${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100"
        }`}
      >
        <div className="flex flex-col gap-4 items-center">
          <img
            src={pageNotFind}
            className="h-[400px] rounded-3xl"
            alt="Page Not Found"
          />
          <div className="font-roboto text-ellipsis text-lg">
            <p>Ohh....</p>
            <p className="">{isError?.message}!</p>
          </div>
        </div>
      </div>
    );
  }
  if (isError?.status === 500) return <ServerError />;
  return (
    productData &&
    relatedProduct && (
      // productData && (
      <div
        className={`product-page-section py-5 transition-all duration-300 ${
          theme === "dark"
            ? " bg-gray-900 text-white"
            : "bg-white text-gray-900"
        }`}
      >
        {/* product detail section */}

        <div className="flex p-3 gap-3 mobile:flex-col tablet:flex-row">
          {/* product image section */}
          <ProductImage productData={productData} />

          {/* product description section */}

          <div className="product-description w-1/2 mobile:w-full tablet:w-1/2 flex flex-col gap-3 ">
            <h1 className="product-name font-roboto font-bold text-2xl text-left">
              {productData?.name}
            </h1>
            <p className="product-description font-roboto">
              {isExpened
                ? productData?.description
                : productData?.description?.toString()?.substring(0, 250)}
              {productData?.description?.length > 250 && (
                <span
                  className=" text-blue-500 underline text-sm font-semibold cursor-pointer"
                  onClick={() => setIsExpened(!isExpened)}
                >
                  {isExpened ? " Read Less" : " Read More"}
                </span>
              )}
            </p>
            <p className="product-price text-left">
              {formatNumber(productData?.price || productData?.sellingPrice)}
            </p>

            <div className="buy-buttons  flex gap-3 w-full   ">
              {userDetail && authToken ? (
                productData?.stock ? (
                  <div className="w-full flex gap-4">
                    {/* <Button
                      btntext={"Add to Cart"}
                      className={
                        "bg-blue-200 rounded w-1/2 font-roboto text-white p-2"
                      }
                      onClick={() =>
                        handleAddToCart(
                          userDetail,
                          productId,
                          authToken,
                          setProductAdding,
                          navigate,
                          setCartCount
                        )
                      }
                      loading={productAdding}
                    /> */}
                    <AddToCartButton
                      authToken={authToken}
                      userDetail={userDetail}
                      productId={productId}
                      className={
                        "bg-blue-200 rounded w-1/2 font-roboto text-white p-2"
                      }
                    />
                    <Link to={"/product/buy/" + productId} className="w-1/2">
                      <Button
                        btntext={"Buy Now"}
                        className={
                          "bg-blue-500 rounded w-full text-white p-2 shadow-md hover:scale-105 transition-all active:bg-blue-100"
                        }
                      />
                    </Link>
                  </div>
                ) : (
                  <p className="text-center text-red-500">Out of Stock</p>
                )
              ) : (
                <Link
                  to={`/login?redirect=${encodeURIComponent(
                    location?.pathname
                  )}`}
                  className="w-full"
                >
                  <Button
                    btntext={"Login to Buy"}
                    className={
                      "bg-blue-500 rounded w-full text-white p-2 shadow-md hover:scale-105 transition-all active:bg-blue-100"
                    }
                  />
                </Link>
              )}
            </div>

            {/* Share Button */}
            <div className="flex flex-col mobile:flex-row tablet:flex-col gap-2 ">
              <span onClick={() => setIsShareShow((prev) => !prev)}>
                <FaShare className="text-3xl cursor-pointer p-1 text-blue-400 rounded-full hover:bg-blue-400 hover:text-white" />
              </span>
              {isShareShow && (
                <div className="flex flex-col mobile:flex-row tablet:flex-col gap-2 w-min  h-min">
                  {socialMedia.map((media, index) => (
                    <div className="group relative">
                      <span
                        className={`bg-blue-400 absolute bottom-0 left-10 mobile:-left-3 mobile:-bottom-8  tablet:left-10 tablet:bottom-0 text-white text-xs hidden p-1 rounded group-hover:block`}
                      >
                        {media.name}
                      </span>
                      <a
                        href={media.link + encodeURIComponent(message)}
                        key={index}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-media-icon "
                      >
                        {media.icon}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* related product section */}

        <div className="related-product-section p-4 mt-4">
          {relatedProduct.length > 0 && (
            <h2 className=" font-bold my-6 font-roboto text-2xl mobile:text-xl  w-max min-w-[10rem] ">
              item you may like it
            </h2>
          )}
          <div className="">
            <div
              className={` w-full grid grid-cols-5 mobile:grid-cols-2 small-device:grid-cols-3 tablet:grid-cols-4 laptop:grid-cols-5 gap-3 items-stretch`}
            >
              {relatedProduct.length > 0 &&
                relatedProduct.map((product, index) => {
                  return (
                    <div key={product?.id || product?._id}>
                      <ProductCard
                        product={product}
                        authToken={authToken}
                        userDetail={userDetail}
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* review section  */}

        <div className="review-section p-4">
          <div className="flex gap-3 justify-between mb-3 items-center ">
            <h2 className="text-4xl p-2 font-roboto font-bold">Reviews</h2>
            {/* <p className="text-sm text-gray-500">
              {productData?.review?.length} reviews
            </p> */}
            {userDetail && authToken && (
              <Button
                btntext={"Write a Review"}
                className={
                  "rounded bg-blue-500 hover:bg-blue-700 p-2 text-white font-roboto text-sm w-max h-max"
                }
                onClick={handleClick}
              />
            )}
          </div>

          {/* all review section */}
          {productData?.review?.length > 0 && (
            <div className="flex gap-4 overflow-scroll mobile:flex-col mobile:overflow-hidden small-device:flex-row small-device:overflow-scroll ">
              {productData?.review?.map((review, index) => {
                return <ReviewCard review={review} key={index} />;
              })}
            </div>
          )}
        </div>

        {/* review popup  */}

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
      // ).
    )
  );
};

export default ProductPage;

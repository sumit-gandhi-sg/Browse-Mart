import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Productcard from "./ProductCard";
import { Loader, ServerError } from "../../LIBS";
import { useTheme } from "../../Context/themeContext";
import { useAuth } from "../../Context/authContext";
import noResultImage from "../../assets/images/noResult.png";
import { useUser } from "../../Context/userContext";
// import { SERVER_URL } from "../../config";
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

console.log(SERVER_URL);
const ProductsContainer = () => {
  const location = useLocation();
  const { theme } = useTheme();
  const { authToken } = useAuth();
  const { userDetail } = useUser();
  const [allProduct, SetAllProduct] = useState();
  const [allCategories, SetAllCategories] = useState();
  const [filteredProduct, SetFilteredProduct] = useState();
  const [filteredCategory, SetFilteredCategory] = useState([]);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [error, setError] = useState({});
  const searchQuery = new URLSearchParams(location?.search)
    ?.get("q")
    ?.toString()
    ?.trim();
  const searchCategory = new URLSearchParams(location?.search)
    ?.get("category")
    ?.toString()
    ?.trim();
  const handleSubmit = (e) => {
    e.preventDefault();
    // const formElement = Array.from(e.target.elements).slice(0, -1);
    // console.log(formElement);
    // formElement.map((element, index) => {
    //   console.log(element.checked);
    //   console.log(element.value);
    //   if (element.checked) {
    //     SetFilteredProduct(
    //       allProduct?.filter((item) => item.category.includes(element.value))
    //     );
    //   }
    // });
    let filter = [];
    filteredCategory.forEach((category) => {
      const products = allProduct?.filter((item) =>
        item.category.includes(category)
      );
      filter = [...filter, ...products];
    });
    SetFilteredProduct(filter);
  };
  const getAllProduct = () => {
    axios
      .get(`${SERVER_URL}/api/product/get-all-products`, {
        params: { activeUserId: userDetail?.id, searchQuery, searchCategory },
      })
      .then((response) => {
        const { data, status } = response;
        if (status === 200) {
          SetAllProduct(data?.products);
          SetFilteredProduct(data?.products);
        }
      })
      .catch((error) => {
        const { message = "" } = error || error?.response?.data?.message;

        setError({ errorMessage: message });
      })
      .finally(() => setIsDataFetched(true));
  };

  // const getAllCategory = () => {
  //   try {
  //     axios
  //       .get(API_URL + "products/categories")
  //       .then((response) => SetAllCategories(response.data));
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const handleChange = (e) => {
    if (e.target.checked) {
      SetFilteredCategory((previous) => [...previous, e.target.value]);
    }
    // e.target.checked
    //   ? SetFilteredProduct(
    //       allProduct?.filter((item) => item.category.includes(e.target.value))
    //     )
  };

  useEffect(() => {
    // axios
    //   .get(API_URL + "products")
    //   .then((response) => {
    //     SetAllProduct(response.data);
    //     SetFilteredProduct(response.data);
    //     setIsDataFetch(true);
    //   })
    //   .catch((error) => console.log(error));
    getAllProduct();
    // getAllCategory();
  }, [userDetail?.id, searchQuery, searchCategory]);
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top on component mount
  }, []);
  if (error.errorMessage) {
    return <ServerError />;
  }

  if (isDataFetched && !filteredProduct?.length > 0 && !error.errorMessage)
    return (
      <div
        className={` w-full h-screen flex justify-center items-center ${
          theme === "dark"
            ? " bg-gray-900 text-white"
            : "bg-white text-gray-900"
        } transition-all duration-300`}
      >
        <div className=" font-mono  flex flex-col gap-3 ">
          <img
            src={noResultImage}
            alt="there is not products"
            className="max-w-[350px]"
          />
          <div className="h-min flex flex-col gap-2 justify-center items-center">
            <span className="w-max max-w-[250px] text-lg font-semibold">
              No Result Found!
            </span>
            <span className="max-w-[250px] text-center">
              We can't find any items matching your Search
            </span>
          </div>
        </div>
      </div>
    );
  if (!isDataFetched && !error.errorMessage) return <Loader />;

  return (
    filteredProduct && (
      <div
        className={`product-container w-full h-full items-center justify-center pt-8 flex gap-2 p-4 ${
          theme === "dark"
            ? " bg-gray-900 text-white"
            : "bg-white text-gray-900"
        }  transition-all duration-300`}
      >
        {/* <div className="left-section w-2/12 h-full border border-black bg-gray min-w-[200px] mobile:hidden laptop:block">
          <h2 className="text-center">Filter</h2>
          <div className="p-2 ">
            <form action="" onSubmit={(e) => handleSubmit(e)}>
              {allCategories?.map((category, index) => {
                return (
                  <div className="flex gap-1 items-center" key={index}>
                    <input
                      type="checkbox"
                      name="filter"
                      id={category}
                      onClick={(e) => {
                        handleChange(e);
                      }}
                      value={category}
                    />
                    <label htmlFor={category} className="cursor-pointer">
                      {category}
                    </label>
                  </div>
                );
              })}
              <input
                type="submit"
                className="p-2 w-full my-2 cursor-pointer flex justify-center items-center  bg-blue-900 rounded-md text-white"
                value="Apply"
              />
            </form>
          </div>
        </div> */}

        <div className="right-section grid grid-cols-1 place-items-center mobile:grid-cols-2 small-device:grid-cols-3 tablet:grid-cols-4 laptop:grid-cols-4 desktop:grid-cols-6 large-device:grid-cols-6 w-10/12 justify-around flex-wrap gap-3 mobile:w-full laptop:w-full">
          {filteredProduct &&
            filteredProduct.map((product, index) => {
              return (
                <div className="w-full h-full" key={product?.id || product?._id}>
                  <Productcard
                    product={product}
                    userDetail={userDetail}
                    authToken={authToken}
                  />
                </div>
              );
            })}
        </div>
      </div>
    )
  );
};

export default ProductsContainer;

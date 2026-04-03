import axios from "axios";
import { Button, Input, SectionTitle, Select, ToggleSwitch } from "../../LIBS";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BiLoaderAlt } from "react-icons/bi";
import { FaTrash } from "react-icons/fa";
import { useTheme } from "../../Context/themeContext";
import { useAuth } from "../../Context/authContext";
import {
  formatNumber,
  productCategory,
  swalWithCustomConfiguration,
} from "../../utility/constant";
const SERVER_URL = import.meta.env.VITE_SERVER_URL;
export const ProductsPanel = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [productArr, setProductArr] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [productCount, setProductCount] = useState(null);
  const [productRange, setProductRange] = useState({});
  const [isDataFetching, setIsDataFetching] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState("");
  const [filters, setFilters] = useState({});
  const { theme } = useTheme();
  const { authToken } = useAuth();
  let tempSearchQuery = "";
  const getAllProduct = async () => {
    setIsDataFetching(true);
    try {
      const response = await axios.get(
        `${SERVER_URL}/api/seller/get-all-product`,
        {
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
            Authorization: `Bearer ${authToken}`,
          },
          params: { filters, page: currentPage },
        }
      );
      setProductArr(response?.data?.allProduct);
      setTotalPages(response?.data?.totalPages);
      setProductCount(response?.data?.totalProducts);
      setProductRange(() => {
        return {
          startProductIndex: response?.data?.startProductIndex,
          endProductIndex: response?.data?.endProductIndex,
        };
      });
      // console.log(response?.data); // Handle your data here
    } catch (error) {
      console.error(error?.response?.data?.message || error.message);
    } finally {
      setIsDataFetching(false);
    }
  };
  const handleFiltersChange = (e) => {
    const { name, value } = e?.target || {};
    console.log(name, value);
    setFilters((prev) => {
      return {
        ...prev,
        [name]: value?.toString()?.trim(),
      };
    });
    setCurrentPage(1);
  };
  useEffect(() => {
    getAllProduct();
  }, [authToken, JSON.stringify(filters), currentPage]);

  const handleDeleteProduct = async (productId) => {
    const response = await swalWithCustomConfiguration.fire({
      title: "Delete product?",
      text: "This product will be removed from your seller account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!response.isConfirmed) {
      return;
    }

    try {
      setDeletingProductId(productId);
      const deleteResponse = await axios.delete(
        `${SERVER_URL}/api/seller/product/${productId}`,
        {
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      setProductArr((prev) => prev.filter((product) => product?._id !== productId));
      setProductCount((prev) => (typeof prev === "number" ? Math.max(prev - 1, 0) : prev));

      await swalWithCustomConfiguration.fire(
        "Deleted",
        deleteResponse?.data?.message || "Product deleted successfully",
        "success"
      );

      await getAllProduct();
    } catch (error) {
      swalWithCustomConfiguration.fire(
        "Delete failed",
        error?.response?.data?.message || "Unable to delete product right now",
        "error"
      );
    } finally {
      setDeletingProductId("");
    }
  };

  return (
    <div
      className={`${
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-900"
      } h-full  transition-all duration-300`}
    >
      {/* Main Content */}
      <main className=" p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          {/* <h1 className="text-2xl font-bold">Products</h1> */}
          {/* <h2 className="text-2xl  font-semibold">Products</h2> */}
          <SectionTitle title="Products" className="text-2xl font-semibold" />
          <Link to={"add"}>
            <Button
              className="px-4 py-2 bg-purple-600 text-white rounded-md shadow-md hover:bg-purple-700"
              btntext="+ Add New Product"
            />
          </Link>
        </div>

        <p className="text-gray-500 mt-2">Manage your product inventory</p>

        {/* Search & Filter Bar */}
        <div className="mt-6 grid grid-cols-1 mobile:grid-cols-2 small-device:grid-cols-5 laptop:grid-cols-6 gap-4">
          <Input
            type="text"
            placeholder="Search Products..."
            className={`p-2 bg-gray-100 flex-1 border-2 rounded border-gray-300  mobile:col-span-2 small-device:col-span-3 laptop:col-span-4  ${
              theme === "dark"
                ? "bg-gray-700 text-white border-gray-600"
                : "text-gray-900 bg-gray-100 border-gray-300"
            }`}
            value={searchQuery}
            onChange={(e) => {
              tempSearchQuery += e?.target?.value;
              // console.log(e);
              // setSearchQuery(e?.target?.value);
            }}
            onKeyDown={(e) => {
              console.log(e);
              if (e?.key?.toString().toLowerCase() === "enter") {
                setSearchQuery(tempSearchQuery);
              }
            }}
          />

          <Select
            name="category"
            itemArray={productCategory}
            className="p-2 bg-gray-100 border-2 rounded border-gray-300 cursor-pointer"
            displayName="all category"
            onChange={handleFiltersChange}
          />
          <Select
            className="p-2 bg-gray-100 border-2 rounded border-gray-300 cursor-pointer"
            name="productStockStatus"
            itemArray={[
              { id: 1, value: "in stock" },
              { id: 2, value: "low stock" },
              { id: 3, value: "out of stock" },
            ]}
            onChange={handleFiltersChange}
            displayName="status"
          />
        </div>

        {/* Products Table */}
        <div className="mt-6">
          <div className="overflow-x-auto overflow-scroll w-full">
            <table className="w-full text-left border-collapse ">
              <thead>
                <tr
                  className={`${
                    theme === "dark"
                      ? "bg-gray-700 text-white"
                      : "bg-gray-200 text-gray-900"
                  } transition-all duration-300`}
                >
                  <th className="p-3 w-max ">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Visibility</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="w-full h-full">
                {productArr.map((product) => (
                  <tr key={product?._id} className="border-b h-full">
                    <td className="p-3 flex items-center w-max">
                      {/* <span className="text-2xl mr-2">
                        {product?.image?.[0]}
                      </span> */}
                      <img
                        src={product?.image?.[0]}
                        alt=""
                        className="w-20 h-20 rounded-md m-3 object-cover "
                      />
                      <div className="flex-1">
                        <p className="font-semibold max-w-56 line-clamp-1">
                          {product?.name}
                        </p>
                        <p className="text-sm text-gray-500 w-min">
                          {product?._id}
                        </p>
                      </div>
                    </td>
                    <td className="p-3">{product?.category?.toCapitalize()}</td>
                    <td className="p-3">{product?.stock}</td>
                    <td className="p-3">
                      <ToggleSwitch
                        visibiltyState={!product?.isHide}
                        onToggle={async (state) => {
                          try {
                            console.log(state);
                            const response = await axios.patch(
                              `${SERVER_URL}/api/seller/product/visibilty-toggle/${product?._id}`,
                              { state },
                              {
                                headers: {
                                  "Content-Type":
                                    "application/json; charset=UTF-8",
                                  Authorization: `Bearer ${authToken}`,
                                },
                              }
                            );
                          } catch (error) {
                            console.log(error);
                          }
                        }}
                      />
                    </td>

                    <td className="p-3">
                      {formatNumber(product?.price || product?.mrpPrice)}
                    </td>
                    <td
                      className={`p-3 font-semibold w-max ${
                        product?.stock > 20
                          ? "text-green-500"
                          : product?.stock > 0
                          ? "text-yellow-500"
                          : "text-red-500"
                        // product.stock === "In Stock"
                        //   ? "text-green-500"
                        //   : "text-yellow-500"
                      }`}
                    >
                      {product?.stock > 20
                        ? "In Stock"
                        : product?.stock > 0
                        ? "Low Stock"
                        : "Out of Stock"}
                    </td>
                    <td className="p-3">
                      {/* Edit product UI is intentionally hidden until edit functionality is supported. */}
                      {/* <Button className="text-blue-500" btntext="Edit" /> */}
                      <Button
                        className={`p-2 rounded-md border transition-all duration-300 disabled:opacity-50 ${
                          theme === "dark"
                            ? "border-red-500/40 text-red-300 hover:bg-red-500/10"
                            : "border-red-200 text-red-600 hover:bg-red-50"
                        }`}
                        btntext=""
                        icon={
                          deletingProductId === product?._id ? (
                            <BiLoaderAlt className="animate-spin text-base" />
                          ) : (
                            <FaTrash className="text-sm" />
                          )
                        }
                        onClick={() => handleDeleteProduct(product?._id)}
                        disabled={deletingProductId === product?._id}
                      />
                    </td>
                  </tr>
                ))}
                {productArr?.length === 0 && !isDataFetching && (
                  <tr className=" text-center">
                    <td colSpan="7" className="p-5">
                      {/* <div className="flex items-center justify-center h-full">
                        <img
                          src="/images/empty.png"
                          alt="No Data"
                          className="w-20 h-20"
                        />
                      </div> */}
                      Nothing to Display
                    </td>
                    {/* <td></td> */}
                  </tr>
                )}
                {isDataFetching && (
                  <tr className="">
                    <td colSpan="7" className="p-5">
                      <div className="w-full flex justify-center gap-2">
                        <BiLoaderAlt className="animate-spin h-6 w-6 " />
                        <span>Loading...</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between mobile:flex-col small-device:flex-row mobile:gap-4 small-device:gap-0">
          <p className="text-gray-500">
            Showing {productRange?.startProductIndex} to{" "}
            {productRange?.endProductIndex} of {productCount} results
          </p>
          <div className="flex space-x-2">
            <Button
              className={`px-3 py-1 rounded-md disabled:opacity-50 ${
                theme === "dark"
                  ? "bg-gray-700 text-white"
                  : "bg-gray-300 text-gray-900"
              }`}
              btntext="Previous"
              onClick={() =>
                setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))
              }
              disabled={currentPage === 1}
            />
            {/* <button className="px-3 py-1 bg-gray-300 rounded-md">
              Previous
            </button> */}

            {[...Array(totalPages)].map((item, index) => (
              <Button
                className={`px-3 py-1 rounded-md ${
                  index + 1 === currentPage
                    ? "bg-purple-600 text-white"
                    : theme === "dark"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-300 text-gray-900"
                } `}
                key={index}
                btntext={index + 1}
                onClick={() => setCurrentPage(index + 1)}
              />
            ))}

            <Button
              className={`px-3 py-1 rounded-md disabled:opacity-50 ${
                theme === "dark"
                  ? "bg-gray-700 text-white"
                  : "bg-gray-300 text-gray-900"
              }`}
              btntext="Next"
              onClick={() => {
                setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
              }}
              disabled={currentPage === totalPages}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductsPanel;

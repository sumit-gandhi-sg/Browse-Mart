import { useState, useEffect } from "react";
import axios from "axios";
import { FiImage, FiUploadCloud } from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";
import { useDropzone } from "react-dropzone";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../Context/themeContext";
import { useAuth } from "../../Context/authContext";
import { Button, Input, Select, TextArea } from "../../LIBS";
import ImagePreview from "./UploadProduct/ImagePreview";
import {
  checkValidation,
  initialProductDetails,
  productBrands,
  swalWithCustomConfiguration,
} from "../../utility/constant";
import { useCategory } from "../../Context/categoryContext";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export const AddProductPanel = () => {
  const [productForm, setProductForm] = useState(initialProductDetails);
  const [error, setError] = useState({});
  const [images, setImages] = useState([]);
  const [productUploading, setProductUploading] = useState(false);
  const [isFetchingInitialData, setIsFetchingInitialData] = useState(false);
  const { theme } = useTheme();
  const { authToken } = useAuth();
  const { categories } = useCategory();
  
  const dynamicCategories = categories?.filter(c => c.parentCategory === null).map(mainCat => {
     return {
        id: mainCat._id,
        name: "category",
        value: mainCat._id, // Use ID for value
        displayName: mainCat.name, // Use name for UI
        child: categories.filter(c => c.parentCategory === mainCat._id || c.parentCategory?._id === mainCat._id).map(c => ({ id: c._id, name: c.name }))
     };
  }) || [];

  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode && authToken) {
      fetchProductDetails();
    }
  }, [id, authToken]);

  const fetchProductDetails = async () => {
    try {
      setIsFetchingInitialData(true);
      const response = await axios.get(`${SERVER_URL}/api/product/${id}`);
      const productData = response?.data?.product;
      if (productData) {
        setProductForm({
          name: productData.name || "",
          mrpPrice: productData.mrpPrice?.toString() || "",
          sellingPrice: productData.sellingPrice?.toString() || "",
          description: productData.description || "",
          category: productData.category?._id || productData.category || "",
          stock: productData.stock?.toString() || "",
          brand: productData.brand || "",
          subCategory: productData.subCategory?._id || productData.subCategory || "",
        });
        setImages(productData.image || []);
      }
    } catch (error) {
      console.log(error);
      swalWithCustomConfiguration.fire("Error", "Could not fetch product details", "error");
    } finally {
      setIsFetchingInitialData(false);
    }
  };

  const onDrop = (acceptedFiles) => {
    setImages((prev) => [...prev, ...acceptedFiles]);
    setError((prev) => ({ ...prev, image: "" }));
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
    noClick: true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({
      ...prev,
      ...(name === "category" ? { subCategory: "" } : {}),
      [name]: value,
    }));
    setError((prev) => ({ ...prev, [name]: "" }));
  };

  // The client-side Cloudinary logic has been removed. Uploads are strictly handled by the Backend Node Server.

  const validateForm = () => {
    const requiredFields = [
      "name",
      "category",
      "description",
      "stock",
      "brand",
      "mrpPrice",
      "sellingPrice",
    ];

    const formErrors = checkValidation(productForm, requiredFields) || {};

    if (!productForm?.subCategory && productForm?.category !== "others") {
      formErrors.subCategory = "Sub Category is required!";
    }

    if (images.length < 1) {
      formErrors.image = "Product Image is required!";
    }

    if (
      Number(productForm?.mrpPrice) > 0 &&
      Number(productForm?.sellingPrice) > Number(productForm?.mrpPrice)
    ) {
      formErrors.mrpPrice = "MRP Price should be greater than Selling Price";
    }

    return formErrors;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setError(formErrors);
      return;
    }

    if (!authToken) {
      swalWithCustomConfiguration.fire(
        "Login required",
        "Please login again before uploading a product.",
        "warning"
      );
      return;
    }

    try {
      setProductUploading(true);
      setError({});

      // Separate Kept Strings and New Files
      const existingImages = images.filter((img) => typeof img === "string");
      const newImageFiles = images.filter((img) => typeof img !== "string");

      const formData = new FormData();
      
      Object.keys(productForm).forEach((key) => {
         formData.append(key, productForm[key]);
      });
      
      // Append Kept Images natively
      existingImages.forEach((url) => {
         formData.append("existingImages", url);
      });

      // Append New file uploads
      newImageFiles.forEach((file) => {
         formData.append("image", file);
      });

      const response = await axios({
        method: isEditMode ? "PUT" : "POST",
        url: isEditMode ? `${SERVER_URL}/api/seller/product/${id}` : `${SERVER_URL}/api/product/add-product`,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.status === 201 || response.status === 200) {
        await swalWithCustomConfiguration.fire(
          isEditMode ? "Product successfully updated" : "Product successfully uploaded",
          isEditMode ? "Your product changes have been saved." : "Your product has been added.",
          "success"
        );
        setProductForm(initialProductDetails);
        setImages([]);
        navigate("/seller/products");
      }
    } catch (submitError) {
      const status = submitError?.response?.status;
      const message =
        submitError?.response?.data?.message ||
        "Error in uploading product, Please try again later.";

      swalWithCustomConfiguration.fire(
        status === 401 ? "Unauthorized" : "Error uploading!",
        message,
        "error"
      );
    } finally {
      setProductUploading(false);
    }
  };

  return (
    <div
      className={`w-full rounded-[24px] shadow-sm border p-6 md:p-8 transition-all duration-300 font-roboto ${
        theme === "dark" ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-200 text-gray-900"
      }`}
    >
      {isFetchingInitialData ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-80">
          <BiLoaderAlt className="animate-spin text-5xl mb-4 text-indigo-500" />
          <p className="font-bold tracking-widest uppercase text-sm text-gray-500">Loading Product Data...</p>
        </div>
      ) : (
        <>
          {/* Header keeping the button at the top as originally structured */}
          <div className="flex flex-col gap-4 mb-8 small-device:flex-row small-device:justify-between small-device:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </h1>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {isEditMode ? "Modify your selected product listing" : "Create and publish a new product listing"}
          </p>
        </div>
        <div className="w-full small-device:w-auto">
          <Button
            className="w-full small-device:w-auto min-w-[180px] px-6 py-3 bg-indigo-600 font-bold text-white rounded-xl shadow-md hover:bg-indigo-700 hover:-translate-y-0.5 transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            btntext={productUploading ? (isEditMode ? "Updating..." : "Publishing...") : (isEditMode ? "Update Product" : "Publish Product")}
            onClick={handleSubmit}
            loading={productUploading}
            disabled={productUploading}
          />
        </div>
      </div>

      {/* Form structure completely reverted to original */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        
        {/* Row 1: Name and Brand */}
        <div className="grid grid-cols-1 small-device:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
              Product Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              id="name"
              name="name"
              value={productForm?.name}
              onChange={handleChange}
              placeholder="Product Name"
              className={`p-3 border-2 rounded-xl focus:ring-4 transition-all outline-none ${
                error.name ? "border-red-500 focus:ring-red-500/20" :
                theme === 'dark' ? "bg-gray-800 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20" : "bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
              }`}
            />
            {error.name && <p className="text-red-500 text-xs font-bold">{error.name}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="brand" className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
              Brand <span className="text-red-500">*</span>
            </label>
            <Select
              name="brand"
              id="brand"
              className={`p-3 border-2 rounded-xl focus:ring-4 transition-all outline-none cursor-pointer ${
                error.brand ? "border-red-500 focus:ring-red-500/20" :
                theme === 'dark' ? "bg-gray-800 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20" : "bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
              }`}
              onChange={handleChange}
              value={productForm?.brand}
              displayName="Select Brand"
              itemArray={productBrands}
            />
            {error.brand && <p className="text-red-500 text-xs font-bold">{error.brand}</p>}
          </div>
        </div>

        {/* Row 2: Media */}
        <div>
          <label className={`font-semibold text-sm block mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
            Product Media <span className="text-red-500">*</span>
          </label>
          <div
            {...getRootProps()}
            className={`w-full p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer ${
              isDragActive
                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                : error.image 
                ? "border-red-400 bg-red-50 dark:bg-red-900/10"
                : theme === "dark"
                ? "border-gray-600 bg-gray-800/50 hover:bg-gray-800 text-gray-300"
                : "border-gray-300 bg-gray-50 hover:bg-gray-100/50 text-gray-500"
            }`}
          >
            <input {...getInputProps()} />
            <span className="text-4xl text-purple-500 mb-3">
              {images.length > 0 ? <FiImage /> : <FiUploadCloud />}
            </span>
            <p className="font-semibold mb-1">
              {isDragActive
                ? "Drop product images here"
                : "Drag and drop your product images here"}
            </p>
            <button
              type="button"
              className="text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
            >
              Browse Files
            </button>
          </div>
          {error.image && <p className="text-red-500 text-xs font-bold mt-2">{error.image}</p>}
          {images.length > 0 && (
            <div className="mt-4 p-4 border rounded-xl dark:border-gray-800">
              <ImagePreview 
                 image={images} 
                 onRemove={(indexToRemove) => setImages(prev => prev.filter((_, idx) => idx !== indexToRemove))} 
              />
            </div>
          )}
        </div>

        {/* Row 3: Prices & Stock */}
        <div className="grid grid-cols-1 small-device:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="mrpPrice" className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
              MRP Price <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              id="mrpPrice"
              name="mrpPrice"
              value={productForm?.mrpPrice}
              onChange={handleChange}
              placeholder="MRP Price"
              className={`p-3 border-2 rounded-xl focus:ring-4 transition-all outline-none ${
                error.mrpPrice ? "border-red-500 focus:ring-red-500/20" :
                theme === 'dark' ? "bg-gray-800 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20" : "bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
              }`}
            />
            {error.mrpPrice && <p className="text-red-500 text-xs font-bold">{error.mrpPrice}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="sellingPrice" className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
              Selling Price <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              id="sellingPrice"
              name="sellingPrice"
              value={productForm?.sellingPrice}
              onChange={handleChange}
              placeholder="Selling Price"
              className={`p-3 border-2 rounded-xl focus:ring-4 transition-all outline-none ${
                error.sellingPrice ? "border-red-500 focus:ring-red-500/20" :
                theme === 'dark' ? "bg-gray-800 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20" : "bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
              }`}
            />
            {error.sellingPrice && <p className="text-red-500 text-xs font-bold">{error.sellingPrice}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="stock" className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
              Stock Quantity <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              id="stock"
              name="stock"
              value={productForm?.stock}
              onChange={handleChange}
              placeholder="Stock"
              className={`p-3 border-2 rounded-xl focus:ring-4 transition-all outline-none ${
                error.stock ? "border-red-500 focus:ring-red-500/20" :
                theme === 'dark' ? "bg-gray-800 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20" : "bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
              }`}
            />
            {error.stock && <p className="text-red-500 text-xs font-bold">{error.stock}</p>}
          </div>
        </div>

        {/* Row 4: Description */}
        <div className="w-full flex flex-col gap-2">
          <label htmlFor="description" className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
            Description <span className="text-red-500">*</span>
          </label>
          <TextArea
            name="description"
            id="description"
            value={productForm?.description}
            onChange={handleChange}
            placeholder="Description"
            className={`resize-y w-full min-h-[150px] p-3 border-2 rounded-xl focus:ring-4 transition-all outline-none ${
              error.description ? "border-red-500 focus:ring-red-500/20" :
              theme === 'dark' ? "bg-gray-800 text-white border-gray-700 focus:border-purple-500 focus:ring-purple-500/20" : "bg-gray-50 text-gray-900 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
            }`}
          />
          {error.description && <p className="text-red-500 text-xs font-bold">{error.description}</p>}
        </div>

        {/* Row 5: Categories */}
        <div className="grid grid-cols-1 small-device:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="category" className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
              Category <span className="text-red-500">*</span>
            </label>
            <Select
              name="category"
              id="category"
              className={`p-3 border-2 rounded-xl focus:ring-4 transition-all outline-none cursor-pointer ${
                error.category ? "border-red-500 focus:ring-red-500/20" :
                theme === 'dark' ? "bg-gray-800 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20" : "bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
              }`}
              onChange={handleChange}
              value={productForm?.category}
              itemArray={dynamicCategories}
              displayName="Select Category"
            />
            {error.category && <p className="text-red-500 text-xs font-bold">{error.category}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="subCategory" className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
              Sub Category <span className="text-red-500">*</span>
            </label>
            <select
              name="subCategory"
              className={`p-3 border-2 rounded-xl focus:ring-4 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                error.subCategory ? "border-red-500 focus:ring-red-500/20" :
                theme === 'dark' ? "bg-gray-800 text-white border-gray-700 focus:border-purple-500 focus:ring-purple-500/20" : "bg-gray-50 text-gray-900 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
              }`}
              id="subCategory"
              disabled={
                productForm?.category === "others" || !productForm?.category
              }
              onChange={handleChange}
              value={productForm?.subCategory}
            >
              <option value="">Select Sub Category</option>
              {dynamicCategories?.find(item => item.value === productForm?.category)?.child?.map((subItem) => (
                <option key={subItem.id} value={subItem.id}>
                  {subItem.name.toCapitalize()}
                </option>
              ))}
            </select>
            {error.subCategory && <p className="text-red-500 text-xs font-bold">{error.subCategory}</p>}
          </div>
        </div>
      </form>
        </>
      )}
    </div>
  );
};

export default AddProductPanel;

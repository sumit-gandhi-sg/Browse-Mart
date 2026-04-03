import { useState } from "react";
import axios from "axios";
import { FiImage, FiUploadCloud } from "react-icons/fi";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../Context/themeContext";
import { useAuth } from "../../Context/authContext";
import { Button, Input, Select, TextArea } from "../../LIBS";
import ImagePreview from "./UploadProduct/ImagePreview";
import {
  checkValidation,
  initialProductDetails,
  productBrands,
  productCategory,
  swalWithCustomConfiguration,
} from "../../utility/constant";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export const AddProductPanel = () => {
  const [productForm, setProductForm] = useState(initialProductDetails);
  const [error, setError] = useState({});
  const [images, setImages] = useState([]);
  const [productUploading, setProductUploading] = useState(false);
  const { theme } = useTheme();
  const { authToken } = useAuth();
  const navigate = useNavigate();

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

  const uploadImagesToCloudinary = async () => {
    const uploadPromises = images.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "mycloud");
      formData.append("cloud_name", CLOUD_NAME);

      const response = await axios({
        method: "POST",
        url: `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        data: formData,
      });

      return response?.data?.secure_url?.toString();
    });

    return Promise.all(uploadPromises);
  };

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

      const uploadedImages = await uploadImagesToCloudinary();
      const payload = {
        ...productForm,
        image: uploadedImages,
        mrpPrice: Number(productForm.mrpPrice),
        sellingPrice: Number(productForm.sellingPrice),
        stock: Number(productForm.stock),
      };

      const response = await axios({
        method: "POST",
        url: `${SERVER_URL}/api/product/add-product`,
        data: payload,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.status === 201) {
        await swalWithCustomConfiguration.fire(
          "Product successfully uploaded",
          "Your product has been added.",
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
      className={`w-full rounded-lg shadow-md p-6 transition-all duration-300 ${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="flex flex-col gap-4 mb-6 small-device:flex-row small-device:justify-between small-device:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Add New Product</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create and publish a new product listing
          </p>
        </div>
        <div className="w-full small-device:w-auto">
          <Button
            className="w-full small-device:w-auto min-w-[180px] px-4 py-2 bg-purple-600 text-white rounded-md shadow-md hover:bg-purple-700 disabled:opacity-60"
            btntext={productUploading ? "Publishing..." : "Publish Product"}
            onClick={handleSubmit}
            loading={productUploading}
            disabled={productUploading}
          />
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 small-device:grid-cols-2 gap-4">
          <div className="flex flex-col gap-3">
            <label htmlFor="name">
              Product Name <span className="required">*</span>
            </label>
            <Input
              type="text"
              id="name"
              name="name"
              value={productForm?.name}
              onChange={handleChange}
              placeholder="Product Name"
              className="p-2 bg-gray-100 border-2 rounded border-gray-300"
            />
            {error.name && <p className="required-field-error">{error.name}</p>}
          </div>

          <div className="flex flex-col gap-3">
            <label htmlFor="brand">
              Brand <span className="required">*</span>
            </label>
            <Select
              name="brand"
              id="brand"
              className="p-2 bg-gray-100 border-2 rounded border-gray-300"
              onChange={handleChange}
              value={productForm?.brand}
              displayName="Select Brand"
              itemArray={productBrands}
            />
            {error.brand && (
              <p className="required-field-error">{error.brand}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Product Media</label>
          <div
            {...getRootProps()}
            className={`w-full p-6 border-2 border-dashed rounded-md flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer ${
              isDragActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                : theme === "dark"
                ? "border-gray-600 text-gray-300"
                : "border-gray-300 text-gray-500"
            }`}
          >
            <input {...getInputProps()} />
            <span className="text-3xl">
              {images.length > 0 ? <FiImage /> : <FiUploadCloud />}
            </span>
            <p className="my-2">
              {isDragActive
                ? "Drop product images here"
                : "Drag and drop your product images here"}
            </p>
            <button
              type="button"
              className="text-blue-600 underline cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
            >
              Browse Files
            </button>
          </div>
          {error.image && (
            <p className="required-field-error mt-2">{error.image}</p>
          )}
          {images.length > 0 && (
            <div className="mt-4">
              <ImagePreview image={images} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 small-device:grid-cols-3 gap-4">
          <div className="flex flex-col gap-3">
            <label htmlFor="mrpPrice">
              MRP Price <span className="required">*</span>
            </label>
            <Input
              type="number"
              id="mrpPrice"
              name="mrpPrice"
              value={productForm?.mrpPrice}
              onChange={handleChange}
              placeholder="MRP Price"
              className="p-2 bg-gray-100 border-2 rounded border-gray-300"
            />
            {error.mrpPrice && (
              <p className="required-field-error">{error.mrpPrice}</p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <label htmlFor="sellingPrice">
              Selling Price <span className="required">*</span>
            </label>
            <Input
              type="number"
              id="sellingPrice"
              name="sellingPrice"
              value={productForm?.sellingPrice}
              onChange={handleChange}
              placeholder="Selling Price"
              className="p-2 bg-gray-100 border-2 rounded border-gray-300"
            />
            {error.sellingPrice && (
              <p className="required-field-error">{error.sellingPrice}</p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <label htmlFor="stock">
              Stock Quantity <span className="required">*</span>
            </label>
            <Input
              type="number"
              id="stock"
              name="stock"
              value={productForm?.stock}
              onChange={handleChange}
              placeholder="Stock"
              className="p-2 bg-gray-100 border-2 rounded border-gray-300"
            />
            {error.stock && (
              <p className="required-field-error">{error.stock}</p>
            )}
          </div>
        </div>

        <div className="w-full flex flex-col gap-3">
          <label htmlFor="description">
            Description <span className="required">*</span>
          </label>
          <TextArea
            name="description"
            id="description"
            value={productForm?.description}
            onChange={handleChange}
            placeholder="Description"
            className={`resize-none w-full min-h-[150px] p-2 border-2 outline-none rounded ${
              theme === "dark"
                ? "bg-gray-700 text-white border-gray-600 focus:border-gray-300"
                : "text-gray-900 bg-gray-100 border-gray-300 focus:border-gray-600"
            }`}
          />
          {error.description && (
            <p className="required-field-error">{error.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 small-device:grid-cols-2 gap-4">
          <div className="flex flex-col gap-3">
            <label htmlFor="category">
              Category <span className="required">*</span>
            </label>
            <Select
              name="category"
              id="category"
              className="p-2 bg-gray-100 border-2 rounded border-gray-300"
              onChange={handleChange}
              value={productForm?.category}
              itemArray={productCategory}
              displayName="Select Category"
            />
            {error.category && (
              <p className="required-field-error">{error.category}</p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <label htmlFor="subCategory">
              Sub Category <span className="required">*</span>
            </label>
            <select
              name="subCategory"
              className={`p-2 bg-gray-100 border-2 rounded border-gray-300 outline-gray-400 outline-0 transition-all duration-300 ${
                theme === "dark"
                  ? "bg-gray-700 text-white border-gray-600 focus:border-gray-300"
                  : "text-gray-900 bg-gray-100 border-gray-300 focus:border-gray-600"
              }`}
              id="subCategory"
              disabled={
                productForm?.category === "others" || !productForm?.category
              }
              onChange={handleChange}
              value={productForm?.subCategory}
            >
              <option value="">Select Sub Category</option>
              {productCategory?.map((item) => {
                return item.value === productForm?.category
                  ? item.child?.map((subItem) => {
                      return (
                        <option key={subItem?.id || subItem} value={subItem}>
                          {subItem.toCapitalize()}
                        </option>
                      );
                    })
                  : "";
              })}
            </select>
            {error.subCategory && (
              <p className="required-field-error">{error.subCategory}</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProductPanel;

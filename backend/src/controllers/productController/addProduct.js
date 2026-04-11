import Product from "../../model/productSchema.js";
import { uploadImageToCloudinary } from "../../utility/cloudinary.js";

const addProduct = async (req, res) => {
  try {
    const {
      name,
      sellingPrice,
      mrpPrice,
      description,
      category,
      stock,
      brand,
      subCategory,
    } = req.body;
    
    
    const foundedUser = req.user;
    if (foundedUser?.userType !== "seller") {
      return res.status(401).json({
        success: false,
        message: "unauthorized access you don't have seller account",
      });
    }

    // `req.files` will be populated by the multer array middleware
    const files = req.files;

    if (
      !name ||
      !mrpPrice ||
      !sellingPrice ||
      !description ||
      !category ||
      !stock ||
      !brand ||
      !files ||
      files.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields and upload at least one image.",
      });
    }

    // Process all incoming memory buffers to Cloudinary securely in parallel
    const uploadPromises = files.map((file) => uploadImageToCloudinary(file.buffer));
    const imageUrls = await Promise.all(uploadPromises);

    const newProduct = new Product({
      name: name,
      mrpPrice: Number(mrpPrice),
      sellingPrice: Number(sellingPrice),
      description: description,
      image: imageUrls,
      category: category,
      stock: Number(stock),
      sellerId: foundedUser?.sellerId,
      brand: brand,
      subCategory: subCategory || "",
    });
    
    await newProduct.save();
    
    return res.status(201).json({
      success: true,
      message: "Data Saved and Uploaded Sucessfully!",
    });
  } catch (error) {
    console.error("Add Product Error:", error);
    res?.status(500)?.json({
      success: false,
      message: "Error in uploading product, Please try again later.",
    });
  }
};

export default addProduct;

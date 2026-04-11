import Product from "../../model/productSchema.js";
import { deleteImageFromCloudinary } from "../../utility/cloudinary.js";

const deleteProduct = async (req, res) => {
  try {
    const productId = req?.params?.id;
    const sellerId = req?.user?.sellerId?.toString();

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product?.sellerId?.toString() !== sellerId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Securely wipe all linked images from Cloudinary buckets to prevent ghost files
    if (product.image && Array.isArray(product.image)) {
      const destructionPromises = product.image.map((url) => deleteImageFromCloudinary(url));
      await Promise.all(destructionPromises);
    }

    await Product.findByIdAndDelete(productId);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete product right now",
    });
  }
};

export default deleteProduct;

import Product from "../../model/productSchema.js";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "../../utility/cloudinary.js";

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const sellerId = req.user?.sellerId?.toString();

    // 1. Find product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // 2. Validate ownership
    if (product.sellerId?.toString() !== sellerId) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const {
      name,
      sellingPrice,
      mrpPrice,
      description,
      category,
      stock,
      brand,
      subCategory,
      existingImages, // String of array or Array of strings sent by frontend containing kept URLs
    } = req.body;

    // 3. Parse existing images kept by user
    let keptImages = [];
    if (existingImages) {
      try {
        // Axios FormData might send arrays as JSON stringified if we stringified it, or just multiple same-named fields.
        keptImages = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
      } catch (err) {
        keptImages = Array.isArray(existingImages) ? existingImages : [existingImages];
      }
    }

    // 4. Determine which images were DELETED by the user locally so we can obliterate them from Cloudinary
    const currentDbImages = product.image || [];
    const imagesToDestroy = currentDbImages.filter((dbUrl) => !keptImages.includes(dbUrl));
    
    // Destroy the removed frames in parallel
    if (imagesToDestroy.length > 0) {
      const destructionPromises = imagesToDestroy.map((url) => deleteImageFromCloudinary(url));
      await Promise.all(destructionPromises);
    }

    // 5. Upload any completely NEW images sent via req.files
    const newFiles = req.files || [];
    let newImageUrls = [];
    if (newFiles.length > 0) {
      const uploadPromises = newFiles.map((file) => uploadImageToCloudinary(file.buffer));
      newImageUrls = await Promise.all(uploadPromises);
    }

    // Merge the kept existing images + the newly generated URLs
    const finalImagesArray = [...keptImages, ...newImageUrls];

    if (finalImagesArray.length === 0) {
      return res.status(400).json({ success: false, message: "Product must have at least one image." });
    }

    // 6. Update the product in MongoDB
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        mrpPrice: Number(mrpPrice),
        sellingPrice: Number(sellingPrice),
        description,
        image: finalImagesArray,
        category,
        stock: Number(stock),
        brand,
        subCategory: subCategory || "",
      },
      { new: true } // Return updated doc
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully!",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    res?.status(500)?.json({
      success: false,
      message: "Error in updating product, Please try again later.",
    });
  }
};

export default updateProduct;

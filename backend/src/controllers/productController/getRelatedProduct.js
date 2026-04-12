import mongoose from "mongoose";
import Product from "../../model/productSchema.js";
import Category from "../../model/categorySchema.js";
import Order from "../../model/orderSchema.js";

const getRelatedProduct = async (req, res) => {
  try {
    const { category, productId } = req?.query;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    const product = await Product.find({
      category: category,
      _id: { $ne: productId },
      isHide: false,
    }).populate("category subCategory").limit(5);

    const modifiedProducts = product
      // ?.filter((product) => !product?.isHide)
      ?.map((product) => {
        let totalStarRating = 0;
        product?.review?.map((review) => {
          totalStarRating += review?.rating;
        });
        return {
          id: product?._id,
          name: product?.name,
          price: product?.price,
          mrpPrice: product?.mrpPrice,
          sellingPrice: product?.sellingPrice,
          description: product?.description,
          image: product?.image?.[0],
          category: product?.category,
          stock: product?.stock,
          rating: Number(totalStarRating / product?.review?.length),
        };
      });
    return res.json({ message: "data fetched", product: modifiedProducts });
  } catch (error) {
    console.error(error?.message);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export default getRelatedProduct;

import Product from "../../model/productSchema.js";
import User from "../../model/userSchema.js";
import Category from "../../model/categorySchema.js";
import mongoose from "mongoose";
const getAllProduct = async (req, res) => {
  try {
    const {
      activeUserId,
      searchQuery,
      searchCategory,
      page = 1,
      limit = 24,
    } = req?.query;
    const activeUser = activeUserId ? await User.findById(activeUserId) : null;
    // const isAddedToWislist = await activeUser?.wishlist?.some(
    //   (item) => item?.productId?.toString() === "670c1ca6dc874450c9d49338"
    // );
    // console.log("line 9", isAddedToWislist);
    const parsedPage = Number(page) > 0 ? Number(page) : 1;
    const parsedLimit = Number(limit) > 0 ? Number(limit) : 24;
    const skip = (parsedPage - 1) * parsedLimit;

    const query = {
      isHide: { $ne: true },
    };

    if (searchQuery) {
      query.$or = [
        { name: { $regex: searchQuery?.toString(), $options: "i" } },
        {
          description: { $regex: searchQuery?.toString(), $options: "i" },
        },
      ];
    } else if (searchCategory) {
      if (mongoose.Types.ObjectId.isValid(searchCategory)) {
        query.$or = [
          { category: searchCategory },
          { subCategory: searchCategory },
        ];
      } else {
        // Find categories matching the name to get their IDs
        const matchedCategories = await Category.find({
          name: { $regex: searchCategory?.toString(), $options: "i" },
        }).select("_id");
        
        const categoryIds = matchedCategories.map(c => c._id);
        
        if (categoryIds.length > 0) {
          query.$or = [
            { category: { $in: categoryIds } },
            { subCategory: { $in: categoryIds } },
          ];
        } else {
          // If no category found by name, ensure no products are returned if that was the only filter
          query.category = new mongoose.Types.ObjectId(); 
        }
      }
    }

    const totalCount = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalCount / parsedLimit) || 1;

    const products = await Product.find(query)
      .populate("category subCategory")
      .sort({ _id: -1 })
      .skip(skip)
      .limit(parsedLimit);

    if (products.length === 0)
      return res?.status(200).json({ message: "Product not found" });

    const modifiedProducts = products?.map((product) => {
      let totalStarRating = 0;
      product?.review?.map((review) => {
        totalStarRating += review?.rating;
      });
      return {
        id: product?._id,
        name: product?.name,
        price: product?.price,
        description: product?.description,
        image: product?.image?.[0],
        category: product?.category,
        stock: product?.stock,
        rating: product?.review?.length
          ? Number(totalStarRating / product?.review?.length)
          : 0,
        ratingNumber: product.review?.length || null,
        mrpPrice: product?.mrpPrice,
        sellingPrice: product?.sellingPrice,
        isAddedToWislist: activeUserId
          ? activeUser?.wishlist?.some(
              (item) =>
                item?.productId?.toString() === product?._id?.toString(),
            )
          : false,
      };
    });

    const start = totalCount === 0 ? 0 : skip + 1;
    const end = Math.min(skip + modifiedProducts.length, totalCount);

    return res?.status(200).json({
      message: "data fetched",
      sucess: true,
      products: modifiedProducts,
      totalProducts: totalCount,
      page: parsedPage,
      totalPages,
      startProductIndex: start,
      endProductIndex: end,
    });
  } catch (error) {
    res?.status(500).json({ message: "Internal Server Error" });
    console.error(error);
  }
};
export default getAllProduct;

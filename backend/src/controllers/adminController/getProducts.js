import Product from "../../model/productSchema.js";
import Category from "../../model/categorySchema.js";
import SellerUser from "../../model/sellerUserSchema.js";

const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } }
      ];
    }

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("category subCategory")
      .populate({
        path: "sellerId",
        model: SellerUser,
        select: "businessName emailAddress"
      })
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      products,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
      totalProducts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export default getProducts;

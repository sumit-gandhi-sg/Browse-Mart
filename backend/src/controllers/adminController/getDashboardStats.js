import User from "../../model/userSchema.js";
import Product from "../../model/productSchema.js";
import Order from "../../model/orderSchema.js";
import SellerUser from "../../model/sellerUserSchema.js";

const getDashboardStats = async (req, res) => {
  try {
    // Execute aggregate queries in parallel for maximum dashboard performance
    const [totalConsumers, totalSellers, totalProducts, totalOrders] = await Promise.all([
      User.countDocuments({ userType: "consumer" }),
      SellerUser.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalConsumers,
        totalSellers,
        totalProducts,
        totalOrders
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error retrieving stats", error: error.message });
  }
};

export default getDashboardStats;

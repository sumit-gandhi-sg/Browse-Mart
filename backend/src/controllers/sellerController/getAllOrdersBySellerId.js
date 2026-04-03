import Order from "../../model/orderSchema.js";
import Product from "../../model/productSchema.js";
import User from "../../model/userSchema.js";

const getAllOrdersBySellerId = async (req, res) => {
  try {
    const sellerId = req?.user?.sellerId;
    const { page = 1, limit = 5 } = req?.query;

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: "Seller account not found",
      });
    }

    const skip = (Number(page) - 1) * Number(limit);
    const query = { sellerId };
    const totalCount = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalCount / Number(limit));

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const formattedOrders = await Promise.all(
      orders.map(async (order) => {
        const customerDetails = await User.findById(order?.customerId)
          .select("name email phoneNumber")
          .lean();

        const orderItems = await Promise.all(
          (order?.orderItems || []).map(async (item) => {
            const product = await Product.findById(item?.productId)
              .select("image description")
              .lean();

            return {
              ...item,
              productImage: product?.image?.[0] || "",
              productDescription: product?.description || "",
            };
          })
        );

        return {
          ...order,
          customerDetails: {
            name: customerDetails?.name || "Unknown Customer",
            email: customerDetails?.email || "",
            phoneNumber: customerDetails?.phoneNumber || "",
          },
          orderItems,
        };
      })
    );

    const start = totalCount === 0 ? 0 : skip + 1;
    const end = Math.min(skip + formattedOrders.length, totalCount);

    return res.status(200).json({
      success: true,
      message: formattedOrders.length
        ? "Seller orders fetched successfully"
        : "No orders found",
      orders: formattedOrders,
      totalOrders: totalCount,
      page: Number(page),
      totalPages,
      startOrderIndex: start,
      endOrderIndex: end,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch seller orders right now",
    });
  }
};

export default getAllOrdersBySellerId;

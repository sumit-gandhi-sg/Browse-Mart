import Order from "../../model/orderSchema.js";
import User from "../../model/userSchema.js";

const getDistinctCustomersBySellerId = async (req, res) => {
  try {
    const sellerId = req?.user?.sellerId;
    const { page = 1, limit = 10 } = req?.query;

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: "Seller account not found",
      });
    }

    const parsedPage = Number(page) > 0 ? Number(page) : 1;
    const parsedLimit = Number(limit) > 0 ? Number(limit) : 10;
    const skip = (parsedPage - 1) * parsedLimit;

    const groupedCustomersPipeline = [
      { $match: { sellerId } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$customerId",
          lastOrderDate: { $first: "$createdAt" },
          lastOrderId: { $first: "$orderId" },
          totalOrders: { $sum: 1 },
        },
      },
    ];

    const countResult = await Order.aggregate([
      ...groupedCustomersPipeline,
      { $count: "totalCustomers" },
    ]);

    const totalCount = countResult?.[0]?.totalCustomers || 0;
    const totalPages = Math.ceil(totalCount / parsedLimit);

    if (!totalCount) {
      return res.status(200).json({
        success: true,
        message: "No customers found",
        totalCustomers: 0,
        page: parsedPage,
        totalPages,
        startCustomerIndex: 0,
        endCustomerIndex: 0,
        customers: [],
      });
    }

    const customers = await Order.aggregate([
      ...groupedCustomersPipeline,
      { $skip: skip },
      { $limit: parsedLimit },
      {
        $lookup: {
          from: User.collection.name,
          localField: "_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: {
          path: "$customer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          name: { $ifNull: ["$customer.name", "Unknown Customer"] },
          email: { $ifNull: ["$customer.email", ""] },
          phoneNumber: { $ifNull: ["$customer.phoneNumber", ""] },
          totalOrders: 1,
          lastOrderId: 1,
          lastOrderDate: 1,
        },
      },
    ]);

    const start = totalCount === 0 ? 0 : skip + 1;
    const end = Math.min(skip + customers.length, totalCount);

    return res.status(200).json({
      success: true,
      message: "Customers fetched successfully",
      totalCustomers: totalCount,
      page: parsedPage,
      totalPages,
      startCustomerIndex: start,
      endCustomerIndex: end,
      customers,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch customers right now",
    });
  }
};

export default getDistinctCustomersBySellerId;
import Order from "../../model/orderSchema.js";
import Product from "../../model/productSchema.js";

const getAllOrderByUserId = async (req, res, next) => {
  try {
    const activeUser = req?.user;
    const { page = 1, limit = 5 } = req?.query;

    // Validate input data
    if (!activeUser) {
      return res.status(400).json({ message: "Invalid user or order data" });
    }

    const parsedPage = Number(page) > 0 ? Number(page) : 1;
    const parsedLimit = Number(limit) > 0 ? Number(limit) : 5;
    const skip = (parsedPage - 1) * parsedLimit;


    const query = { customerId: activeUser?._id };
    const totalCount = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalCount / parsedLimit);

    const paginatedOrders = await Order.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean();

    // Fetch and process current page orders
    const ordersArr = await Promise.all(
      paginatedOrders?.map(async (filteredOrderArr) => {
        try {
          if (!filteredOrderArr) return null;

          // Process each order
          const orderDetails = {
            orderStatus: filteredOrderArr?.orderStatus,
            id: filteredOrderArr?._id,
            orderId: filteredOrderArr?.orderId,
            orderDate: filteredOrderArr?.orderDate,
            orderItems: await Promise.all(
              filteredOrderArr?.orderItems?.map(async (item) => {
                const productData = await Product?.findById(item?.productId);
                const resolvedPrice = Number(
                  item?.sellingPrice ?? item?.price ?? item?.mrpPrice ?? 0,
                );
                const resolvedQuantity = Number(item?.quantity ?? 0);

                return {
                  ...item,
                  quantity: resolvedQuantity,
                  price: resolvedPrice,
                  sellingPrice: Number(item?.sellingPrice ?? resolvedPrice),
                  mrpPrice: Number(item?.mrpPrice ?? resolvedPrice),
                  productImage: productData?.image?.[0],
                  productDescription: productData?.description,
                };
              }),
            ),
            totalAmount:
              filteredOrderArr?.totalAmount ||
              filteredOrderArr?.grandTotal ||
              0,
          };

          return orderDetails;
        } catch (err) {
          console.error("Error processing order item:", err);
          return null;
        }
      }),
    );

    // Filter out any null values in case of missing orders or errors
    const validOrders = ordersArr.filter((order) => order !== null);
    const start = totalCount === 0 ? 0 : skip + 1;
    const end = Math.min(skip + validOrders.length, totalCount);

    // Return the processed orders
    res.status(200).json({
      message: "All orders fetched successfully!",
      ordersArr: validOrders,
      totalOrders: totalCount,
      page: parsedPage,
      totalPages,
      startOrderIndex: start,
      endOrderIndex: end,
    });
  } catch (err) {
    console.error("Error fetching all orders:", err);
    res.status(500).json({ message: "Server error while fetching orders" });
  }
};

export default getAllOrderByUserId;

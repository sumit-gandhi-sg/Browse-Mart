import Order from "../../model/orderSchema.js";
import Product from "../../model/productSchema.js";

const getAllOrderByUserId = async (req, res, next) => {
  try {
    const orderItems = req?.user?.order;
    const activeUser = req?.user;

    // Validate input data
    if (!orderItems || !activeUser) {
      return res.status(400).json({ message: "Invalid user or order data" });
    }

    // Helper function to format dates
    const formatDate = (originalDate) => {
      const [month, day, year] = originalDate?.split(",")[0]?.split("/") || [];
      return { day, month, year };
    };

    // Fetch and process all orders
    const ordersArr = await Promise.all(
      orderItems?.map(async (orderItem) => {
        try {
          const filteredOrderArr = await Order.findById(orderItem?.orderId);
          if (!filteredOrderArr) return null; // Handle missing orders

          // Process each order
          const orderDetails = {
            orderStatus: filteredOrderArr?.orderStatus,
            id: filteredOrderArr?._id,
            orderId: filteredOrderArr?.orderId,
            orderDate: formatDate(filteredOrderArr?.orderDate),
            orderItems: await Promise.all(
              filteredOrderArr?.orderItems?.map(async (item) => {
                const productData = await Product?.findById(item?.productId);
                return {
                  ...item?._doc,
                  quantity: item?.quantity,
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

    // Return the processed orders
    res.status(200).json({
      message: "All orders fetched successfully!",
      ordersArr: validOrders,
    });
  } catch (err) {
    console.error("Error fetching all orders:", err);
    res.status(500).json({ message: "Server error while fetching orders" });
  }
};

export default getAllOrderByUserId;

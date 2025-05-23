import Order from "../../model/orderSchema.js";
import Product from "../../model/productSchema.js";
import User from "../../model/userSchema.js";
const getOrderById = async (req, res) => {
  try {
    const orderId = req?.body?.orderId;
    if (!orderId) {
      return res.status(400).json({ msg: "No orderId provided" });
    }

    const orderDetails = await Order?.findOne({ orderId: orderId });

    if (orderDetails?.customerId?.toString() !== req?.user?._id?.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this order",
      });
    }
    if (!orderDetails) {
      return res.status(404).json({ msg: "Order not found" });
    }
    const customerDetails = await User?.findById(orderDetails?.customerId);

    // Resolve promises for all orderItems
    const resolvedOrderItems = await Promise.all(
      orderDetails?.orderItems?.map(async (orderItem) => {
        const itemDetails = await Product?.findById(
          orderItem?.productId || orderItem?.id || orderItem?._id
        );
        return {
          ...orderItem?._doc,
          productImage: itemDetails?.image?.[0],
          productDescription: itemDetails?.description,
        };
      })
    );

    const filteredOrderDetails = {
      ...orderDetails?._doc,
      orderItems: resolvedOrderItems,
      customerDetail: {
        customerName: customerDetails?.name,
        customerEmail: customerDetails?.email,
        customerPhoneNumber: customerDetails?.phoneNumber,
        customerAddress: customerDetails?.address,
      },
    };

    res
      .status(200)
      .json({ message: "Order fetched successfully!", filteredOrderDetails });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

export default getOrderById;

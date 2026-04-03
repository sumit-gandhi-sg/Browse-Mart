import Order from "../../model/orderSchema.js";

const validOrderStatuses = [
  "order placed",
  "order confirmed",
  "processing",
  "shipped",
  "out for delivery",
  "delivered",
  "cancelled",
];

const lockedOrderStatuses = ["delivered", "cancelled"];

const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req?.params?.id;
    const sellerId = req?.user?.sellerId?.toString();
    const { orderStatus } = req?.body || {};

    if (!validOrderStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order?.sellerId?.toString() !== sellerId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    if (lockedOrderStatuses.includes(order?.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order status cannot be changed after ${order?.orderStatus}`,
      });
    }

    order.orderStatus = orderStatus;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Unable to update order status right now",
    });
  }
};

export default updateOrderStatus;

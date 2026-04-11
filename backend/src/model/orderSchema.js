import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "SellerUser" },
    orderItems: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: { type: String, required: true },
        price: { type: Number, required: true },
        mrpPrice: { type: Number },
        sellingPrice: { type: Number },
        quantity: { type: Number, default: 1 },
        _id: false,
      },
    ],
    orderDate: { type: Date, default: Date.now },
    orderStatus: {
      type: String,
      enum: [
        "order placed",
        "order confirmed",
        "processing",
        "shipped",
        "out for delivery",
        "delivered",
        "cancelled",
      ],
      default: "order placed",
    },
    // totalAmount: { type: Number, required: true },
    totalMrpPrice: { type: Number, required: true },
    totalSellingPrice: { type: Number, required: true },
    totalDiscount: { type: Number, required: true },
    shippingCharge: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    shippingAddress: {
      customerName: { type: String },
      customerPhoneNumber: { type: String },
      addressLine1: { type: String },
      addressLine2: { type: String },
      state: { type: String },
      city: { type: String },
      pinCode: { type: String },
      country: { type: String },
      _id: false,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "creditcard", "debitcard", "netBanking", "upi", "payPal"],
      default: "cod",
    },
    paymentMethodDetail: {},
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;

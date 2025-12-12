import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    TandC: { type: Boolean },
    userType: {
      type: String,
      enum: ["consumer", "seller", "admin"],
      default: "consumer",
    },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "SellerUser" },
    // cart: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    // wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    // order: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    phoneNumber: { type: String },
    address: { type: String },
    profilePic: { type: String },
    cart: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
        _id: false,
      },
    ],
    wishlist: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        _id: false,
      },
    ],
    order: [
      {
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        _id: false,
      },
    ],
    shippingAddress: {
      addressLine1: { type: String },
      addressLine2: { type: String },
      state: { type: String },
      city: { type: String },
      pinCode: { type: String },
      country: { type: String },
      _id: false,
    },
    otp: { type: String, default: null },
    otpExpireAt: { type: Date },
    isVerified: { type: Boolean, default: false },
  },
  { timeStampes: true }
);

userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) {
    return next(); // ✅ CRITICAL FIX: Return to prevent further execution
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(user.password, salt);
    user.password = hashPassword;
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.generateToken = function () {
  const token = jwt.sign(
    {
      userId: this._id.toString(),
      email: this.email,
      name: this.name,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "1w" }
  );
  return token;
};
userSchema.methods.passwordCompare = async function (plainPassword) {
  const user = this;
  return await bcrypt.compare(plainPassword, user.password);
};
userSchema.methods.compareOtp = async function (plainOtp) {
  const user = this;
  console.log("Comparing OTPs:", {
    plainOtp: plainOtp.toString(),
    storedOtp: user.otp,
  });
  console.log(this);
  return await bcrypt.compare(plainOtp.toString(), user.otp);
};

const User = mongoose.model("User", userSchema);
export default User;

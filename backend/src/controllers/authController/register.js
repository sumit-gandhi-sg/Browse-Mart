import sendOtpEmail from "../../services/otpService.js";
import User from "../../model/userSchema.js";
import bcrypt from "bcrypt";
const register = async (req, res) => {
  const { name, email, password, TandC, confirmPassword, phoneNumber } =
    req.body;
  try {
    if (!name || !email || !password || !confirmPassword || !phoneNumber) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({
        success: false,
        message: "You're already registered. Try logging in.",
      });
    if (password !== confirmPassword)
      return res?.status(400)?.json({
        success: false,
        message: "Both password and confirm password must be same",
      });
    const hashedOtp = await sendOtpEmail(email, "Your Registration OTP");
    const otpExpireAt = new Date(Date.now() + 10 * 60 * 1000);

    if (!hashedOtp) {
      return res?.status(500)?.json({
        success: false,
        message: "Failed to send OTP. Please try again later.",
      });
    }

    // console.log("=== REGISTRATION OTP GENERATION ===");
    // console.log("OTP Expiry Set To:", otpExpireAt);
    // console.log("Current Time:", new Date());
    // console.log("===================================");

    const newUser = new User({
      name: name.trim(),
      email: email.trim(),
      password: password,
      TandC: TandC || false,
      otp: hashedOtp,
      otpExpireAt,
      phoneNumber: phoneNumber,
    });
    await newUser.save();

    res.status(200).json({
      success: true,
      message:
        "Your OTP has been sent! Kindly check your inbox or spam folder.",
      email,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object?.keys(error?.keyPattern)[0];
      const value = error?.keyValue[field];
      return res.status(400).json({
        success: false,
        message: `${field} ${value} already exists.`,
      });
    }
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

export default register;

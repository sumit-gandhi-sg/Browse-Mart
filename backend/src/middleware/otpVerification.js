import User from "../model/userSchema.js";

const otpVerification = async (req, res, next) => {
  const { email, otp } = req.body;
  try {
    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required!" });
    }
    const user = await User.findOne({ email: email?.toString()?.trim() });

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "You are not a Registered User!" });

    // Check if OTP exists and is not expired
    if (!user.otp || !user.otpExpireAt) {
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please request a new one.",
      });
    }

    // Debug logs
    // console.log("=== OTP VERIFICATION DEBUG ===");
    // console.log("Received OTP:", otp.toString().trim());
    // console.log("OTP Expiry:", user.otpExpireAt);
    // console.log("Current Time:", new Date());
    // console.log("Is Expired:", new Date() > user.otpExpireAt);
    // console.log("==============================");

    const isOtpValid = await user.compareOtp(otp.toString().trim());
    console.log("OTP Valid:", isOtpValid);

    if (!isOtpValid || new Date() > user.otpExpireAt) {
      return res.status(400).json({
        success: false,
        message: "Invalid or Expired OTP! Please try again.",
      });
    }
    user.otp = null;
    user.otpExpireAt = null;
    user.isVerified = true;
    await user.save();
    req.user = user;
    next();
  } catch (error) {
    console.error("OTP Verification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

export default otpVerification;

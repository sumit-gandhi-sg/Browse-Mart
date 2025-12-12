import sendOtpEmail from "../../services/otpService.js";
import User from "../../model/userSchema.js";

const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email: email?.trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new OTP
    const hashedOtp = await sendOtpEmail(email, "Your Registration OTP");

    if (!hashedOtp) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again later.",
      });
    }

    const otpExpireAt = new Date(Date.now() + 10 * 60 * 1000);

    // console.log("=== RESEND OTP ===");
    // console.log("Email:", email);
    // console.log("OTP Expiry Set To:", otpExpireAt);
    // console.log("Current Time:", new Date());
    // console.log("==================");

    user.otp = hashedOtp;
    user.otpExpireAt = otpExpireAt;
    await user.save();

    res.status(200).json({
      success: true,
      message: "OTP has been resent! Please check your email.",
      email,
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
      error: error.message,
    });
  }
};

export default resendOtp;

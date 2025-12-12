import sendOtpEmail from "../../services/otpService.js";
import User from "../../model/userSchema.js";

const login = async (req, res, next) => {
  const { email, password } = req.body;
  // Validate email and password
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email: email?.trim() });
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });
    }

    const validPassword = await existingUser.passwordCompare(password);
    if (!validPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Credentials" });
    }
    if (!existingUser?.isVerified) {
      const hashedOtp = await sendOtpEmail(
        existingUser?.email,
        "Your Registration OTP"
      );

      if (!hashedOtp) {
        return res.status(500).json({
          success: false,
          message: "Failed to send OTP. Please try again.",
        });
      }

      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      // console.log("=== LOGIN OTP GENERATION ===");
      // console.log("OTP Expiry Set To:", otpExpires);
      // console.log("Current Time:", new Date());
      // console.log("===========================");

      existingUser.otp = hashedOtp;
      existingUser.otpExpireAt = otpExpires;
      await existingUser.save();

      return res.status(403).json({
        success: false,
        message: "Email not verified. OTP sent to your email!",
        requiresVerification: true,
        email: existingUser.email,
      });
    }
    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      AuthToken: await existingUser.generateToken(),
    });
  } catch (err) {
    res?.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
      rowError: err,
    });
  }
};
export default login;

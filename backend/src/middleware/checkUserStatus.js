import User from "../model/userSchema.js";

const checkUserStatus = async (req, res, next) => {
  try {
    const foundedUser = req?.user; // Assuming userAuthentication middleware has run
    
    if (!foundedUser || !foundedUser._id) {
       return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Always fetch the freshest status from the DB to prevent 'zombie' active tokens
    const liveUser = await User.findById(foundedUser._id).select("status");

    if (liveUser?.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended by the administrator.",
      });
    }

    next();
  } catch (error) {
    console.error("Status Check Error:", error);
    res.status(500).json({ success: false, message: "Internal server error during status validation." });
  }
};

export default checkUserStatus;

import User from "../../model/userSchema.js";

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "blocked"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (targetUser.userType === "admin") {
      return res.status(403).json({ success: false, message: "System administrators cannot be blocked." });
    }

    targetUser.status = status;
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: `User ${targetUser.name} has been ${status}.`,
      user: { _id: targetUser._id, status: targetUser.status }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export default updateUserStatus; // Toggle controller

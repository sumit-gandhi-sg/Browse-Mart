import User from "../../model/userSchema.js";

const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    
    // Optional filtering by role (e.g., ?role=consumer | ?role=seller)
    if (req.query.role) query.userType = req.query.role;
    
    // Text search by name or email
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } }
      ];
    }

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password -otp -otpExpireAt") // Exclude sensitive fields
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      users,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      totalUsers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export default getUsers;

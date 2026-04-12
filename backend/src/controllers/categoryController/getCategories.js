import Category from "../../model/categorySchema.js";

const getCategories = async (req, res) => {
  try {
    // Fetch all categories and populate the parent reference (if needed).
    // Or fetch recursively if using tree, but given flat 2 level we fetch all.
    const categories = await Category.find().populate("parentCategory", "name");

    return res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    console.error("Error in getCategories Controller", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export default getCategories;

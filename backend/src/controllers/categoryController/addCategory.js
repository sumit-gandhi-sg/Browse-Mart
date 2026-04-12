import Category from "../../model/categorySchema.js";

const addCategory = async (req, res) => {
  try {
    const { name, description, parentCategory } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const existingCategory = await Category.findOne({ name: name.toLowerCase() });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: "Category name already exists" });
    }

    if (parentCategory) {
      const parent = await Category.findById(parentCategory);
      if (!parent) {
         return res.status(404).json({ success: false, message: "Parent category not found" });
      }
    }

    const newCategory = new Category({
      name,
      description,
      parentCategory: parentCategory || null
    });

    await newCategory.save();

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: newCategory
    });

  } catch (error) {
    console.error("Error in addCategory Controller", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export default addCategory;

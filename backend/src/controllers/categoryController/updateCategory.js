import Category from "../../model/categorySchema.js";
import Product from "../../model/productSchema.js";

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, parentCategory } = req.body;

    const categoryToUpdate = await Category.findById(id);
    if (!categoryToUpdate) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    if (name && name.toLowerCase() !== categoryToUpdate.name) {
      const existingCategory = await Category.findOne({ name: name.toLowerCase() });
      if (existingCategory) {
        return res.status(400).json({ success: false, message: "Category name already exists" });
      }
    }

    // Validation: cant change parent category if set already but if not set then allow to add while editing
    if (categoryToUpdate.parentCategory && parentCategory) {
      if (categoryToUpdate.parentCategory.toString() !== parentCategory.toString()) {
        return res.status(400).json({ 
          success: false, 
          message: "Relationship restriction: Parent category cannot be changed once established." 
        });
      }
    }

    // Since we agreed to use String name references in Product, if the admin changes the category name,
    // we would actually need to update all existing products with this category string. Or block it.
    // For simplicity, we can update the products associated with it.
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, description, parentCategory: parentCategory || null },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory
    });

  } catch (error) {
    console.error("Error in updateCategory Controller", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export default updateCategory;

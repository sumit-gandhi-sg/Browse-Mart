import Category from "../../model/categorySchema.js";
import Product from "../../model/productSchema.js";

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryToDelete = await Category.findById(id);

    if (!categoryToDelete) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    // Restrictions check
    if (categoryToDelete.parentCategory === null) {
      // It's a main category
      const existingProduct = await Product.findOne({ category: categoryToDelete._id });
      if (existingProduct) {
        return res.status(400).json({ 
          success: false, 
          message: `Cannot delete category "${categoryToDelete.name}" because it is associated with existing products.` 
        });
      }

      const subCategories = await Category.find({ parentCategory: categoryToDelete._id });
      if (subCategories.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: `Cannot delete category "${categoryToDelete.name}" because it has existing subcategories. Delete them first.` 
        });
      }
    } else {
      // It's a subcategory
      const existingProduct = await Product.findOne({ subCategory: categoryToDelete._id });
      if (existingProduct) {
        return res.status(400).json({ 
          success: false, 
          message: `Cannot delete subcategory "${categoryToDelete.name}" because it is associated with existing products.` 
        });
      }
    }

    await categoryToDelete.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully."
    });

  } catch (error) {
    console.error("Error in deleteCategory Controller", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export default deleteCategory;

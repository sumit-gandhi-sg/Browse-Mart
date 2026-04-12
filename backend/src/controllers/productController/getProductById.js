import Product from "../../model/productSchema.js";
import Category from "../../model/categorySchema.js";
const getProductById = async (req, res) => {
  try {
    const id = req?.params?.id;
    if (!id) return res.status(400).json({ message: "Product ID is required" });
    const product = await Product.findById(id).populate("category subCategory");
    if (product?.isHide)
      return res.status(404).json({
        sucess: false,
        message: "Product not found",
      });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ success: true, message: "data returnned", product });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
  //   res.json({
  //     _id: req.params.id,
  //     name: "Sumit Gandhi",
  //     price: 1000,
  //     description: "this is a product",
  //     image:
  //       "https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg?cs=srgb&dl=pexels-anjana-c-169994-674010.jpg&fm=jpg",
  //     category: "more pankh",
  //     stock: 1000,
  //   });
};
export default getProductById;

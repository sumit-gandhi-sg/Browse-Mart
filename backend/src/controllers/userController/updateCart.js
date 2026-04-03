import Product from "../../model/productSchema.js";

const updateCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const foundedUser = await req.user;

    if (quantity < 0) {
      return res?.status(400)?.json({ message: "Invalid quantity" });
    }

    const item = foundedUser?.cart?.find(
      (item) => item.productId?.toString() === productId?.toString()
    );

    if (!item) {
      return res?.status(404)?.json({ message: "Item not found" });
    }

    if (quantity === 0) {
      foundedUser.cart = foundedUser?.cart?.filter(
        (item) => item?.productId?.toString() !== productId.toString()
      );
      await foundedUser?.save();

      return res?.status(200)?.json({
        message: "Item removed from cart",
        cartCount: foundedUser?.cart?.length,
        removedProductId: productId,
      });
    }

    item.quantity = quantity;
    await foundedUser?.save();

    const product = await Product.findById(productId);

    if (!product) {
      return res?.status(404)?.json({ message: "Product not found" });
    }

    const updatedCartItem = {
      id: product?._id,
      name: product?.name,
      price: product?.price,
      description: product?.description,
      image: [product?.image?.[0]],
      category: product?.category,
      sellerId: product?.userId || product?.userID || product?.sellerId,
      sellingPrice: product?.sellingPrice || null,
      mrpPrice: product?.mrpPrice || null,
      quantity: item.quantity,
    };

    return res?.status(200)?.json({
      message: "Cart updated successfully",
      cartCount: foundedUser?.cart?.length,
      updatedCartItem,
    });
  } catch (error) {
    console.log(error);
    return res?.status(500)?.json({
      message: "Unable to update cart right now",
    });
  }
};
export default updateCart;

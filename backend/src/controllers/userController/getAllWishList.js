import Product from "../../model/productSchema.js";
const getAllWishList = async (req, res) => {
  try {
    const currentPage = Math.max(
      1,
      Number.parseInt(req?.body?.page || req?.query?.page || "1", 10)
    );
    const limit = Math.max(
      1,
      Number.parseInt(req?.body?.limit || req?.query?.limit || "10", 10)
    );
    const wishList = await req.user?.wishlist;

    if (wishList?.length === 0) {
      return res.status(204).json({
        success: true,
        message: "WishList is empty",
      });
    }

    const totalWishListProducts = wishList.length;
    const totalPages = Math.max(1, Math.ceil(totalWishListProducts / limit));
    const safePage = Math.min(currentPage, totalPages);
    const skip = (safePage - 1) * limit;
    const paginatedWishList = wishList.slice(skip, skip + limit);
    const productIds = paginatedWishList.map((item) => item?.productId);

    const products = await Product.find({
      _id: { $in: productIds },
    }).populate("category", "name");

    const productMap = new Map(
      products.map((product) => [product?._id?.toString(), product])
    );

    const wishListProducts = paginatedWishList
      .map((item) => {
        const product = productMap.get(item?.productId?.toString());
        if (!product) {
          return null;
        }

        return {
          id: product?._id || item?.productId || item?.id,
          name: product?.name,
          price: product?.price,
          description: product?.description,
          image: product?.image?.[0],
          category: product?.category,
          stock: product?.stock,
          mrpPrice: product?.mrpPrice,
          sellingPrice: product?.sellingPrice,
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      message: "WishList Products",
      wishListProducts,
      totalWishListProducts,
      totalPages,
      currentPage: safePage,
      startProductIndex: totalWishListProducts > 0 ? skip + 1 : 0,
      endProductIndex: Math.min(skip + paginatedWishList.length, totalWishListProducts),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export default getAllWishList;

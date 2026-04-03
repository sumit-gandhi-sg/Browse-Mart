import Product from "../../model/productSchema.js";

const getAllProductUsingSellerId = async (req, res) => {
  try {
    const { filters = {}, page = 1, limit = 10 } = req?.query;
    const { category, productStockStatus } = filters;
    const sellerId = req?.user?.sellerId;
    const skip = (Number(page) - 1) * Number(limit);
    const query = { sellerId };
    if (productStockStatus === "in stock") {
      query.stock = { $gt: 20 };
    } else if (productStockStatus === "low stock") {
      query.stock = { $gt: 0, $lte: 20 };
    } else if (productStockStatus === "out of stock") {
      query.stock = 0;
    }
    if (category) {
      query.category = category;
    }
    const totalCount = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalCount / Number(limit));
    const allProduct = await Product?.find(query)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .select("-review -description -__v");
    const start = totalCount === 0 ? 0 : skip + 1;
    const end = Math.min(skip + allProduct.length, totalCount);
    // console?.log(allProduct);

    //   const modifiedProducts = allProduct?.map((product) => {
    //     return {
    //       id: product?._id,
    //       name: product?.name,
    //       price: product?.price,
    //       image: product?.image?.[0],
    //       category: product?.category,
    //       stock: product?.stock > 0,
    //       mrpPrice: product?.mrpPrice,
    //       sellingPrice: product?.sellingPrice,
    //     };
    //   });

    return res?.status(200)?.json({
      sucess: true,
      message:
        allProduct.length > 0
          ? "All products fetched successfully"
          : "No Product found",
      allProduct,
      totalProducts: totalCount,
      page: Number(page),
      totalPages,
      startProductIndex: start,
      endProductIndex: end,
    });
  } catch (error) {
    console.log(error);
  }
};

export default getAllProductUsingSellerId;

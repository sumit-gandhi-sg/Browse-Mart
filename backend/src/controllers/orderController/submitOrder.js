import Order from "../../model/orderSchema.js";
import Product from "../../model/productSchema.js";

import { generateOrderId } from "../../utility/constraint.js";
import sendOrderConfirmationEmail from "../../services/sendOrderConfirmationEmail.js";

const submitOrder = async (req, res, next) => {
  try {
    const activeUser = req.user;
    const productCard = req?.body?.cartProduct;
    const shippingAddress = req?.body?.shippingAddress;
    const { methodName, methodDetail } = req?.body?.paymentData;
    const orderIds = [];

    const timeStamp = req?.body?.timeStamp;
    const saveDefaultShippingAddress = (shippingAddress, activeUser) => {
      try {
        if (!activeUser) return;
        if (!shippingAddress?.isDefaultShippingAddress) return;
        if (!shippingAddress) return "Shipping Address is required";
        const normalizedAddress = {
          addressLine1: shippingAddress?.addressLine1?.trim(),
          addressLine2:
            shippingAddress?.addressLine2?.trim() ||
            shippingAddress?.adressLine2?.trim() ||
            "",
          state: shippingAddress?.state?.trim(),
          city: shippingAddress?.city?.trim(),
          pinCode: shippingAddress?.pinCode?.trim(),
          country: shippingAddress?.country?.trim(),
        };
        activeUser.shippingAddress = normalizedAddress;
        return true;
      } catch (error) {
        console.error(" line 29", error);
      }
    };
    // decrease product quantity
    const decreaseProductQuantity = async (productId, quantity) => {
      try {
        const product = await Product.findById(productId);

        if (!product) throw new Error("Product not found");

        const quantityToOrder = Math?.min(product?.stock, quantity);
        product.stock -= quantityToOrder;
        await product.save();
        return quantityToOrder;
      } catch (error) {
        console.error("Line No 58", error.message);
      }
    };

    const filteredProduct = await Promise.all(
      productCard?.map(async (item) => {
        const orderedQuantity = await decreaseProductQuantity(
          item?.id || item?._id,
          item?.quantity
        );
        console.log(" Line No 120orderedQuantity ", orderedQuantity);
        if (orderedQuantity > 0)
          return {
            productId: item?.id || item?._id,
            productName: item?.name,
            price: item?.price || item?.sellingPrice,
            mrpPrice: item?.mrpPrice || null,
            sellingPrice: item?.sellingPrice || null,
            sellerId: item?.userId || item?.userID || item?.sellerId,
            quantity: orderedQuantity, // resolved quantity from decreaseProductQuantity
          };
      })
    );
    const isDefaultShippingAddressSaved = saveDefaultShippingAddress(
      shippingAddress,
      activeUser
    );
    if (isDefaultShippingAddressSaved === false) {
      return res
        .status(400)
        .json({ message: "Failed to save default shipping address" });
    }

    const groupProduct = filteredProduct?.reduce((acc, item) => {
      const sellerId = item?.sellerId;
      if (!acc[sellerId]) {
        acc[sellerId] = [];
      }
      acc[sellerId].push(item);
      return acc;
    }, {});

    for (const sellerId in groupProduct) {
      const filteredProduct = groupProduct[sellerId];
      // console.log("Active user", activeUser);
      if (filteredProduct[0]?.quantity === 0 || !filteredProduct[0]) {
        console.log("Line No 158 No products available for order");
        continue;
      }
      const totalMrpPrice = filteredProduct.reduce((total, product) => {
        return (
          total + (product?.mrpPrice || product?.price) * product?.quantity
        );
      }, 0);
      const totalSellingPrice = filteredProduct.reduce((total, product) => {
        return (
          total + (product?.sellingPrice || product?.price) * product?.quantity
        );
      }, 0);
      const totalDiscount = totalMrpPrice - totalSellingPrice;
      const shippingCharges =
        totalSellingPrice < 1000 ? totalSellingPrice * 0.1 : 0;

      const order = new Order({
        orderId: generateOrderId(timeStamp),
        customerId: activeUser?._id,
        orderItems: filteredProduct,
        shippingAddress: {
          addressLine1: shippingAddress?.addressLine1?.trim(),
          addressLine2: shippingAddress?.addressLine2?.trim() || "",
          state: shippingAddress?.state?.trim(),
          city: shippingAddress?.city?.trim(),
          pinCode: shippingAddress?.pinCode?.trim(),
          country: shippingAddress?.country?.trim(),
        },
        paymentMethod: methodName,
        paymentStatus: methodName?.toString() !== "cod" ? "success" : "pending",
        paymentMethodDetail: { ...methodDetail },
        // totalAmount: filteredProduct?.reduce((totalAmount, product) => {
        //   return product?.quantity > 0
        //     ? totalAmount +
        //         (product?.price || product?.sellingPrice) * product?.quantity
        //     : totalAmount;
        // }, 0),
        orderDate: timeStamp?.toLocaleString(),
        sellerId: sellerId,
        totalMrpPrice: totalMrpPrice,
        totalSellingPrice: totalSellingPrice,
        totalDiscount: totalDiscount,
        grandTotal: totalSellingPrice + shippingCharges,
        shippingCharge: shippingCharges,
      });
      await order.save();
      const { _id, orderId } = order;
      orderIds?.push(orderId);
      activeUser.order.push({
        orderId: _id,
      });
      console.log("Line No 193", order);
      await sendOrderConfirmationEmail(activeUser?.email, order);
    }

    // console.log("Line No 193", orderIds);
    if (!orderIds.length > 0) {
      return res.status(400).json({ message: "Failed to submit order" });
    }
    await activeUser.save();

    res?.status(201)?.json({
      message: "Order submitted successfully",
      orderIds,
      ...(isDefaultShippingAddressSaved === true && {
        updatedShippingAddress: activeUser.shippingAddress,
      }),
    });
  } catch (error) {
    console.error("Line No 203", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export default submitOrder;

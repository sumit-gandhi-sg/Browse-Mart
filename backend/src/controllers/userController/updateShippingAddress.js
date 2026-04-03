const normalizeAddress = (shippingAddress = {}) => ({
  addressLine1: shippingAddress?.addressLine1?.trim() || "",
  addressLine2:
    shippingAddress?.addressLine2?.trim() ||
    shippingAddress?.adressLine2?.trim() ||
    "",
  state: shippingAddress?.state?.trim() || "",
  city: shippingAddress?.city?.trim() || "",
  pinCode: shippingAddress?.pinCode?.trim() || "",
  country: shippingAddress?.country?.trim() || "",
});

const isAddressValid = (shippingAddress = {}) =>
  shippingAddress?.addressLine1 &&
  shippingAddress?.state &&
  shippingAddress?.city &&
  shippingAddress?.pinCode &&
  shippingAddress?.country;

const updateShippingAddress = async (req, res) => {
  try {
    const activeUser = req.user;
    const { shippingAddress } = req.body;

    const normalizedAddress = normalizeAddress(shippingAddress);

    if (!isAddressValid(normalizedAddress)) {
      return res
        .status(400)
        .json({ message: "Complete shipping address is required" });
    }

    activeUser.shippingAddress = normalizedAddress;

    await activeUser.save();

    return res.status(200).json({
      message: "Shipping address updated successfully",
      shippingAddress: activeUser.shippingAddress,
    });
  } catch (error) {
    console.log("Failed to update shipping address", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default updateShippingAddress;

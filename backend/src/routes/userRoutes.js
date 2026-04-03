import express from "express";
const router = express.Router();

import userAuthentication from "../middleware/userAuthentication.js";

import userProfile from "../controllers/userController/userProfile.js";
import changePassword from "../controllers/userController/changePassword.js";
import updateProfile from "../controllers/userController/updateProfile.js";
import addToCart from "../controllers/userController/addToCart.js";
import getCartItems from "../controllers/userController/getCartItems.js";
import updateCart from "../controllers/userController/updateCart.js";
import addRemoveItemToWishList from "../controllers/userController/addRemoveItemtoWishList.js";
import getAllWishList from "../controllers/userController/getAllWishList.js";
import updateShippingAddress from "../controllers/userController/updateShippingAddress.js";
// User routes
router.route("/profile").post(userAuthentication, userProfile);
router.route("/change-password").post(changePassword);
router.route("/update-profile").post(userAuthentication, updateProfile);
router
  .route("/update-shipping-address")
  .post(userAuthentication, updateShippingAddress);
router.route("/add-to-cart").post(userAuthentication, addToCart);
router.route("/get-cart-items").post(userAuthentication, getCartItems);
router.route("/update-cart").post(userAuthentication, updateCart);
router
  .route("/add-to-wishlist")
  .post(userAuthentication, addRemoveItemToWishList);
router.route("/get-wishlist").post(userAuthentication, getAllWishList);
export default router;

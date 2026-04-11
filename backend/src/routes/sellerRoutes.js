import express from "express";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

import userAuthentication from "../middleware/userAuthentication.js";
import sellerAuthentication from "../middleware/sellerAuthentication.js";

import sellerRegistration from "../controllers/sellerController/sellerRegistration.js";
import dashBoard from "../controllers/sellerController/dashBoard.js";
import getAllProductUsingSellerId from "../controllers/sellerController/getAllProductUsingSellerId.js";
import productVisibilityToggle from "../controllers/sellerController/productVisibilityToggle.js";
import deleteProduct from "../controllers/sellerController/deleteProduct.js";
import updateProduct from "../controllers/sellerController/updateProduct.js";
import getAllOrdersBySellerId from "../controllers/sellerController/getAllOrdersBySellerId.js";
import updateOrderStatus from "../controllers/sellerController/updateOrderStatus.js";
import getDistinctCustomersBySellerId from "../controllers/sellerController/getDistinctCustomersBySellerId.js";

router.route("/register").post(userAuthentication, sellerRegistration);
router
  .route("/seller-dashboard")
  .get(userAuthentication, sellerAuthentication, dashBoard);
router
  .route("/get-all-product")
  .get(userAuthentication, sellerAuthentication, getAllProductUsingSellerId);
router
  .route("/orders")
  .get(userAuthentication, sellerAuthentication, getAllOrdersBySellerId);
router
  .route("/customers")
  .get(
    userAuthentication,
    sellerAuthentication,
    getDistinctCustomersBySellerId,
  );
router.patch(
  "/orders/:id/status",
  userAuthentication,
  sellerAuthentication,
  updateOrderStatus,
);
router.patch(
  "/product/visibilty-toggle/:id",
  userAuthentication,
  sellerAuthentication,
  productVisibilityToggle,
);
router.delete(
  "/product/:id",
  userAuthentication,
  sellerAuthentication,
  deleteProduct,
);
router.put(
  "/product/:id",
  userAuthentication,
  sellerAuthentication,
  upload.array("image"),
  updateProduct
);

export default router;

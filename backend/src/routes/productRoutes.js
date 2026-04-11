import express from "express";
import multer from "multer";

const router = express.Router();

// Memory storage keeps the files as Buffer objects directly in RAM
const upload = multer({ storage: multer.memoryStorage() });

import addProduct from "../controllers/productController/addProduct.js";
import getAllProduct from "../controllers/productController/getAllProduct.js";
import getProductById from "../controllers/productController/getProductById.js";
import getRelatedProduct from "../controllers/productController/getRelatedProduct.js";

import submitReview from "../controllers/reviewController/submitReview.js";

import userAuthentication from "../middleware/userAuthentication.js";

// Add multer middleware handling mutiple files under the field name 'image'
router.route("/add-product").post(userAuthentication, upload.array("image"), addProduct);

router.route("/get-all-products").get(getAllProduct);
router.route("/get-related-product").get(getRelatedProduct);
router.route("/:id").get(getProductById);

router.route("/submit-review").post(userAuthentication, submitReview);

export default router;

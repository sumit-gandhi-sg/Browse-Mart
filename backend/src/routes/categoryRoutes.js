import express from "express";
import getCategories from "../controllers/categoryController/getCategories.js";
import addCategory from "../controllers/categoryController/addCategory.js";
import updateCategory from "../controllers/categoryController/updateCategory.js";
import deleteCategory from "../controllers/categoryController/deleteCategory.js";
import userAuthentication from "../middleware/userAuthentication.js";
import checkUserStatus from "../middleware/checkUserStatus.js";
import adminAuthentication from "../middleware/adminAuthentication.js";

const router = express.Router();

// Public route to fetch categories
router.get("/", getCategories);

// Admin only routes
router.post(
  "/",
  userAuthentication,
  checkUserStatus,
  adminAuthentication,
  addCategory
);

router.put(
  "/:id",
  userAuthentication,
  checkUserStatus,
  adminAuthentication,
  updateCategory
);

router.delete(
  "/:id",
  userAuthentication,
  checkUserStatus,
  adminAuthentication,
  deleteCategory
);

export default router;

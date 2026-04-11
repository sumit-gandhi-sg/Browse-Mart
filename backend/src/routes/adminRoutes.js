import express from "express";
import userAuthentication from "../middleware/userAuthentication.js";
import checkUserStatus from "../middleware/checkUserStatus.js";
import adminAuthentication from "../middleware/adminAuthentication.js";

import getUsers from "../controllers/adminController/getUsers.js";
import updateUserStatus from "../controllers/adminController/updateUserStatus.js";
import getProducts from "../controllers/adminController/getProducts.js";
import getDashboardStats from "../controllers/adminController/getDashboardStats.js";

const router = express.Router();

// 1. Authenticate user's JWT
router.use(userAuthentication);
// 2. Guarantee the account is not suspended in the database
router.use(checkUserStatus);
// 3. Guarantee the user holds an "admin" clearance role
router.use(adminAuthentication);

// Secure Admin Endpoints
router.get("/users", getUsers);
router.patch("/users/:id/status", updateUserStatus);
router.get("/products", getProducts);
router.get("/stats", getDashboardStats);

export default router;

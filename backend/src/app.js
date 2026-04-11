import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import authRoutes from "./routes/authRoute.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();
const CORS_ORIGIN_URL = process.env.CORS_ORIGIN_URL || "*";
app.use(
  cors({
    origin: CORS_ORIGIN_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.options("*", cors());
// app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/api/product", productRoutes);
app.use("/api/user", userRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", function (req, res) {
  res.send("Hello, bro");
});

export default app;

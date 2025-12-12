import "dotenv/config"; // Load env vars BEFORE any other imports

// import dotenv from "dotenv";
// dotenv.config();

import app from "./app.js";
import connectDB from "../src/config/db-connect.js";

const PORT = process.env.PORT || 8000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

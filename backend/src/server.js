import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/db-connect.js";

const PORT = process.env.PORT || 8000;
const isVercel = process.env.VERCEL === "1";

await connectDB();

if (!isVercel) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;

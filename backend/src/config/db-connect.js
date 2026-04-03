import mongoose from "mongoose";

let cachedConnection = null;
let cachedPromise = null;

mongoose.set("strictQuery", true);

const getMongoUri = () => {
  const DB_URL = process.env.DB_URL;
  const DB_NAME = process.env.DB_NAME;

  if (!DB_URL) {
    throw new Error("DB_URL is not configured");
  }

  return DB_NAME ? `${DB_URL}/${DB_NAME}` : DB_URL;
};

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  const mongoUri = getMongoUri();

  cachedPromise = mongoose
    .connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    })
    .then((mongooseInstance) => {
      cachedConnection = mongooseInstance;
      console.log("Database connected...");
      return mongooseInstance;
    })
    .catch((error) => {
      cachedPromise = null;
      cachedConnection = null;
      console.error("Database connection failed:", error.message);
      throw error;
    });

  return cachedPromise;
};

export default connectDB;

import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./src/config/db-connect.js";
import Category from "./src/model/categorySchema.js";

dotenv.config();

const migrate = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB database.");

    // Using native collection to bypass Schema casting errors (since type changed to ObjectId in schema)
    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');
    
    // Get all products
    const products = await productsCollection.find({}).toArray();
    console.log(`Found ${products.length} products to map.`);

    for (const product of products) {
       let updated = false;
       const updatePayload = {};

       // If category is a string type
       if (product.category && typeof product.category === 'string') {
          const matchedCategory = await Category.findOne({ name: product.category.toLowerCase() });
          if (matchedCategory) {
             updatePayload.category = matchedCategory._id;
             updated = true;
          } else {
             console.log(`[!] Warning: Category '${product.category}' not found in DB for product ${product._id}`);
          }
       }

       // If subcategory is a string type
       if (product.subCategory && typeof product.subCategory === 'string') {
          const matchedSub = await Category.findOne({ name: product.subCategory.toLowerCase() });
          if (matchedSub) {
             updatePayload.subCategory = matchedSub._id;
             updated = true;
          } else {
             console.log(`[!] Warning: Subcategory '${product.subCategory}' not found in DB for product ${product._id}`);
          }
       }

       if (updated) {
          await productsCollection.updateOne(
             { _id: product._id },
             { $set: updatePayload }
          );
          console.log(`✅ Migrated Product ${product._id}`);
       } else if (typeof product.category === 'object') {
          console.log(`Product ${product._id} appears already migrated.`);
       }
    }

    console.log("Migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  }
};

migrate();

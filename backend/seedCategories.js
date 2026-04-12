import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./src/config/db-connect.js";
import Category from "./src/model/categorySchema.js";

dotenv.config();

const productCategory = [
  {
    value: "electronics",
    child: ["Smartphones", "laptops", "cameras", "headphones", "gadgets"],
  },
  {
    value: "clothing",
    child: ["shirts", "pants", "t-shirts", "jeans", "dresses"],
  },
  {
    value: "home & kitchen",
    child: [
      "Cookware",
      "appliances",
      "furniture",
      "kitchenware",
      "household items",
    ],
  },
  {
    value: "books",
    child: ["fiction", "non-fiction", "children's books", "mystery", "romance"],
  },
  {
    value: "grocery",
    child: [
      "vegetables",
      "fruits",
      "meat",
      "dairy",
      "bakery",
      "snacks",
      "beverages",
    ],
  },
  {
    value: "toys",
    child: [
      "action figures",
      "electronic toys",
      "building toys",
      "sports toys",
      "diy toys",
    ],
  },
  {
    value: "sports",
    child: ["football", "basketball", "tennis", "hockey", "golf"],
  },
  {
    value: "health & beauty",
    child: [
      "makeup",
      "skincare",
      "hair care",
      "beauty supplies",
      "personal care",
      "fragrances",
      "Health Care",
    ],
  },
  {
    value: "fashion",
    child: ["shoes", "accessories", "jewelry"],
  },
  {
    value: "others",
  },
];

const seedCategories = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB database.");

    console.log("Seeding base categories and subcategories...");

    for (let mainCat of productCategory) {
       // Find or create main category
       let category = await Category.findOne({ name: mainCat.value.toLowerCase() });
       if (!category) {
          category = new Category({
             name: mainCat.value.toLowerCase(),
             description: `Top-level category for ${mainCat.value}`
          });
          await category.save();
          console.log(`Created Main Category: ${mainCat.value}`);
       }

       if (mainCat.child && mainCat.child.length > 0) {
          for (let subcatName of mainCat.child) {
             let subcat = await Category.findOne({ name: subcatName.toLowerCase() });
             if (!subcat) {
                 subcat = new Category({
                    name: subcatName.toLowerCase(),
                    description: `${subcatName} - sub category of ${mainCat.value}`,
                    parentCategory: category._id
                 });
                 await subcat.save();
                 console.log(`  -> Created Subcategory: ${subcatName}`);
             } else {
                 // Ensure parent linkage is correct if pre-exists
                 if (!subcat.parentCategory || subcat.parentCategory.toString() !== category._id.toString()) {
                     subcat.parentCategory = category._id;
                     await subcat.save();
                 }
             }
          }
       }
    }

    console.log("✅ Seed complete! All categories are securely pushed to DB.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding categories:", error.message);
    process.exit(1);
  }
};

seedCategories();

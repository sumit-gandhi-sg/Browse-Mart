import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./src/config/db-connect.js";
import User from "./src/model/userSchema.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB database.");

    const email = "admin@gmail.com";
    
    // Check if the admin account already exists
    const existingAdmin = await User.findOne({ email });
    
    if (existingAdmin) {
      console.log(`[!] User ${email} already found in database.`);
      console.log("Updating their role to Admin and ensuring they are verified/active...");
      
      existingAdmin.userType = "admin";
      existingAdmin.status = "active";
      existingAdmin.isVerified = true;
      existingAdmin.password = "adminuser"; // Resetting to dummy password to ensure matching frontend

      await existingAdmin.save();
      console.log("✅ Admin account successfully upgraded and secured!");
    } else {
      console.log("Creating brand new Admin identity...");
      
      const adminUser = new User({
        name: "BrowseMart Command",
        email: email,
        password: "adminuser", // Handled securely by userSchema.pre("save") hook
        userType: "admin",
        status: "active",
        isVerified: true
      });

      await adminUser.save();
      console.log(`✅ Admin account '${email}' successfully created!`);
    }

    console.log("Seeding process complete. Safe to exit.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin user:", error.message);
    process.exit(1);
  }
};

seedAdmin();

import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

// Configure Cloudinary with your backend environment variables
cloudinary.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a memory buffer (from multer) directly to Cloudinary via stream.
 */
export const uploadImageToCloudinary = (fileBuffer, folderName = "browsemart-products") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folderName },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    // End the stream with the buffer payload
    uploadStream.end(fileBuffer);
  });
};

/**
 * Extracts public_id from secure URL and deletes the asset from Cloudinary.
 */
export const deleteImageFromCloudinary = async (secureUrl) => {
  try {
    if (!secureUrl) return;
    
    // Example secureUrl: "https://res.cloudinary.com/xyz/image/upload/v123456/browsemart-products/abcde.jpg"
    const parts = secureUrl.split("/");
    const filenameWithExtension = parts.pop();
    const folderName = parts.pop();
    const filename = filenameWithExtension.split(".")[0];
    
    const publicId = `${folderName}/${filename}`;
    
    // Secure background deletion
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary Destroy Error:", error);
    return null;
  }
};

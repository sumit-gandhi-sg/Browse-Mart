import sendEmail from "./emailService.js";
import bcrypt from "bcrypt";

const sendOtpEmail = async (email, subject) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const salt = await bcrypt.genSalt(10);
    const hashOtp = await bcrypt.hash(otp.toString()?.trim(), salt);
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
      <h2>🔐 ${subject}</h2>
        <p>Hello,</p>
        <p>Your One-Time Password (OTP) is:</p>
        <p style="font-size: 24px; font-weight: bold; color: #2c3e50; background: #f0f0f0; padding: 10px; display: inline-block; border-radius: 5px;">${otp}</p>
        <p>This OTP is valid for <span style="color: #e74c3c; font-weight: bold;">10 minutes</span>. Please do not share it with anyone.</p>
        <p>If you did not request this, please ignore this email.</p>
        <hr>
        <p style="font-size: 12px; color: #777;">Thank you,<br><strong>Browse Mart</strong></p>
        </div>
        </div>
        `;
    const isEmailSent = await sendEmail(email, subject, htmlContent);
    return isEmailSent ? hashOtp : null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default sendOtpEmail;

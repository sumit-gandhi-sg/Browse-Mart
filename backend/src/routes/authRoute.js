import express from "express";
const router = express.Router();

import register from "../controllers/authController/register.js";
import login from "../controllers/authController/login.js";
import forgetPassword from "../controllers/authController/forgetPassword.js";
import verifyOtp from "../controllers/authController/verifyOtp.js";
import resetPassword from "../controllers/authController/resetPassword.js";
import verifyOTPForRegistration from "../controllers/authController/verifyOTPForRegistration.js";
import resendOtp from "../controllers/authController/resendOtp.js";
import otpVerification from "../middleware/otpVerification.js";

router.route("/register").post(register);
router
  .route("/email-verification")
  .post(otpVerification, verifyOTPForRegistration);
router.route("/login").post(login);
router.route("/resend-otp").post(resendOtp);
router.route("/forget-password").post(forgetPassword);
router.route("/verify-otp").post(otpVerification, verifyOtp);
router.route("/set-password").post(resetPassword);
export default router;

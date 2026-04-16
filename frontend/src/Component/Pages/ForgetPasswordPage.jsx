import { useEffect, useState } from "react";
import { useTheme } from "../../Context/themeContext";
import { Button, Input, OTPInput } from "../../LIBS";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { BiLoaderAlt } from "react-icons/bi";
import { FaMoon, FaSun } from "react-icons/fa6";
import { useAuth } from "../../Context/authContext";
// import { BiLoaderAlt } from "react-icons/bi";
const ForgetPasswordPage = () => {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { authToken } = useAuth();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const passwordToggle = () => {
    setIsPasswordShow((prev) => !prev);
  };

  //Handle Sending OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    localStorage.removeItem("resetToken");
    if (!emailRegex?.test(email)) {
      setErrorMessage("Email is Not Valid! ");
      return;
    }
    setMessage("");
    setIsProcessing(true);
    axios({
      method: "post",
      url: `${SERVER_URL}/api/auth/forget-password`,
      data: {
        email,
      },
      headers: { "Content-type": "application/json; charset=UTF-8" },
    })
      .then(({ status, data }) => {
        if (status === 200) {
          setStep(2);
          setMessage(data?.message);
          setErrorMessage("");
        }
      })
      .catch((error) => {
        console.log(error);
        const {
          message = "",
          sucess = undefined,
          requiresVerification = undefined,
        } = error?.response?.data || error;

        setErrorMessage(message);
      })
      .finally(() => setIsProcessing(false));
  };

  //Handling OTP Verification
  const handleVerifyOtp = async (otp) => {
    // e.preventDefault();
    setErrorMessage("");
    if (otp.length < 6 || otp.length > 6) {
      setErrorMessage(
        "OTP must be a 6-digit number. Please enter a valid OTP.",
      );
      return;
    }
    setMessage("");
    setIsProcessing(true);
    axios({
      method: "post",
      url: `${SERVER_URL}/api/auth/verify-otp`,
      data: {
        email,
        otp,
      },
      headers: { "Content-type": "application/json; charset=UTF-8" },
    })
      .then(({ status = 200, data = {} }) => {
        if (status === 200) {
          localStorage.setItem("resetToken", data?.resetToken);
          setStep(3);
          setErrorMessage("");
          setMessage(data?.message);
        }
      })
      .catch((error) => {
        const {
          message = "",
          sucess = undefined,
          requiresVerification = undefined,
        } = error?.response?.data || error;
        setErrorMessage(message || "Something went wrong");
      })
      .finally(() => {
        setIsProcessing(false);
      });
    // console.log("Verifying OTP", otp);
  };

  //Handling Saving New Password
  const handleResetPassword = async (e) => {
    if (newPassword.length < 6 || !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      setErrorMessage(
        "Password must be at least 6 characters long and include at least one special character (e.g., @, #, $, !).",
      );
      return;
    }
    setIsProcessing(true);
    e.preventDefault();
    axios({
      method: "post",
      url: `${SERVER_URL}/api/auth/set-password`,
      data: {
        resetToken: localStorage.getItem("resetToken"),
        newPassword,
      },
      headers: { "Content-type": "application/json; charset=UTF-8" },
    })
      .then((response) => {
        setNewPassword("");
        const { status, data } = response;
        if (status === 200) {
          Swal.fire("Congrats", data?.message, "success").then((value) => {
            navigate("/login");
          });
        }
      })
      .catch((error) => {
        setMessage(error?.response?.data?.message);
      })
      .finally(() => {
        localStorage.removeItem("resetToken");
        setIsProcessing(false);
      });
  };
  useEffect(() => {
    if (authToken) {
      navigate("/");
    }
  });
  return (
    !authToken && (
      <div
        className={`min-h-screen transition-all duration-300 ${
          theme === "dark"
            ? "bg-gray-950 text-white"
            : "bg-slate-100 text-slate-900"
        }`}
      >
        <Button
          onClick={toggleTheme}
          className={`fixed right-5 top-5 z-20 h-10 w-10 rounded-full shadow ${
            theme === "dark" ? "bg-slate-800" : "bg-white"
          }`}
          icon={
            theme === "dark" ? (
              <FaSun className="h-5 w-5 text-amber-300" />
            ) : (
              <FaMoon className="h-5 w-5 text-slate-700" />
            )
          }
        />

        <div className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10 tablet:px-6">
          <div
            className={`grid w-full overflow-hidden rounded-3xl border shadow-2xl laptop:grid-cols-[1fr_1fr] ${
              theme === "dark"
                ? "border-slate-800 bg-slate-900"
                : "border-slate-200 bg-white"
            }`}
          >
            <div
              className={`hidden p-10 laptop:block ${
                theme === "dark"
                  ? "bg-gradient-to-br from-slate-700 via-indigo-700 to-blue-800"
                  : "bg-gradient-to-br from-slate-500 via-indigo-500 to-blue-600"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                Account Recovery
              </p>
              <h1 className="mt-6 text-4xl font-black leading-tight text-white">
                Reset your password securely in minutes.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/85">
                Verify your email with OTP and set a strong new password to
                regain access.
              </p>
              <div className="mt-10 space-y-3 text-sm text-white/90">
                <p>Step 1: Request OTP</p>
                <p>Step 2: Verify OTP</p>
                <p>Step 3: Set new password</p>
              </div>
            </div>

            <div className="p-6 mobile:p-5 tablet:p-8">
              <h2 className="text-3xl font-black tracking-tight">
                {step === 1
                  ? "Forgot Password"
                  : step === 2
                    ? "Verify OTP"
                    : "Set New Password"}
              </h2>
              <p
                className={`mt-2 text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}
              >
                {step === 1
                  ? "Enter your account email to receive a verification OTP."
                  : step === 2
                    ? "Enter the code sent to your registered email address."
                    : "Create a strong password to secure your account."}
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                }}
                className="mt-7"
              >
                {step === 1 && (
                  <div className="space-y-3">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full rounded-xl border-2 p-3 ${
                        theme === "dark"
                          ? "border-slate-700 bg-slate-800 text-white"
                          : "border-slate-300 bg-slate-50 text-slate-900"
                      }`}
                    />

                    {errorMessage && (
                      <p className="text-sm font-medium text-red-500">
                        {errorMessage}
                      </p>
                    )}

                    <Button
                      btntext={isProcessing ? "Sending OTP..." : "Send OTP"}
                      onClick={handleSendOtp}
                      icon={
                        isProcessing ? (
                          <BiLoaderAlt className="h-5 w-5 animate-spin" />
                        ) : (
                          ""
                        )
                      }
                      className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-white"
                      disabled={isProcessing}
                    />
                  </div>
                )}

                {step === 2 && (
                  <OTPInput
                    message={message}
                    errorMessage={errorMessage}
                    isProcessing={isProcessing}
                    onOtpVerify={handleVerifyOtp}
                  />
                )}

                {step === 3 && (
                  <div className="space-y-3">
                    <p
                      className={`text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}
                    >
                      {message || "OTP verified successfully."}
                    </p>

                    <div className="relative">
                      <Input
                        type={isPasswordShow ? "text" : "password"}
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`w-full rounded-xl border-2 p-3 pr-10 ${
                          theme === "dark"
                            ? "border-slate-700 bg-slate-800 text-white"
                            : "border-slate-300 bg-slate-50 text-slate-900"
                        }`}
                      />

                      {newPassword && (
                        <button
                          type="button"
                          onClick={passwordToggle}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        >
                          {isPasswordShow ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      )}
                    </div>

                    {errorMessage && (
                      <p className="text-sm font-medium text-red-500">
                        {errorMessage}
                      </p>
                    )}

                    <Button
                      btntext={isProcessing ? "Resetting..." : "Reset Password"}
                      onClick={handleResetPassword}
                      className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-white"
                      icon={
                        isProcessing ? (
                          <BiLoaderAlt className="h-5 w-5 animate-spin" />
                        ) : (
                          ""
                        )
                      }
                      disabled={isProcessing}
                    />
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default ForgetPasswordPage;

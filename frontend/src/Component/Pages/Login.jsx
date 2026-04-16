import React, { useEffect, useState } from "react";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import { useTheme } from "../../Context/themeContext";
import { Button, Input, OTPInput } from "../../LIBS";
import { customToast } from "../../utility/constant";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaMoon, FaSun } from "react-icons/fa6";
import { guestUser, sellerUser } from "../../utility/constant";
import { BiLoaderAlt } from "react-icons/bi";
import { useAuth } from "../../Context/authContext";
import { checkValidation } from "../../utility/constant";
const Login = () => {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { authToken, setAuthToken } = useAuth();
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [step, setStep] = useState(1);
  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const [isProcessing, setIsProcessing] = useState({
    form: false,
    guestLogin: false,
    sellerLogin: false,
    otpVerification: false,
  });
  const redirect = new URLSearchParams(location?.search)?.get("redirect");
  // const checkValidation = () => {
  //   const newErrors = {};
  //   if (!loginData?.email) newErrors.email = "Email is required!";
  //   if (!loginData?.password) newErrors.password = "Password is required!";
  //   if (loginData.email && !emailRegex?.test(loginData?.email))
  //     newErrors.email = "Email is Not Valid!";
  //   setError(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };

  const handleLogin = (formData, caller) => {
    setError({});
    setErrorMessage("");
    setIsProcessing((prev) => ({ ...prev, [caller]: true }));
    axios({
      method: "POST",
      url: `${SERVER_URL}/api/auth/login`,
      data: formData,
      headers: { "Content-type": "application/json; charset=UTF-8" },
    })
      .then((response) => {
        if (response.status === 200) {
          localStorage.setItem("AuthToken", response?.data?.AuthToken);
          setAuthToken(response?.data?.AuthToken);
          navigate(redirect ? `${redirect}` : "/");
          customToast(theme).fire({
            icon: "success",
            title: "User Login Successfully !",
          });
        }
      })
      .catch((error) => {
        const status = error?.response?.status || null;
        const {
          message = "",
          sucess = undefined,
          requiresVerification = undefined,
          error: errorMessage = null,
        } = error?.response?.data || error;
        if (status === 403 && requiresVerification) {
          setMessage(message);
          setStep(2);
        } else {
          customToast(theme).fire({
            icon: "error",
            title: message || "Something went wrong",
            text: errorMessage,
          });
          // setErrorMessage(message || "Something went wrong");
          // swalCustomConfiguration(theme)?.fire(
          //   "Oops!",
          //   "Something went wrong",
          //   "error"
          // );
        }
      })
      .finally(() => setIsProcessing((prev) => ({ ...prev, [caller]: false })));
  };
  const handleOtpSubmit = (otp) => {
    if (otp.length < 6) {
      setErrorMessage("OTP must be Six Digit");
      return;
    }
    handleOtpVerification(otp, "otpVerification");
  };
  const handleOtpVerification = (otp, caller) => {
    setIsProcessing((prev) => ({ ...prev, [caller]: true }));

    axios({
      method: "post",
      url: `${SERVER_URL}/api/auth/email-verification`,
      data: {
        otp,
        email: loginData?.email || guestUser?.email,
      },
      headers: { "Content-Type": "application/json; charset=UTF-8" },
    })
      .then((response) => {
        if (response.status === 201) {
          localStorage.setItem("AuthToken", response?.data?.authToken);
          setAuthToken(response?.data?.authToken);
          navigate(redirect ? `${redirect}` : "/");
        }
      })
      .catch((error) => {
        const data = error?.response?.data;
        const status = error?.response?.status;
        if (status === 400) {
          setErrorMessage(data?.message);
        }
      })
      .finally(() => {
        setIsProcessing((prev) => ({ ...prev, [caller]: false }));
      });
  };

  const onResendOTP = () => {
    // setIsProcessing((prev) => ({ ...prev, otpVerification: true }));
    setErrorMessage("");
    setMessage("");

    axios({
      method: "POST",
      url: `${SERVER_URL}/api/auth/resend-otp`,
      data: { email: loginData?.email },
      headers: { "Content-Type": "application/json; charset=UTF-8" },
    })
      .then((response) => {
        const { status, data } = response;
        if (status === 200) {
          setMessage(data?.message);
          setErrorMessage("");
        }
      })
      .catch((error) => {
        console.log(error);
        const status = error?.response?.status;
        const { message = "Failed to resend OTP" } =
          error?.response?.data || {};
        setErrorMessage(message);
        setMessage("");
      });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");
    const err = checkValidation(loginData);
    if (err) {
      setError({ ...err });
      return;
    }
    setError({});
    handleLogin(loginData, "form");
  };
  const handleGuestLogin = (e) => {
    e.preventDefault();
    handleLogin(guestUser, "guestLogin");
  };
  const handleSellerLogin = (e) => {
    e.preventDefault();
    handleLogin(sellerUser, "sellerLogin");
  };
  const handleInput = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };
  const passwordToggle = () => {
    setIsPasswordShow((prev) => !prev);
  };
  useEffect(() => {
    if (authToken) navigate(redirect ? `${redirect}` : "/");
  }, [authToken]);
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

        <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 tablet:px-6">
          <div
            className={`grid w-full overflow-hidden rounded-3xl border shadow-2xl laptop:grid-cols-[1.05fr_1fr] ${
              theme === "dark"
                ? "border-slate-800 bg-slate-900"
                : "border-slate-200 bg-white"
            }`}
          >
            <div
              className={`hidden p-10 laptop:block ${
                theme === "dark"
                  ? "bg-gradient-to-br from-indigo-600 via-sky-700 to-cyan-700"
                  : "bg-gradient-to-br from-indigo-500 via-sky-500 to-cyan-500"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                Browse Mart
              </p>
              <h1 className="mt-6 text-4xl font-black leading-tight text-white">
                Sign in to continue shopping smarter.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/85">
                Track orders, manage wishlist, and access personalized
                recommendations from your dashboard.
              </p>
              <div className="mt-10 space-y-3 text-sm text-white/90">
                <p>1. Secure login and OTP verification</p>
                <p>2. Fast checkout with saved profile</p>
                <p>3. Access buyer, seller, or admin flow</p>
              </div>
            </div>

            <div className="p-6 mobile:p-5 tablet:p-8">
              <h2 className="text-3xl font-black tracking-tight">
                {step === 1 ? "Welcome Back" : "Verify OTP"}
              </h2>
              <p
                className={`mt-2 text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}
              >
                {step === 1
                  ? "Login with your credentials to access your account."
                  : "Enter the verification code sent to your email."}
              </p>

              <form onSubmit={handleSubmit} className="mt-7">
                {step === 1 && (
                  <div className="space-y-3">
                    <div>
                      <Input
                        type="text"
                        placeholder="Email"
                        className={`w-full rounded-xl border-2 p-3 ${
                          theme === "dark"
                            ? "border-slate-700 bg-slate-800 text-white"
                            : "border-slate-300 bg-slate-50 text-slate-900"
                        }`}
                        value={loginData.email}
                        onChange={handleInput}
                        name="email"
                      />
                      {error.email && (
                        <p className="mt-1 text-sm font-medium text-red-500">
                          {error.email}
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <Input
                        type={isPasswordShow ? "text" : "password"}
                        placeholder="Password"
                        className={`w-full rounded-xl border-2 p-3 pr-10 ${
                          theme === "dark"
                            ? "border-slate-700 bg-slate-800 text-white"
                            : "border-slate-300 bg-slate-50 text-slate-900"
                        }`}
                        value={loginData.password}
                        onChange={handleInput}
                        name="password"
                      />
                      {loginData?.password && (
                        <button
                          type="button"
                          onClick={passwordToggle}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        >
                          {isPasswordShow ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      )}
                      {error.password && (
                        <p className="mt-1 text-sm font-medium text-red-500">
                          {error.password}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-end">
                      <Link
                        to="/forget-password"
                        className="text-sm font-medium text-blue-500 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    {errorMessage && (
                      <p className="text-sm font-medium text-red-500">
                        {errorMessage}
                      </p>
                    )}

                    <Button
                      type="submit"
                      btntext="Login"
                      className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-white"
                      onClick={handleSubmit}
                      icon={
                        isProcessing.form ? (
                          <BiLoaderAlt className="h-5 w-5 animate-spin" />
                        ) : (
                          ""
                        )
                      }
                      disabled={isProcessing.form}
                    />

                    <div className="pt-3">
                      <p
                        className={`mb-2 text-xs font-semibold uppercase tracking-[0.15em] ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}
                      >
                        Quick Login
                      </p>
                      <div className="grid gap-2 small-device:grid-cols-2">
                        <Button
                          className={`rounded-xl py-2 text-sm ${theme === "dark" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-800"}`}
                          icon={
                            isProcessing.guestLogin ? (
                              <BiLoaderAlt className="h-4 w-4 animate-spin" />
                            ) : (
                              ""
                            )
                          }
                          onClick={handleGuestLogin}
                          btntext="Guest"
                          disabled={isProcessing.guestLogin}
                        />
                        <Button
                          className={`rounded-xl py-2 text-sm ${theme === "dark" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-800"}`}
                          icon={
                            isProcessing.sellerLogin ? (
                              <BiLoaderAlt className="h-4 w-4 animate-spin" />
                            ) : (
                              ""
                            )
                          }
                          onClick={handleSellerLogin}
                          btntext="Seller"
                          disabled={isProcessing.sellerLogin}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <OTPInput
                    isProcessing={isProcessing.otpVerification}
                    message={message}
                    errorMessage={errorMessage}
                    onOtpVerify={handleOtpSubmit}
                    onResendOTP={onResendOTP}
                  />
                )}
              </form>

              <p
                className={`mt-6 text-center text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}
              >
                Don&apos;t have an account?{" "}
                <Link
                  className="font-semibold text-blue-500 hover:underline"
                  to="/register"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default Login;

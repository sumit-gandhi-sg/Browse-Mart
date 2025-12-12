import React, { useEffect, useState } from "react";
import { FaGoogle, FaFacebook, FaEyeSlash, FaEye } from "react-icons/fa";
import { useTheme } from "../../Context/themeContext";
import { Button, Input, OTPInput } from "../../LIBS";
import {
  customToast,
  swalCustomConfiguration,
  Toast,
} from "../../utility/constant";
import axios from "axios";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";
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
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
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
          Toast.fire({
            icon: "success",
            title: "User Login Successfully !",
          });
        } else {
          swalCustomConfiguration(theme)?.fire(
            "Oops!",
            "Something went wrong",
            "error"
          );
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
          Toast.fire({
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
    if (authToken) navigate("/");
  }, [authToken]);
  return (
    !authToken && (
      <div
        className={`${
          theme === "dark" ? "bg-gray-900" : "bg-gray-200"
        } min-h-screen flex items-center justify-center   transition-all duration-300 relative`}
      >
        <div
          className={`p-8  shadow-lg rounded-lg mobile:mx-5 small-device:mx-0  w-full max-w-md  ${
            theme === "dark" ? " bg-gray-800" : "bg-white"
          } transition-all duration-300`}
        >
          {step === 1 && (
            <div>
              <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Browse Mart
              </h2>

              <h3
                className={`mt-4 text-lg font-semibold ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Welcome back
              </h3>
            </div>
          )}
          <form className="">
            {step === 1 && (
              <div className="mt-4 flex flex-col gap-2">
                <div className="w-full">
                  <Input
                    type="text"
                    placeholder="Email or Username"
                    className={`w-full p-2 rounded-md border-2  ${
                      theme === "dark"
                        ? "bg-gray-700 text-white border-gray-600 focus:border-gray-300"
                        : "text-gray-900 bg-gray-100 border-gray-300 focus:border-gray-600"
                    }`}
                    value={loginData.email}
                    onChange={handleInput}
                    name={"email"}
                  />
                  {error.email && (
                    <p className="text-red-500 text-sm font-medium mt-1">
                      {error.email}
                    </p>
                  )}
                </div>
                <div className="w-full relative">
                  <Input
                    type={`${isPasswordShow ? "text" : "password"}`}
                    placeholder="Password"
                    className={`w-full p-2 rounded-md border-2  ${
                      theme === "dark"
                        ? "bg-gray-700 text-white border-gray-600 focus:border-gray-300"
                        : "text-gray-900 bg-gray-100 border-gray-300 focus:border-gray-600"
                    }`}
                    value={loginData.password}
                    onChange={handleInput}
                    name={"password"}
                  />
                  {error.password && (
                    <p className="text-red-500 text-sm font-medium mt-1">
                      {error.password}
                    </p>
                  )}

                  <div
                    onClick={passwordToggle}
                    className={`hover:cursor-pointer absolute  right-3  -translate-y-1/2 ${
                      loginData?.password
                        ? "flex items-center justify-center"
                        : "hidden"
                    }  ${error.password ? "top-1/3" : "top-1/2"}`}
                  >
                    {isPasswordShow ? (
                      <FaEyeSlash
                        className={`${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      />
                    ) : (
                      <FaEye
                        className={` ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      />
                    )}
                  </div>
                </div>
                <div className="flex  justify-between items-center mt-2 text-sm">
                  <label
                    className={`flex items-center  ${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    <Input type="checkbox" className="mr-2" /> Remember me
                  </label>
                  <Link
                    to={"/forget-password"}
                    className="text-blue-500 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                {errorMessage && (
                  <p className="text-red-500 text-sm font-medium mt-1 py-2 col-span-2">
                    {errorMessage}
                  </p>
                )}
                <Button
                  btntext={"Log in"}
                  className="w-full mt-4  text-white py-2 rounded-md bg-gradient-to-r from-blue-500 to-purple-500"
                  onClick={handleSubmit}
                  icon={
                    isProcessing.form && (
                      <BiLoaderAlt className="animate-spin h-6 w-6" />
                    )
                  }
                  disabled={isProcessing.form}
                />

                <div className="text-center my-4 text-gray-500">
                  Or continue with
                </div>
                <Button
                  className={`w-full flex items-center justify-center gap-2 p-2 rounded-md ${
                    theme === "dark"
                      ? "bg-gray-700 text-white"
                      : "bg-gray-200 text-gray-900"
                  }`}
                  icon={
                    isProcessing.guestLogin ? (
                      <BiLoaderAlt className="animate-spin h-6 w-6" />
                    ) : (
                      ""
                    )
                  }
                  onClick={handleGuestLogin}
                  btntext={"Continue with Guest"}
                  disabled={isProcessing.guestLogin}
                />

                <Button
                  className={`w-full flex items-center justify-center gap-2 p-2 rounded-md ${
                    theme === "dark"
                      ? "bg-gray-700 text-white"
                      : "bg-gray-200 text-gray-900"
                  }`}
                  icon={
                    isProcessing.sellerLogin ? (
                      <BiLoaderAlt className="animate-spin h-6 w-6" />
                    ) : (
                      ""
                    )
                  }
                  onClick={handleSellerLogin}
                  btntext={"Continue with Seller"}
                  disabled={isProcessing.sellerLogin}
                />
                {/* <Button
              className={`w-full flex items-center justify-center gap-2 p-2 rounded-md ${
                theme === "dark"
                  ? "bg-gray-700 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
              icon={<FaGoogle />}
              btntext={"Continue with Google"}
            />

            <Button
              className={`w-full mt-2 flex items-center justify-center gap-2 p-2 rounded-md ${
                theme === "dark"
                  ? "bg-gray-700 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
              icon={<FaFacebook />}
              btntext={"Continue with Facebook"}
            /> */}
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

          <div
            className={`text-center mt-4  ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            } `}
          >
            Don't have an account?{" "}
            <Link className="text-blue-500 hover:underline" to={"/register"}>
              sign up
            </Link>
          </div>
        </div>
        {/* Theme Toggle Button */}
        <Button
          onClick={toggleTheme}
          className={`p-2 rounded-full z-10 bg-opacity-75 fixed shadow w-10 h-10 bottom-5 right-5 ${
            theme === "dark" ? "bg-gray-400" : "bg-gray-300"
          }`}
          icon={
            theme === "dark" ? (
              <FaSun className="text-white w-5 h-5 " />
            ) : (
              <FaMoon className="text-gray-800 w-5 h-5" />
            )
          }
        />
      </div>
    )
  );
};

export default Login;

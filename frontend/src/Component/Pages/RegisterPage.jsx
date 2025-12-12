import { useState, useEffect } from "react";
import { useTheme } from "../../Context/themeContext";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button, Input, OTPInput } from "../../LIBS";
import { FaMoon, FaSun } from "react-icons/fa6";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import { swalWithCustomConfiguration } from "../../utility/constant";
import axios from "axios";
import { BiLoaderAlt } from "react-icons/bi";
import { useAuth } from "../../Context/authContext";
const RegisterPage = ({ userDetail }) => {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { authToken, setAuthToken } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [step, setStep] = useState(1);
  // const [otp, setOtp] = useState("");
  const [error, setError] = useState({
    email: "",
    password: "",
    name: "",
    passsword: "",
    confirmPassword: "",
    phoneNumber: "",
    passwordValidation: "",
  });
  const [isPasswordShow, setIsPasswordShow] = useState({
    password: false,
    confirmPassword: false,
  });
  const redirect = new URLSearchParams(location?.search)?.get("redirect");
  const passwordToggle = (field) => {
    setIsPasswordShow((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };
  const checkValidation = () => {
    let errors = {};

    // Check required fields
    if (!formData.email) errors.email = "Email is required!";
    if (!formData.password) errors.password = "Password is required!";
    if (!formData.name) errors.name = "Name is required!";
    if (!formData.phoneNumber) errors.phoneNumber = "Mobile No is required!";
    if (!formData.confirmPassword)
      errors.confirmPassword = "Confirm Password is required!";
    if (formData.email && !emailRegex?.test(formData?.email))
      errors.email = "Email is Not Valid!";
    if (
      formData.phoneNumber &&
      (formData.phoneNumber?.length < 10 || formData.phoneNumber?.length > 10)
    )
      errors.phoneNumber = "Mobile No Must be 10 digit";
    // If any required field is missing, return early

    // Password length check for both password fields
    if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long!";
    }
    if (formData.confirmPassword.length < 6) {
      errors.confirmPassword =
        "Confirm Password must be at least 6 characters long!";
    }

    // Password match check
    if (formData.password !== formData.confirmPassword) {
      errors.passwordValidation =
        "Password and Confirm Password must be the same!";
    }

    // If there are errors, return false
    if (Object.keys(errors).length > 0) {
      setError(errors);
      return false;
    }

    // No errors, clear previous errors and return true
    setError({});
    return true;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const onOtpVerify = (otp) => {
    if (otp.length < 6) {
      setErrorMessage("OTP must be Six Digit");
      return;
    }
    setErrorMessage("");
    handleOtpVerification(otp);
  };
  const handleOtpVerification = (otp) => {
    setIsProcessing(true);
    axios({
      method: "post",
      url: `${SERVER_URL}/api/auth/email-verification`,
      data: {
        otp,
        email: formData?.email,
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
          setError(data?.message);
        }
      })
      .finally(() => {
        setIsProcessing(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValid = checkValidation();
    if (!isValid) return;
    handleRegisteration();
  };
  const handleRegisteration = () => {
    setIsProcessing(true);
    axios({
      method: "POST",
      url: `${SERVER_URL}/api/auth/register`,
      data: formData,
      headers: { "Content-Type": "application/json; charset=UTF-8" },
    })
      .then((response) => {
        const { status, data } = response;
        if (status === 200) {
          setMessage(data?.message);
          setErrorMessage("");
          setStep(2);
        }
      })
      .catch((error) => {
        console.log(error);
        const status = error?.response?.status;
        const { message = "" } = error?.response?.data || error;
        if (status === 400) {
          setErrorMessage(message);
          // swalWithCustomConfiguration?.fire(
          //   "Resgistration Failed!",
          //   error?.response?.data?.message,
          //   "warning"
          // );
        } else {
          setErrorMessage(message);
        }
      })
      .finally(() => {
        setIsProcessing(false);
      });
  };

  useEffect(() => {
    if (userDetail || authToken) {
      navigate("/");
    }
  });

  return (
    !authToken && (
      <div
        className={`flex items-center justify-center min-h-screen ${
          theme === "dark"
            ? "bg-gray-900 text-white"
            : "bg-gray-100 text-gray-900"
        }
        transition-all duration-300`}
      >
        <div
          className={`w-full max-w-md  p-8 rounded-lg mobile:mx-5 small-device:mx-0  shadow-lg transition-all duration-300 ${
            theme === "dark"
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-900"
          }
      `}
        >
          {/* Brand Name */}
          {/* <h2 className="text-center text-3xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
            Browse Mart
          </h2> */}
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
                Welcome
              </h3>
            </div>
          )}

          {/* Registration Form */}
          <form
            className=""
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            {step === 1 && (
              <div className="mt-4 flex flex-col gap-2">
                {/* Name */}
                <div className="flex flex-col gap-2">
                  {/* <label className="block text-sm font-medium">Email</label> */}
                  <Input
                    type="text"
                    name="name"
                    value={formData?.name}
                    onChange={handleChange}
                    required
                    className={`w-full p-2 rounded-md border-2  ${
                      theme === "dark"
                        ? "bg-gray-700 text-white border-gray-600 focus:border-gray-300"
                        : "text-gray-900 bg-gray-100 border-gray-300 focus:border-gray-600"
                    }`}
                    placeholder={"Name"}
                  />
                  {error.name && (
                    <p className="text-red-500 text-sm font-medium mt-1">
                      {error.name}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  {/* Email */}
                  <div className="flex flex-col gap-2 w-1/2">
                    {/* <label className="block text-sm font-medium">Email</label> */}
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`w-full p-2 rounded-md border-2  ${
                        theme === "dark"
                          ? "bg-gray-700 text-white border-gray-600 focus:border-gray-300"
                          : "text-gray-900 bg-gray-100 border-gray-300 focus:border-gray-600"
                      }`}
                      placeholder={"Email"}
                    />
                    {error.email && (
                      <p className="text-red-500 text-sm font-medium mt-1">
                        {error.email}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 w-1/2">
                    {/* <label className="block text-sm font-medium">Email</label> */}
                    <Input
                      type="number"
                      name="phoneNumber"
                      value={formData?.phoneNumber}
                      onChange={handleChange}
                      required
                      className={`w-full p-2 rounded-md border-2  ${
                        theme === "dark"
                          ? "bg-gray-700 text-white border-gray-600 focus:border-gray-300"
                          : "text-gray-900 bg-gray-100 border-gray-300 focus:border-gray-600"
                      }`}
                      placeholder={"Mobile No"}
                    />
                    {error.phoneNumber && (
                      <p className="text-red-500 text-sm font-medium mt-1">
                        {error.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>

                {/* Password */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-2 relative">
                    {/* <label className="block text-sm font-medium">Password</label> */}
                    <div className="w-full relative">
                      <Input
                        type={`${
                          isPasswordShow.password ? "text" : "password"
                        }`}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className={`w-full p-2 rounded-md border-2  ${
                          theme === "dark"
                            ? "bg-gray-700 text-white border-gray-600 focus:border-gray-300"
                            : "text-gray-900 bg-gray-100 border-gray-300 focus:border-gray-600"
                        }`}
                        placeholder={"Password"}
                      />

                      <div
                        onClick={() => passwordToggle("password")}
                        className={`hover:cursor-pointer absolute  right-3 top-1/2 -translate-y-1/2 ${
                          formData?.password
                            ? "flex items-center justify-center"
                            : "hidden"
                        } `}
                      >
                        {isPasswordShow.password ? (
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
                    {error.password && (
                      <p className="text-red-500 text-sm font-medium mt-1">
                        {error.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-2 relative">
                    <div className="w-full relative">
                      <Input
                        type={`${
                          isPasswordShow.confirmPassword ? "text" : "password"
                        }`}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className={`w-full p-2 rounded-md border-2  ${
                          theme === "dark"
                            ? "bg-gray-700 text-white border-gray-600 focus:border-gray-300"
                            : "text-gray-900 bg-gray-100 border-gray-300 focus:border-gray-600"
                        }`}
                        placeholder={"Comfirm Password"}
                      />

                      <div
                        onClick={() => passwordToggle("confirmPassword")}
                        className={`hover:cursor-pointer absolute top-1/2  right-3  -translate-y-1/2 ${
                          formData?.confirmPassword
                            ? "flex items-center justify-center"
                            : "hidden"
                        } `}
                      >
                        {isPasswordShow.confirmPassword ? (
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
                    {error.confirmPassword && (
                      <p className="text-red-500 text-sm font-medium mt-1">
                        {error.confirmPassword}
                      </p>
                    )}
                  </div>
                  {error.passwordValidation && (
                    <p className="text-red-500 text-sm font-medium mt-1 col-span-2">
                      {error.passwordValidation}
                    </p>
                  )}

                  {errorMessage && (
                    <p className="text-red-500 text-sm font-medium mt-1 col-span-2">
                      {errorMessage}
                    </p>
                  )}
                </div>
                <div></div>
                {/* Register Button */}
                <Button
                  btntext={`${isProcessing ? "Please Wait" : "Sign up"}`}
                  className="w-full mt-4  text-white py-2 rounded-md bg-gradient-to-r from-blue-500 to-purple-500"
                  onClick={handleSubmit}
                  icon={
                    isProcessing ? (
                      <BiLoaderAlt className="animate-spin h-6 w-6" />
                    ) : (
                      ""
                    )
                  }
                />
              </div>
            )}

            {step === 2 && (
              <OTPInput
                message={message}
                errorMessage={errorMessage}
                onOtpVerify={onOtpVerify}
                isProcessing={isProcessing}
              />
            )}
          </form>

          {/* Login Link */}

          <div
            className={`text-center mt-4  ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            } `}
          >
            Already have an account?{" "}
            <Link className="text-blue-500 hover:underline" to={"/login"}>
              Log in
            </Link>
          </div>
        </div>
        {/* THeme Toggle Button */}
        <Button
          onClick={toggleTheme}
          className={`p-2 rounded-full z-10 bg-opacity-75 fixed shadow w-10 h-10 bottom-5 right-5 ${
            theme === "dark" ? "bg-gray-400" : "bg-gray-300"
          }`}
          icon={
            theme === "dark" ? (
              <FaSun className="text-yellow-400 w-5 h-5 " />
            ) : (
              <FaMoon className="text-gray-800 w-5 h-5" />
            )
          }
        />
      </div>
    )
  );
};

export default RegisterPage;

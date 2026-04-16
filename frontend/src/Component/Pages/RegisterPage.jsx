import { useState, useEffect } from "react";
import { useTheme } from "../../Context/themeContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Input, OTPInput } from "../../LIBS";
import { FaMoon, FaSun } from "react-icons/fa6";
import { FaEyeSlash, FaEye } from "react-icons/fa";
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
        // const status = error?.response?.status;
        // if (status === 400) {
        setErrorMessage(data?.message);
        setError(data?.message);
        // }
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

  const onResendOTP = () => {
    // setIsProcessing(true);
    setErrorMessage("");
    setMessage("");

    axios({
      method: "POST",
      url: `${SERVER_URL}/api/auth/resend-otp`,
      data: { email: formData?.email },
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

  useEffect(() => {
    if (userDetail || authToken) {
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
                  ? "bg-gradient-to-br from-fuchsia-700 via-indigo-700 to-blue-700"
                  : "bg-gradient-to-br from-fuchsia-500 via-indigo-500 to-blue-500"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                New On Browse Mart
              </p>
              <h1 className="mt-6 text-4xl font-black leading-tight text-white">
                Create your account and start exploring.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/85">
                Register once and enjoy seamless checkout, wishlist tracking,
                and smart shopping updates.
              </p>
              <div className="mt-10 space-y-3 text-sm text-white/90">
                <p>1. Register with email and phone</p>
                <p>2. Verify OTP securely</p>
                <p>3. Start shopping instantly</p>
              </div>
            </div>

            <div className="p-6 mobile:p-5 tablet:p-8">
              <h2 className="text-3xl font-black tracking-tight">
                {step === 1 ? "Create Account" : "Verify OTP"}
              </h2>
              <p
                className={`mt-2 text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}
              >
                {step === 1
                  ? "Fill in your details to register your Browse Mart account."
                  : "Enter the code we sent to verify your email."}
              </p>

              <form
                className="mt-7"
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                {step === 1 && (
                  <div className="space-y-3">
                    <div>
                      <Input
                        type="text"
                        name="name"
                        value={formData?.name}
                        onChange={handleChange}
                        required
                        className={`w-full rounded-xl border-2 p-3 ${
                          theme === "dark"
                            ? "border-slate-700 bg-slate-800 text-white"
                            : "border-slate-300 bg-slate-50 text-slate-900"
                        }`}
                        placeholder="Full Name"
                      />
                      {error.name && (
                        <p className="mt-1 text-sm font-medium text-red-500">
                          {error.name}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-3 small-device:grid-cols-2">
                      <div>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className={`w-full rounded-xl border-2 p-3 ${
                            theme === "dark"
                              ? "border-slate-700 bg-slate-800 text-white"
                              : "border-slate-300 bg-slate-50 text-slate-900"
                          }`}
                          placeholder="Email"
                        />
                        {error.email && (
                          <p className="mt-1 text-sm font-medium text-red-500">
                            {error.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <Input
                          type="number"
                          name="phoneNumber"
                          value={formData?.phoneNumber}
                          onChange={handleChange}
                          required
                          className={`w-full rounded-xl border-2 p-3 ${
                            theme === "dark"
                              ? "border-slate-700 bg-slate-800 text-white"
                              : "border-slate-300 bg-slate-50 text-slate-900"
                          }`}
                          placeholder="Mobile Number"
                        />
                        {error.phoneNumber && (
                          <p className="mt-1 text-sm font-medium text-red-500">
                            {error.phoneNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-3 small-device:grid-cols-2">
                      <div className="relative">
                        <Input
                          type={isPasswordShow.password ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          className={`w-full rounded-xl border-2 p-3 pr-10 ${
                            theme === "dark"
                              ? "border-slate-700 bg-slate-800 text-white"
                              : "border-slate-300 bg-slate-50 text-slate-900"
                          }`}
                          placeholder="Password"
                        />
                        {formData?.password && (
                          <button
                            type="button"
                            onClick={() => passwordToggle("password")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                          >
                            {isPasswordShow.password ? (
                              <FaEyeSlash />
                            ) : (
                              <FaEye />
                            )}
                          </button>
                        )}
                        {error.password && (
                          <p className="mt-1 text-sm font-medium text-red-500">
                            {error.password}
                          </p>
                        )}
                      </div>

                      <div className="relative">
                        <Input
                          type={
                            isPasswordShow.confirmPassword ? "text" : "password"
                          }
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          className={`w-full rounded-xl border-2 p-3 pr-10 ${
                            theme === "dark"
                              ? "border-slate-700 bg-slate-800 text-white"
                              : "border-slate-300 bg-slate-50 text-slate-900"
                          }`}
                          placeholder="Confirm Password"
                        />
                        {formData?.confirmPassword && (
                          <button
                            type="button"
                            onClick={() => passwordToggle("confirmPassword")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                          >
                            {isPasswordShow.confirmPassword ? (
                              <FaEyeSlash />
                            ) : (
                              <FaEye />
                            )}
                          </button>
                        )}
                        {error.confirmPassword && (
                          <p className="mt-1 text-sm font-medium text-red-500">
                            {error.confirmPassword}
                          </p>
                        )}
                      </div>
                    </div>

                    {error.passwordValidation && (
                      <p className="text-sm font-medium text-red-500">
                        {error.passwordValidation}
                      </p>
                    )}

                    {errorMessage && (
                      <p className="text-sm font-medium text-red-500">
                        {errorMessage}
                      </p>
                    )}

                    <Button
                      btntext={
                        isProcessing ? "Please wait..." : "Create Account"
                      }
                      className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-white"
                      onClick={handleSubmit}
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

                {step === 2 && (
                  <OTPInput
                    message={message}
                    errorMessage={errorMessage}
                    onOtpVerify={onOtpVerify}
                    isProcessing={isProcessing}
                    onResendOTP={onResendOTP}
                  />
                )}
              </form>

              <p
                className={`mt-6 text-center text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}
              >
                Already have an account?{" "}
                <Link
                  className="font-semibold text-blue-500 hover:underline"
                  to="/login"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default RegisterPage;

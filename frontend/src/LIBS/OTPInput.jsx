import { useState, useEffect, useRef } from "react";
import { useTheme } from "../Context/themeContext";
import Button from "./Button";
import { BiLoaderAlt } from "react-icons/bi";
import Input from "./Input";

const OTPInput = ({
  length = 6,
  onOtpVerify = () => {},
  errorMessage = "",
  message = "",
  isProcessing = false,
  onResendOTP = () => {},
}) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);
  const { theme } = useTheme();
  const [timer, setTimer] = useState(60); // 30 seconds
  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  // Countdown timer effect
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval); // Cleanup on unmount
    } else {
      setIsResendDisabled(false); // Enable the resend button
    }
  }, [timer]);

  const handleResendOTP = () => {
    setOtp(new Array(length).fill("")); // Clear OTP inputs
    setTimer(60); // Reset timer to 60 seconds
    setIsResendDisabled(true); // Disable resend button
    onResendOTP(); // Call parent's resend function
  };

  return (
    <div
      className={`flex flex-col items-center justify-center w-full  p-4 ${
        theme === "dark" ? " text-white " : "text-gray-900 "
      }`}
    >
      <h2 className={`text-2xl font-semibold  mb-4 `}>Enter OTP</h2>

      <p
        className={`py-2 font-normal w-full font-roboto mobile:text-xs  tablet:text-base laptop:text-base`}
      >
        {message}
      </p>
      <div className="grid grid-cols-6 gap-2 mt-4 w-full">
        {otp.map((digit, index) => (
          <Input
            key={index}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            ref={(el) => (inputRefs.current[index] = el)}
            className={`w-full h-full  text-xl text-center border rounded-md  focus:ring-1  focus:scale-125 outline-none transition-all duration-500 ${
              theme === "dark"
                ? "bg-gray-700 ring-white text-white border-gray-600"
                : "text-gray-900 bg-gray-100 border-gray-300 ring-gray-800"
            }`}
          />
          // <input
          //   key={index}
          //   type="text"
          //   maxLength="1"
          //   value={digit}
          //   onChange={(e) => handleChange(index, e.target.value)}
          //   onKeyDown={(e) => handleKeyDown(index, e)}
          //   ref={(el) => (inputRefs.current[index] = el)}
          //   className={`w-12 h-12 text-xl text-center border rounded-md  focus:ring-2 focus:ring-blue-500 outline-none transition ${
          //     theme === "dark"
          //       ? "bg-gray-700 text-white border-gray-600"
          //       : "text-gray-900 bg-gray-100 border-gray-300"
          //   }`}
          // />
        ))}
      </div>
      <div className="flex items-center justify-center mt-4 w-full p-3 ">
        {errorMessage && (
          <span className="text-red-600  font-normal mobile:text-xs small-device:text-sm tablet:text-base laptop:text-lg ">
            {errorMessage}
          </span>
        )}

        {/* Resend OTP Section */}
        <div
          className={` font-roboto p-2 ml-auto ${
            theme === "dark" ? "text-gray-300" : "text-gray-600"
          }`}
        >
          {isResendDisabled ? (
            <p>
              Resend OTP in <span className="font-bold">{timer}s</span>
            </p>
          ) : (
            <Button
              className="text-blue-500 hover:underline"
              btntext="Resend OTP"
              onClick={handleResendOTP}
            />
            // <button
            //   // onClick={handleResendOTP}
            //   className="text-blue-500 hover:underline"
            // >
            //   Resend OTP
            // </button>
          )}
        </div>
      </div>
      <Button
        onClick={(e) => {
          e.preventDefault();
          typeof onOtpVerify === "function" && onOtpVerify(otp.join(""));
        }}
        icon={
          isProcessing ? <BiLoaderAlt className="animate-spin h-6 w-6" /> : ""
        }
        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        btntext={` ${isProcessing ? "Verifying" : "Verify OTP"}`}
        disabled={isProcessing}
      />
    </div>
  );
};

export default OTPInput;

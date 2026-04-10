import { useEffect, useRef, useState } from "react";
import Input from "../../../LIBS/Input";
import TextArea from "../../../LIBS/TextArea";
import Button from "../../../LIBS/Button";
import axios from "axios";
import ReviewStar from "./ReviewStar";
import { swalWithCustomConfiguration } from "../../../utility/constant";
import { useTheme } from "../../../Context/themeContext";
import { MdClose, MdRateReview } from "react-icons/md";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const ReviewForm = ({
  onClose,
  productId,
  setIsRefreshClicked,
  userDetail,
  authToken,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [reviewData, setReviewData] = useState({
    productId: productId,
    rating: "",
    title: "",
    message: "",
  });
  const [isReviewUploading, setIsReviewUploading] = useState(false);
  const [error, setError] = useState({
    isError: true,
    title: "",
    message: "",
  });

  const formRef = useRef();

  // for sending data to server
  const submitReview = () => {
    setIsReviewUploading(true);
    axios({
      method: "post",
      url: `${SERVER_URL}/api/product/submit-review`,
      data: reviewData,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((response) => {
        setIsReviewUploading(false);
        onClose();
        swalWithCustomConfiguration
          ?.fire({
            title: "Thankyou for your Review!",
            text: "Review submitted successfully",
            icon: "success",
          })
          .then(() => setIsRefreshClicked((prev) => !prev));
      })
      .catch((error) => {
        setIsReviewUploading(false);
        console.log(error);
        alert("Failed to submit review!");
      });
  };

  // handling Inputs
  const handleInput = (e) => {
    const { name, value } = e.target;
    setReviewData({ ...reviewData, [name]: value });
    if (value === undefined || value === "")
      setError({ ...error, [name]: `${[name]} is required`, isError: true });
    else setError({ ...error, [name]: "", isError: false });
  };

  // for handling Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(e.target);
    if (error.isError) return;
    submitReview();
  };

  // close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const isSubmitDisabled =
    !reviewData.rating ||
    !reviewData.title?.trim() ||
    !reviewData.message?.trim() ||
    error.title !== "" ||
    error.message !== "";

  return (
    /* Backdrop */
    <div className="w-screen h-screen fixed inset-0 z-50 flex justify-center items-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
    >
      {/* Modal Card */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={`
          relative w-full max-w-[480px] rounded-2xl shadow-2xl
          flex flex-col gap-5 p-6
          transition-all duration-300
          ${isDark
            ? "bg-gray-900 border border-gray-700"
            : "bg-white border border-gray-200"
          }
        `}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
              <MdRateReview className="text-xl" />
            </div>
            <div>
              <h2 className={`text-xl font-bold font-roboto leading-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                Write a Review
              </h2>
              <p className={`text-xs font-roboto ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Share your honest experience
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className={`
              p-2 rounded-full transition-all duration-200
              ${isDark
                ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                : "hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              }
            `}
            aria-label="Close review form"
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        {/* ── Divider ─────────────────────────────────────────────────── */}
        <div className={`border-t ${isDark ? "border-gray-700" : "border-gray-100"}`} />

        {/* ── Star Rating ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-1">
          <label className={`text-sm font-semibold font-roboto ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            Your Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex justify-center py-2">
            <ReviewStar
              setStarRating={setReviewData}
              rating={reviewData?.rating}
            />
          </div>
        </div>

        {/* ── Title Input ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="title"
            className={`text-sm font-semibold font-roboto ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            Review Title <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            className={`
              w-full min-h-[44px] px-4 py-2.5 rounded-xl border-2 outline-none
              font-roboto text-sm transition-all duration-200
              ${isDark
                ? "bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-indigo-500"
                : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white"
              }
            `}
            placeholder="Summarize your experience..."
            name="title"
            value={reviewData?.title}
            onChange={handleInput}
            id="title"
          />
          {error.title && (
            <p className="text-red-500 text-xs mt-0.5 font-roboto">{error.title}</p>
          )}
        </div>

        {/* ── Message Textarea ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="comment"
            className={`text-sm font-semibold font-roboto ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            Your Review <span className="text-red-500">*</span>
          </label>
          <TextArea
            id="comment"
            name="message"
            value={reviewData?.message}
            onChange={handleInput}
            placeholder="Tell others what you think about this product..."
            className={`
              resize-none w-full px-4 py-2.5 rounded-xl border-2 outline-none
              font-roboto text-sm transition-all duration-200
              ${isDark
                ? "bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-indigo-500"
                : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white"
              }
            `}
            rows="4"
            cols="50"
          />
          {error.message && (
            <p className="text-red-500 text-xs mt-0.5 font-roboto">{error.message}</p>
          )}
        </div>

        {/* ── Submit Button ────────────────────────────────────────────── */}
        <Button
          btntext={isReviewUploading ? "Submitting..." : "Submit Review"}
          className={`
            w-full py-3 rounded-xl font-roboto font-semibold text-base
            transition-all duration-200 text-white
            ${isSubmitDisabled
              ? "bg-indigo-300 cursor-not-allowed opacity-60"
              : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 hover:scale-[1.02] shadow-md hover:shadow-indigo-200"
            }
          `}
          disabled={isSubmitDisabled}
          loading={isReviewUploading}
        />

        {/* ── Footer Note ──────────────────────────────────────────────── */}
        <p className={`text-center text-xs font-roboto ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          Your review helps other shoppers make better decisions.
        </p>
      </form>
    </div>
  );
};

export default ReviewForm;

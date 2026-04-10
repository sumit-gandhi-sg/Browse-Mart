import React, { useState } from "react";
import { useTheme } from "../../Context/themeContext";

const StarRating = ({ rating, size = "sm" }) => {
  const starSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((index) => (
        <svg
          key={index}
          className={`${starSize} ${index <= rating ? "text-yellow-400" : "text-gray-300"}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
        </svg>
      ))}
    </div>
  );
};

const ReviewCard = ({ review }) => {
  const { rating, title, message, userName } = review;
  const [isExpened, setIsExpened] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const avatarInitial = userName?.charAt(0)?.toUpperCase() || "U";

  // Avatar background colors based on initial
  const avatarColors = [
    "bg-indigo-500", "bg-blue-500", "bg-purple-500",
    "bg-pink-500", "bg-teal-500", "bg-orange-500",
  ];
  const colorIndex = (avatarInitial.charCodeAt(0) || 0) % avatarColors.length;
  const avatarColor = avatarColors[colorIndex];

  return (
    <div
      className={`
        flex flex-col gap-3 p-4 rounded-2xl border shadow-sm
        min-w-[280px] max-w-[340px] w-full
        mobile:min-w-full mobile:max-w-full
        small-device:min-w-[280px] small-device:max-w-[340px]
        transition-all duration-200 hover:shadow-md
        ${isDark
          ? "bg-gray-800 border-gray-700 hover:border-indigo-500/50"
          : "bg-white border-gray-200 hover:border-indigo-300"
        }
      `}
    >
      {/* Header: Avatar + Name + Stars */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar Circle */}
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center
            text-white font-bold text-sm flex-shrink-0
            ${avatarColor}
          `}>
            {avatarInitial}
          </div>

          <div className="flex flex-col">
            <span className={`font-semibold text-sm font-roboto truncate max-w-[140px] ${isDark ? "text-white" : "text-gray-900"}`}>
              {userName?.toCapitalize() || "User"}
            </span>
            <StarRating rating={rating} size="sm" />
          </div>
        </div>

        {/* Rating Badge */}
        <div className={`
          flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold
          ${rating >= 4
            ? "bg-green-100 text-green-700"
            : rating >= 3
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }
        `}>
          <span>{rating}</span>
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
          </svg>
        </div>
      </div>

      {/* Review Title */}
      {title && (
        <p className={`font-semibold text-sm font-roboto truncate ${isDark ? "text-white" : "text-gray-900"}`}>
          {title}
        </p>
      )}

      {/* Review Message */}
      <p className={`text-sm font-roboto leading-relaxed ${isDark ? "text-gray-300" : "text-gray-600"}`}>
        {isExpened ? message : message?.toString()?.substring(0, 100)}
        {message?.length > 100 && (
          <span
            className="text-indigo-500 font-semibold cursor-pointer ml-1 hover:text-indigo-400 transition-colors"
            onClick={() => setIsExpened(!isExpened)}
          >
            {isExpened ? " Read Less" : " Read More"}
          </span>
        )}
      </p>
    </div>
  );
};

export default ReviewCard;

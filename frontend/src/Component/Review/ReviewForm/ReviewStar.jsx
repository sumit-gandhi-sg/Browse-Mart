import React, { useState } from "react";

const ReviewStar = ({ setStarRating, rating }) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleMouseOver = (rating) => {
    setHoveredRating(rating);
  };
  const handleClick = (index) => {
    setStarRating((prev) => ({
      ...prev,
      rating: index,
    }));
  };
  const handleMouseLeave = () => {
    setHoveredRating(0);
  };

  const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
  const activeRating = hoveredRating || rating;

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((index) => (
          <svg
            key={index}
            className={`w-10 h-10 cursor-pointer transition-all duration-150 drop-shadow-sm
              ${index <= activeRating
                ? "text-yellow-400 scale-110"
                : "text-gray-300 hover:text-yellow-300 hover:scale-110"
              }`}
            onMouseEnter={() => handleMouseOver(index)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(index)}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
          </svg>
        ))}
      </div>
      {/* Rating label */}
      <p className={`text-sm font-semibold font-roboto transition-all duration-150 h-5
        ${activeRating >= 4 ? "text-green-500" : activeRating >= 3 ? "text-yellow-500" : activeRating >= 1 ? "text-red-400" : "text-gray-400"}
      `}>
        {ratingLabels[activeRating] || "Tap a star to rate"}
      </p>
    </div>
  );
};

export default ReviewStar;

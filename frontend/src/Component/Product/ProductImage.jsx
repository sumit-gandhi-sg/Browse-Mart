import React, { useState } from "react";
import { useTheme } from "../../Context/themeContext";

const ProductImage = ({ productData }) => {
  const [imageIndex, setImageIndex] = useState(0);
  const { theme } = useTheme();

  const isDark = theme === "dark";

  return (
    <div className="img-container flex gap-3 m-4 p-4 w-1/3 mobile:w-full tablet:w-1/2 mobile:m-0 mobile:flex-col-reverse mobile:items-center small-device:flex-row tablet:flex-row">
      
      {/* Thumbnail Strip */}
      <div className="flex flex-col gap-2 overflow-y-auto items-start justify-start min-h-[400px] min-w-[72px] max-h-[480px] mobile:flex-row mobile:min-h-20 mobile:overflow-x-auto mobile:w-full mobile:max-h-24 small-device:w-max small-device:min-h-[400px] small-device:flex-col tablet:flex-col">
        {productData?.image?.map((img, index) => (
          <div
            key={index}
            onClick={() => setImageIndex(index)}
            className={`
              relative cursor-pointer rounded-lg overflow-hidden
              min-h-[60px] min-w-[60px] h-[64px] w-[64px]
              mobile:max-w-[60px] mobile:max-h-[60px]
              border-2 transition-all duration-200
              ${imageIndex === index
                ? "border-indigo-500 ring-2 ring-indigo-300 shadow-md"
                : isDark
                  ? "border-gray-600 hover:border-indigo-400"
                  : "border-gray-300 hover:border-indigo-300"
              }
            `}
          >
            <img
              src={img}
              className="object-cover w-full h-full transition-transform duration-200 hover:scale-110"
              alt={`${productData?.name} view ${index + 1}`}
            />
            {imageIndex === index && (
              <div className="absolute inset-0 bg-indigo-500/10 pointer-events-none" />
            )}
          </div>
        ))}
      </div>

      {/* Main Image with Zoom */}
      <div className={`
        relative overflow-hidden rounded-2xl flex-1
        border-2 
        ${isDark ? "border-gray-700" : "border-gray-200"}
        shadow-lg max-h-[480px]
        group
      `}>
        <img
          src={productData?.image?.[imageIndex]}
          className="w-full h-full object-cover object-top aspect-square max-h-[480px] transition-transform duration-500 ease-out group-hover:scale-110"
          alt={productData?.name}
        />
        {/* Image count badge */}
        {productData?.image?.length > 1 && (
          <div className={`
            absolute bottom-3 right-3 text-xs font-semibold px-2 py-1 rounded-full
            ${isDark ? "bg-gray-800/80 text-gray-200" : "bg-white/80 text-gray-700"}
            backdrop-blur-sm shadow
          `}>
            {imageIndex + 1} / {productData?.image?.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImage;

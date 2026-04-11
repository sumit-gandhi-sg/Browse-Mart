import React, { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight, FiTrash2 } from "react-icons/fi";

const ImagePreview = ({ image, onRemove }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = (e) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : image.length - 1));
  };

  const handleNext = (e) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev + 1) % image.length);
  };

  if (!image || image.length === 0) return null;

  const safeIndex = currentIndex >= image.length ? Math.max(0, image.length - 1) : currentIndex;

  const handleDelete = (e) => {
    e.preventDefault();
    if (onRemove) {
      onRemove(safeIndex);
      // Automatically adjust index backwards if we delete the last item
      if (safeIndex >= image.length - 1) {
        setCurrentIndex(Math.max(0, image.length - 2));
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 bg-white dark:bg-gray-900 rounded-xl">
      {/* Main Large Preview Area */}
      <div className="relative w-full h-[280px] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-inner group border border-gray-200 dark:border-gray-700">
        <img
          src={URL.createObjectURL(image[safeIndex])}
          className="w-full h-full object-contain transition-transform duration-300"
          alt="Product Preview"
        />

        {/* Delete Button overlaid top-left */}
        <button
          onClick={handleDelete}
          title="Remove this image"
          className="absolute top-3 left-3 bg-red-500/90 text-white p-2 rounded-lg shadow-md backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-105 active:scale-95"
        >
          <FiTrash2 size={18} />
        </button>

        {/* Carousel Overlay Nav - Only show if > 1 image */}
        {image.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              disabled={safeIndex === 0}
              className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full backdrop-blur-md shadow-md transition-all ${
                safeIndex === 0
                  ? "bg-white/40 text-gray-400 cursor-not-allowed hidden"
                  : "bg-white/80 text-gray-800 hover:bg-white hover:scale-110 active:scale-95"
              }`}
            >
              <FiChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              disabled={safeIndex === image.length - 1}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full backdrop-blur-md shadow-md transition-all ${
                safeIndex === image.length - 1
                  ? "bg-white/40 text-gray-400 cursor-not-allowed hidden"
                  : "bg-white/80 text-gray-800 hover:bg-white hover:scale-110 active:scale-95"
              }`}
            >
              <FiChevronRight size={24} />
            </button>
            
            {/* Image Counter Badge */}
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold tracking-widest px-3 py-1 rounded-full shadow-lg">
               {safeIndex + 1} / {image.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {image.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 fancy-scroll px-1">
          {image.map((file, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setCurrentIndex(idx);
              }}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                safeIndex === idx
                  ? "border-purple-600 shadow-[0_0_0_2px_rgba(147,51,234,0.3)] scale-105"
                  : "border-transparent opacity-60 hover:opacity-100 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <img
                src={URL.createObjectURL(file)}
                alt={`Thumbnail ${idx}`}
                className="w-full h-full object-cover"
              />
              <div
                className={`absolute inset-0 bg-purple-600/20 pointer-events-none transition-opacity ${
                  safeIndex === idx ? "opacity-100" : "opacity-0"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImagePreview;

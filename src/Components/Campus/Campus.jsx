import React, { useState } from "react";
import gallery_1 from "../../assets/gallery_1.png";
import gallery_2 from "../../assets/gallery_2.png";
import gallery_3 from "../../assets/gallery_3.png";
import gallery_4 from "../../assets/gallery_4.png";

const images = [gallery_1, gallery_2, gallery_3, gallery_4];

const Campus = () => {
  const [loaded, setLoaded] = useState(
    Array(images.length).fill(false)
  );

  const handleImageLoad = (index) => {
    setLoaded((prev) => {
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });
  };

  return (
    <div className="max-w-7xl mx-auto my-20 px-4 text-center">
      {/* Title */}
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Galeri Kegiatan
      </h2>
      <p className="text-gray-600 mb-10 text-sm md:text-base">
        Dokumentasi kegiatan belajar, mengaji, dan kebersamaan santri Daarul
        Qira’ah
      </p>

      {/* Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {images.map((img, index) => (
          <div
            key={index}
            className="relative h-56 rounded-xl overflow-hidden shadow-md"
          >
            {/* Skeleton */}
            {!loaded[index] && (
              <div className="absolute inset-0 animate-pulse bg-gray-200">
                <div className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
              </div>
            )}

            {/* Image */}
            <img
              src={img}
              alt={`Galeri ${index + 1}`}
              onLoad={() => handleImageLoad(index)}
              className={`w-full h-full object-cover transition-all duration-500
                ${loaded[index] ? "opacity-100 scale-100" : "opacity-0 scale-105"}
              `}
            />

            {/* Overlay */}
            <div
              className="absolute inset-0 bg-blue-900/30 opacity-0 
              hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Campus;

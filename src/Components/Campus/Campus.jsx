import React from "react";
import gallery_1 from "../../assets/gallery_1.png";
import gallery_2 from "../../assets/gallery_2.png";
import gallery_3 from "../../assets/gallery_3.png";
import gallery_4 from "../../assets/gallery_4.png";
import white_arrow from "../../assets/white-arrow.png";

const Campus = () => {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[gallery_1, gallery_2, gallery_3, gallery_4].map((img, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-xl shadow-md group"
          >
            <img
              src={img}
              alt={`Galeri ${index + 1}`}
              className="w-full h-56 object-cover 
              transform group-hover:scale-110 
              transition-transform duration-500"
            />

            {/* Overlay */}
            <div
              className="absolute inset-0 bg-blue-900/30 opacity-0 
              group-hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Campus;

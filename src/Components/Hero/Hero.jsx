import React from "react";
import { useNavigate } from "react-router-dom";
import hero_bg from "../../assets/hero1.jpg";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundImage: `linear-gradient(rgba(8,0,58,0.7), rgba(8,0,58,0.7)), url(${hero_bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Content */}
      <div className="text-center max-w-3xl text-white">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
          Belajar Al-Qur’an <br className="hidden sm:block" />
          Jadi Lebih Seru & Bermakna
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-gray-200 mb-8 leading-relaxed">
          Yuk mulai perjalanan ngaji dan hafalan bersama Daarul Qira’ah.
          Dibimbing oleh pengajar yang ramah dan berpengalaman, dengan suasana
          belajar yang nyaman, ringan, dan penuh keberkahan.
        </p>

        <button
          onClick={() => navigate("/tahfidz")}
          className="inline-flex items-center gap-2 
          bg-blue-600 hover:bg-blue-700 
          text-white font-semibold 
          px-6 py-3 rounded-full
          transition-all duration-300
          shadow-lg hover:shadow-xl
          focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Mulai Sekarang
          <span className="text-lg">→</span>
        </button>
      </div>
    </div>
  );
};

export default Hero;

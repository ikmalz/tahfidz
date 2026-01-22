import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import hero_bg from "../../assets/hero1.jpg";
import logo from "../../assets/logo1.jpg";

const Hero = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth - 0.5) * 15;
    const y = (clientY / window.innerHeight - 0.5) * 15;

    heroRef.current.style.transform = `rotateX(${-y}deg) rotateY(${x}deg)`;
  };

  function Counter({ label, value }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let start = 0;
      const interval = setInterval(() => {
        start += Math.ceil(value / 40);
        if (start >= value) {
          start = value;
          clearInterval(interval);
        }
        setCount(start);
      }, 40);

      return () => clearInterval(interval);
    }, [value]);

    return (
      <div className="text-center">
        <p className="text-3xl font-bold text-blue-200">{count}+</p>
        <p className="text-sm text-gray-300">{label}</p>
      </div>
    );
  }

  return (
    <>
      <div
        className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden"
        onMouseMove={handleMouseMove}
        style={{
          backgroundImage: `linear-gradient(rgba(8,0,58,0.8), rgba(8,0,58,0.8)), url(${hero_bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* BULAN SABIT REALISTIS PARALLAX */}
        <div
          className="absolute top-14 left-8 xl:left-24 z-20 pointer-events-none animate-moonFloat"
          style={{
            transform: `translateY(${scrollY * 0.05}px)`,
          }}
        >
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-white/30 blur-2xl scale-110"></div>

            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-white via-gray-100 to-gray-300 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-4 w-full h-full rounded-full bg-blue-900"></div>
            </div>
          </div>
        </div>

        {/* BINTANG HALUS */}
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className="absolute w-1.5 h-1.5 bg-white/80 rounded-full animate-starTwinkle"
            style={{
              top: `${20 + Math.random() * 80}px`,
              left: `${20 + Math.random() * 120}px`,
              animationDelay: `${i * 1.2}s`,
            }}
          ></span>
        ))}

        <div className="absolute top-40 left-10 w-48 h-48 bg-blue-500/30 rounded-full blur-3xl animate-floatSlow hidden md:block"></div>

        <div className="absolute bottom-32 right-10 w-56 h-56 bg-blue-300/30 rounded-full blur-3xl animate-floatSlow2 hidden md:block"></div>

        {/* CONTENT WRAPPER (3D) */}
        <div
          ref={heroRef}
          className="relative z-10 text-center max-w-3xl text-white transition-transform duration-300"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* LOGO FLOAT */}
          <img
            src={logo}
            alt="Logo"
            className="w-24 h-24 mx-auto mb-6 rounded-full shadow-xl animate-floatLogo"
          />

          {/* TITLE */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-slideUp">
            Belajar Al-Qur’an <br className="hidden sm:block" />
            <span className="text-blue-300">Lebih Mudah</span> & Bermakna
          </h1>

          {/* DESC */}
          <p className="text-sm sm:text-base md:text-lg text-gray-200 mb-8 leading-relaxed animate-fadeUp delay-1">
            Bersama{" "}
            <span className="font-semibold text-white">Daarul Qira’ah</span>,
            wujudkan generasi Qur’ani dengan metode modern, suasana nyaman, dan
            penuh keberkahan.
          </p>

          {/* BUTTON */}
          <button
            onClick={() => navigate("/tahfidz")}
            className="
              inline-flex items-center gap-2
              bg-blue-600 hover:bg-blue-700 
              text-white font-semibold 
              px-7 py-3 rounded-full
              transition-all duration-300
              shadow-lg hover:shadow-2xl
              transform hover:-translate-y-1 hover:scale-105
              animate-fadeUp delay-2
            "
          >
            Mulai Sekarang
            <span className="text-lg">→</span>
          </button>

          {/* COUNTER */}
          {/* <div className="mt-10 flex justify-center gap-8 text-white">
            <Counter label="Santri Aktif" value={128} />
            <Counter label="Guru Pembimbing" value={12} />
            <Counter label="Juz Dihafal" value={245} />
          </div> */}

          {/* QUOTE */}
          <p className="mt-6 text-sm md:text-base text-gray-200 italic animate-fadeUp delay-3">
            “Sebaik-baik kalian adalah yang belajar Al-Qur’an dan
            mengajarkannya”
            <br />
            <span className="text-xs opacity-70">(HR. Bukhari)</span>
          </p>
        </div>
      </div>

      {/* SILUET MASJID */}
      <div
        className="absolute -bottom-14 left-0 w-full h-40 bg-gradient-to-t from-blue-900/90 to-transparent pointer-events-none animate-mosqueRise"
        style={{
          transform: `translateY(${Math.min(scrollY * 0.1, 40)}px)`,
        }}
      >
        <img
          src="/mosque-silhouette.png"
          alt="mosque"
          className="w-full h-full object-cover opacity-40"
        />
      </div>

      {/* CSS */}
      <style jsx>{`
        @keyframes mosqueRise {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-mosqueRise {
          animation: mosqueRise 1.5s ease-out;
        }

        /* BULAN FLOAT */
        @keyframes moonFloat {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-25px) rotate(2deg);
          }
          100% {
            transform: translateY(0) rotate(0deg);
          }
        }

        .animate-moonFloat {
          animation: moonFloat 12s ease-in-out infinite;
        }

        @keyframes starTwinkle {
          0% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
          100% {
            opacity: 0.2;
            transform: scale(0.8);
          }
        }

        .animate-starTwinkle {
          animation: starTwinkle 4s ease-in-out infinite;
        }

        @keyframes floatSlow {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-40px);
          }
          100% {
            transform: translateY(0);
          }
        }

        @keyframes floatSlow2 {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(30px);
          }
          100% {
            transform: translateY(0);
          }
        }

        @keyframes floatLogo {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
          100% {
            transform: translateY(0);
          }
        }

        .animate-floatSlow {
          animation: floatSlow 7s ease-in-out infinite;
        }

        .animate-floatSlow2 {
          animation: floatSlow2 9s ease-in-out infinite;
        }

        .animate-floatLogo {
          animation: floatLogo 4s ease-in-out infinite;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 1s ease-out forwards;
        }

        .animate-fadeUp {
          opacity: 0;
          animation: fadeUp 1s ease-out forwards;
        }

        .delay-1 {
          animation-delay: 0.4s;
        }
        .delay-2 {
          animation-delay: 0.8s;
        }
        .delay-3 {
          animation-delay: 1.2s;
        }
      `}</style>
    </>
  );
};

export default Hero;

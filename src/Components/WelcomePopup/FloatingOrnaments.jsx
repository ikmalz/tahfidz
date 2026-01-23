import React, { useEffect, useState } from "react";
import { BookOpen, User, Calendar, Star } from "lucide-react";

export default function FloatingOrnaments() {
  const [scrollY, setScrollY] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [showMobileBar, setShowMobileBar] = useState(false);
  const [manualClose, setManualClose] = useState(false);

  const texts = [
    {
      title: "Motivasi Qur’ani",
      text: "“Dan sesungguhnya Al-Qur’an itu benar-benar petunjuk dan rahmat”",
      ref: "QS. An-Nahl : 89",
    },
    {
      title: "Keutamaan Ilmu",
      text: "“Allah akan mengangkat derajat orang-orang yang berilmu”",
      ref: "QS. Al-Mujadilah : 11",
    },
    {
      title: "Amalan Terbaik",
      text: "“Sebaik-baik kalian adalah yang belajar dan mengajarkan Al-Qur’an”",
      ref: "HR. Bukhari",
    },
  ];

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!manualClose) {
        setShowMobileBar(true);

        setTimeout(() => {
          setShowMobileBar(false);
        }, 6000);
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [manualClose]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % texts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div
        className="fixed z-40 hidden xl:flex flex-col gap-6 pointer-events-none"
        style={{
          top: "30%",
          left: "16px",
          transform: `translateY(${scrollY * 0.08}px)`,
        }}
      >
        <SideCard
          icon={<BookOpen className="text-blue-600" size={26} />}
          title="Tahfidz"
          subtitle="Hafalan Harian"
          animation="animate-floatSoft"
        />
        <SideCard
          icon={<User className="text-blue-600" size={26} />}
          title="Guru"
          subtitle="Pembimbing Aktif"
          animation="animate-slideSoft"
        />
        <SideCard
          icon={<Calendar className="text-blue-600" size={26} />}
          title="Jadwal"
          subtitle="Setoran & Murajaah"
          animation="animate-pulseSoft"
        />
      </div>

      {/* ================= KANAN ================= */}
      <div
        className="fixed z-40 hidden xl:flex flex-col gap-6 pointer-events-none"
        style={{
          top: "30%",
          right: "16px",
          transform: `translateY(-${scrollY * 0.06}px)`,
        }}
      >
        <div className="bg-blue-700 text-white rounded-xl shadow-xl px-5 py-4 w-64 border border-blue-300 animate-fadeSwap">
          <p className="text-xs opacity-80 mb-1">{texts[textIndex].title}</p>
          <p className="text-sm font-medium leading-relaxed transition-all duration-500">
            {texts[textIndex].text}
          </p>
          <p className="text-[11px] mt-2 opacity-70">{texts[textIndex].ref}</p>
        </div>

        {/* STATUS PANEL */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg px-5 py-4 w-64 border border-blue-100 animate-floatReverse">
          <p className="text-sm font-semibold text-blue-900 mb-1 flex items-center gap-1">
            <Star size={14} className="text-yellow-500" />
            Sistem Tahfidz
          </p>
          <p className="text-xs text-gray-600">
            Monitoring hafalan, murajaah, dan perkembangan santri secara
            realtime
          </p>
        </div>
      </div>

      {/* ================= MOBILE / TABLET TOP FLOATING SKY ================= */}
      <div
        className="fixed top-16 left-1/2 -translate-x-1/2 z-30 xl:hidden w-full max-w-lg pointer-events-none"
        style={{
          transform: `translate(-50%, ${scrollY * 0.03}px)`,
        }}
      >
        <div className="flex justify-center gap-6 animate-driftSlow">
          <SkyBadge
            icon={<BookOpen size={18} />}
            text="Hafalan"
            delay="delay-1"
          />

          <SkyBadge
            icon={<Calendar size={18} />}
            text="Setoran"
            delay="delay-2"
          />

          <SkyBadge icon={<Star size={18} />} text="Motivasi" delay="delay-3" />
        </div>
      </div>

      {showMobileBar && (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 xl:hidden w-[95%] max-w-md animate-mobileEnter">
          <div className="relative bg-blue-700/95 backdrop-blur-md rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-4">
            {/* CLOSE BUTTON */}
            <button
              onClick={() => {
                setShowMobileBar(false);
                setManualClose(true);

                // Boleh muncul lagi setelah 1 menit
                setTimeout(() => setManualClose(false), 60000);
              }}
              className="absolute -top-2 -right-2 bg-white text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow hover:scale-110 transition"
            >
              ✕
            </button>

            {/* ICON */}
            <div className="bg-white/20 p-2 rounded-full animate-pulse">
              {textIndex === 0 && <BookOpen size={20} className="text-white" />}
              {textIndex === 1 && <User size={20} className="text-white" />}
              {textIndex === 2 && <Star size={20} className="text-white" />}
            </div>

            {/* TEXT — TIDAK DIPOTONG */}
            <div className="flex-1">
              <p className="text-xs text-blue-200">{texts[textIndex].title}</p>
              <p className="text-sm font-medium text-white leading-relaxed animate-textFade">
                {texts[textIndex].text}
              </p>
              <p className="text-[10px] text-blue-200 mt-0.5">
                {texts[textIndex].ref}
              </p>
            </div>

            {/* STATUS */}
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-white">Live</span>
            </div>
          </div>
        </div>
      )}

      {/* CSS */}
      <style jsx>{`
        /* MOBILE ENTER */
        @keyframes mobileEnter {
          from {
            opacity: 0;
            transform: translate(-50%, 60px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        /* MOBILE EXIT */
        @keyframes mobileExit {
          from {
            opacity: 1;
            transform: translate(-50%, 0);
          }
          to {
            opacity: 0;
            transform: translate(-50%, -40px);
          }
        }

        .animate-mobileEnter {
          animation: mobileEnter 0.8s ease-out;
        }

        /* FLOAT SOFT */
        @keyframes floatSoft {
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

        /* SLIDE SOFT */
        @keyframes slideSoft {
          0% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(8px);
          }
          100% {
            transform: translateX(0);
          }
        }

        /* PULSE */
        @keyframes pulseSoft {
          0% {
            box-shadow: 0 0 0 rgba(37, 99, 235, 0.2);
          }
          50% {
            box-shadow: 0 0 25px rgba(37, 99, 235, 0.4);
          }
          100% {
            box-shadow: 0 0 0 rgba(37, 99, 235, 0.2);
          }
        }

        /* FADE SWAP */
        @keyframes fadeSwap {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* REVERSE FLOAT */
        @keyframes floatReverse {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(12px);
          }
          100% {
            transform: translateY(0);
          }
        }

        .animate-floatSoft {
          animation: floatSoft 6s ease-in-out infinite;
        }

        .animate-slideSoft {
          animation: slideSoft 5s ease-in-out infinite;
        }

        .animate-pulseSoft {
          animation: pulseSoft 4s ease-in-out infinite;
        }

        .animate-fadeSwap {
          animation: fadeSwap 0.8s ease-out;
        }

        .animate-floatReverse {
          animation: floatReverse 7s ease-in-out infinite;
        }

        /* MOBILE BAR SLIDE */
        @keyframes slideUpSoft {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* TEXT FADE */
        @keyframes textFade {
          0% {
            opacity: 0;
            transform: translateY(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUpSoft {
          animation: slideUpSoft 0.8s ease-out;
        }

        .animate-textFade {
          animation: textFade 0.6s ease-out;
        }

        /* SKY FLOAT */
        @keyframes skyFloat {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          20% {
            opacity: 1;
          }
          50% {
            transform: translateY(6px);
          }
          100% {
            transform: translateY(-10px);
          }
        }

        /* DRIFT CONTAINER */
        @keyframes driftSlow {
          0% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(15px);
          }
          100% {
            transform: translateX(0);
          }
        }

        .animate-skyFloat {
          animation: skyFloat 6s ease-in-out infinite;
        }

        .animate-driftSlow {
          animation: driftSlow 12s ease-in-out infinite;
        }

        .delay-1 {
          animation-delay: 0s;
        }

        .delay-2 {
          animation-delay: 1.5s;
        }

        .delay-3 {
          animation-delay: 3s;
        }
      `}</style>
    </>
  );
}

/* ================= COMPONENT BANTUAN ================= */
function SkyBadge({ icon, text, delay }) {
  return (
    <div
      className={`
        flex items-center gap-2
        bg-white/70 backdrop-blur-md
        px-3 py-1.5 rounded-full
        shadow-md border border-blue-100
        text-blue-800 text-xs font-medium
        animate-skyFloat ${delay}
      `}
    >
      {icon}
      <span>{text}</span>
    </div>
  );
}

function SideCard({ icon, title, subtitle, animation }) {
  return (
    <div
      className={`
        group
        flex items-center gap-3
        bg-white/85 backdrop-blur-md
        shadow-lg rounded-xl px-4 py-3 w-56
        border border-blue-100
        transition-all duration-300
        hover:shadow-2xl hover:-translate-y-1
        hover:rotate-x-3 hover:rotate-y-3
        ${animation}
      `}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      <div className="group-hover:scale-110 transition">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-blue-900">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

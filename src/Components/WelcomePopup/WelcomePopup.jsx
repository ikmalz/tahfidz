import React, { useEffect, useState } from "react";
import logo from "../../assets/logo1.jpg";

export default function WelcomePopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-popup">
        <img
          src={logo}
          alt="Logo"
          className="w-24 h-24 mx-auto mb-4 rounded-full shadow-lg"
        />

        <h2 className="text-xl font-bold text-blue-900 mb-2">Selamat Datang</h2>

        <p className="text-sm text-gray-600 mb-6">
          Di sistem tahfidz Daarul Qira’ah
          <br />
          Mari mulai perjalanan Qur’ani bersama kami 🤍
        </p>

        <button
          onClick={() => setShow(false)}
          className="px-6 py-2 bg-blue-700 text-white rounded-full hover:bg-blue-600 transition"
        >
          Masuk
        </button>
      </div>

      <style jsx>{`
        @keyframes popup {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-popup {
          animation: popup 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

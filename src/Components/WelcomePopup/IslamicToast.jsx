import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";

export default function IslamicToast() {
  const messages = [
    "✨ Jangan lupa murojaah hari ini",
    "📖 1 ayat hari ini lebih baik dari 0",
    "🤍 Allah mencintai orang yang istiqomah",
    "🌙 Malam ini waktu terbaik menghafal",
  ];

  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState("");
  const [manualClose, setManualClose] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!manualClose) {
        const random = messages[Math.floor(Math.random() * messages.length)];
        setMsg(random);
        setShow(true);

        setTimeout(() => setShow(false), 4000);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [manualClose]);

  if (!show) return null;

  return (
    <>
      <div className="fixed top-20 right-4 z-50 animate-toastSlide">
        <div className="relative bg-white shadow-xl rounded-xl px-4 py-3 flex items-center gap-3 border border-blue-100">
          <button
            onClick={() => {
              setShow(false);
              setManualClose(true);

              setTimeout(() => setManualClose(false), 40000);
            }}
            className="absolute -top-2 -right-2 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow hover:scale-110 transition"
          >
            ✕
          </button>

          <Bell className="text-blue-600" size={20} />
          <p className="text-sm text-gray-700">{msg}</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes toastSlide {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-toastSlide {
          animation: toastSlide 0.6s ease-out;
        }
      `}</style>
    </>
  );
}

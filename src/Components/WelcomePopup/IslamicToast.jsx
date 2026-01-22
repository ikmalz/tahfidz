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

  useEffect(() => {
    const interval = setInterval(() => {
      const random = messages[Math.floor(Math.random() * messages.length)];
      setMsg(random);
      setShow(true);

      setTimeout(() => setShow(false), 4000);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  if (!show) return null;

  return (
    <>
      <div className="fixed top-20 right-4 z-50 animate-toastSlide">
        <div className="bg-white shadow-xl rounded-xl px-4 py-3 flex items-center gap-3 border border-blue-100">
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

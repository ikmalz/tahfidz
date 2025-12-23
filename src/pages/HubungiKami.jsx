import React from "react";
import { MessageCircle } from "lucide-react";

export default function HubungiKami() {
  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      "Assalamu’alaikum, saya ingin bertanya tentang program yang tersedia."
    );

    window.open(
      "https://wa.me/6281283404611?text=" + message,
      "_blank"
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Hubungi Kami
        </h1>
        <p className="text-gray-500 mt-2 text-sm md:text-base">
          Kami siap membantu Ayah & Bunda kapan saja
        </p>
      </div>

      {/* CARD */}
      <div className="bg-white rounded-2xl shadow-md p-6 md:p-10 space-y-6">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">📞 Kontak Resmi</h3>
          <p className="text-sm text-gray-600">
            Silakan hubungi kami melalui WhatsApp untuk informasi program,
            pendaftaran, atau konsultasi.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 border rounded-lg p-4">
            <p className="text-sm text-gray-500">Admin Tahfidz</p>
            <p className="font-medium">+62 812-8340-4611</p>
            <p className="text-xs text-gray-400 mt-1">
              Jam layanan: 08.00 - 20.00 WIB
            </p>
          </div>

          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-medium transition"
          >
            <MessageCircle size={20} />
            Chat via WhatsApp
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center">
          Respon cepat & ramah untuk Ayah, Bunda, dan Santri 😊
        </p>
      </div>
    </div>
  );
}

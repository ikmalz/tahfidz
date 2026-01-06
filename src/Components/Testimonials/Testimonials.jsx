import React from "react";
import user_1 from "../../assets/user-1.png";
import user_2 from "../../assets/user-2.png";
import user_3 from "../../assets/user-3.png";

const testimonials = [
  {
    name: "Ikmal Fairuz",
    location: "Depok",
    image: user_1,
    message:
      "Alhamdulillah, belajar mengaji di Daarul Qira’ah sangat nyaman. Ustadznya sabar dan metode belajarnya mudah dipahami, jadi makin semangat murojaah setiap hari.",
  },
  {
    name: "Ahmad Fauzi",
    location: "Bogor",
    image: user_2,
    message:
      "Awalnya saya kesulitan mengatur hafalan, tapi setelah ikut Daarul Qira’ah, hafalan jadi lebih terarah dan terjaga. Lingkungannya juga sangat mendukung.",
  },
  {
    name: "Siti Aisyah",
    location: "Jakarta",
    image: user_3,
    message:
      "Pengajian di Daarul Qira’ah terasa hangat dan kekeluargaan. Anak saya jadi lebih rajin mengaji dan percaya diri saat setor hafalan.",
  },
];

const Testimonials = () => {
  return (
    <div className="max-w-7xl mx-auto my-20 px-4">
      {/* Heading */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Apa Kata Santri & Wali Santri
        </h2>
        <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
          Testimoni dari mereka yang telah merasakan langsung proses belajar dan
          mengaji di Daarul Qira’ah
        </p>
      </div>

      {/* Testimonial Cards */}
      <div
        className="
          flex gap-6 overflow-x-auto pb-4
          md:grid md:grid-cols-3 md:overflow-visible
        "
      >
        {testimonials.map((item, index) => (
          <div
            key={index}
            className="
              min-w-[280px] md:min-w-0
              bg-white rounded-xl shadow-md
              p-6 transition-all duration-300
              hover:shadow-lg hover:-translate-y-1
            "
          >
            {/* User */}
            <div className="flex items-center gap-4 mb-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-14 h-14 rounded-full border-4 border-blue-900 object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-900">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {item.location}
                </p>
              </div>
            </div>

            {/* Message */}
            <p className="text-gray-600 text-sm leading-relaxed">
              “{item.message}”
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;

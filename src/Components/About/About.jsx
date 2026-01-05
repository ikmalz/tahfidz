import React from "react";
import about_img from "../../assets/about.png";
import play_icon from "../../assets/play-icon.png";

const About = () => {
  return (
    <div className="max-w-7xl mx-auto my-20 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="w-full md:w-2/5 relative">
          <img
            src={about_img}
            alt="University"
            className="w-full rounded-xl shadow-lg"
          />
          <img
            src={play_icon}
            alt="Play video"
            className="w-14 md:w-16 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform duration-300"
          />
        </div>

        {/* Right Section - Content */}
        <div className="w-full md:w-3/5">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">
            TENTANG KAMI
          </h3>
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6 max-w-md">
            Daarul Qira&apos;ah
            <br />
            Rumah Qur&apos;an untuk Generasi Berakhlak
          </h2>

          <div className="space-y-4 text-gray-600">
            <p className="leading-relaxed text-justify">
              <b>Daarul Qira&apos;ah</b> adalah lembaga pengajian Al-Qur&apos;an
              yang berfokus pada pembinaan hafalan, bacaan, dan akhlak santri
              berdasarkan nilai-nilai Islam. Kami berkomitmen untuk menghadirkan
              lingkungan belajar yang nyaman, tenang, dan penuh keberkahan.
            </p>

            <p className="leading-relaxed text-justify">
              Dengan metode pembelajaran yang terstruktur dan dibimbing oleh
              asatidz berpengalaman, santri dibina agar mampu membaca
              Al-Qur&apos;an dengan baik dan benar, menghafalnya secara
              bertahap, serta memahami pentingnya adab dalam kehidupan
              sehari-hari.
            </p>

            <p className="leading-relaxed text-justify">
              Daarul Qira&apos;ah hadir sebagai ikhtiar bersama dalam mencetak
              generasi Qur&apos;ani yang tidak hanya kuat hafalannya, tetapi
              juga lembut akhlaknya, disiplin ibadahnya, dan siap menjadi cahaya
              kebaikan di tengah masyarakat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

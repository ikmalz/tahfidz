import React from "react";
import mengaji_1 from "../../assets/mengaji_1.png";
import mengaji_2 from "../../assets/mengaji_2.png";
import mengaji_3 from "../../assets/mengaji_3.png";
import program_icon_1 from "../../assets/program-icon-1.png";
import program_icon_2 from "../../assets/program-icon-2.png";
import program_icon_3 from "../../assets/program-icon-3.png";

const programs = [
  {
    image: mengaji_1,
    icon: program_icon_1,
    title: "Tahsin Al-Qur’an",
  },
  {
    image: mengaji_2,
    icon: program_icon_2,
    title: "Tahfidz Al-Qur’an",
  },
  {
    image: mengaji_3,
    icon: program_icon_3,
    title: "Kajian & Talaqqi",
  },
];

const Programs = () => {
  return (
    <div className="max-w-7xl mx-auto my-20 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {programs.map((program, index) => (
          <div
            key={index}
            className="
              relative overflow-hidden rounded-xl
              shadow-md group
            "
          >
            {/* IMAGE WRAPPER (CONTROL HEIGHT) */}
            <div className="h-56 sm:h-64 md:h-60 lg:h-64">
              <img
                src={program.image}
                alt={program.title}
                className="
                  w-full h-full object-cover
                  transition-transform duration-500
                  group-hover:scale-110
                "
              />
            </div>

            {/* OVERLAY */}
            <div
              className="
                absolute inset-0 bg-blue-900/50
                opacity-0 group-hover:opacity-100
                transition-opacity duration-300
                flex flex-col items-center justify-center text-white
              "
            >
              <img
                src={program.icon}
                alt=""
                className="w-10 md:w-12 mb-3"
              />
              <p className="text-base md:text-lg font-semibold text-center">
                {program.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Programs;

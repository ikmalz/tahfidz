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
            ABOUT UNIVERSITY
          </h3>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 max-w-md">
            Lorem ipsum dolor sit amet.
          </h2>
          
          <div className="space-y-4 text-gray-600">
            <p className="leading-relaxed">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Earum
              voluptate, reiciendis tenetur cupiditate ullam illo consequatur eum
              laudantium at, esse adipisci expedita accusantium iusto explicabo
              repudiandae saepe quam inventore alias.
            </p>
            <p className="leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ab officia
              veritatis dicta inventore itaque sequi, iure deserunt et sunt, in
              nobis repellat ipsum vel eveniet molestiae harum repellendus. Unde,
              nisi!
            </p>
            <p className="leading-relaxed">
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quam
              accusantium maiores tempore, distinctio soluta delectus odit
              blanditiis mollitia expedita voluptatibus ratione incidunt facere,
              quisquam dignissimos placeat voluptatem minus corrupti in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
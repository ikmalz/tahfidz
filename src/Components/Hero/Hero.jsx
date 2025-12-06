import React from "react";
import "./Hero.css";
import dark_arrow from "../../assets/dark-arrow.png";

const Hero = () => {
  return (
    <div className="hero container">
      <div className="hero-text">
        <h1>Belajar Qur&rsquo;an Jadi Lebih Seru di Sini!</h1>
        <p>
          Yuk mulai perjalanan ngaji dan hafalan yang lebih asik bareng pengajar
          yang ramah dan berpengalaman. Di sini kamu bakal belajar
          Al-Qur&rsquo;an dengan cara yang ringan, nyaman, dan pastinya bikin
          semangat setiap hari.
        </p>
        <button className="btn">
          Mulai Sekarang <img src={dark_arrow} alt="" />
        </button>
      </div>
    </div>
  );
};

export default Hero;

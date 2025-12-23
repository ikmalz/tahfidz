import React from "react";
import "./Hero.css";
import dark_arrow from "../../assets/dark-arrow.png";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
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
        <button className="btn" onClick={() => navigate("/tahfidz")}>
          Mulai Sekarang
        </button>
      </div>
    </div>
  );
};

export default Hero;

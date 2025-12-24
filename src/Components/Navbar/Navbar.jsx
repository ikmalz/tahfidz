import React, { useEffect, useState } from "react";
import "./Navbar.css";
import logo from "../../assets/logo1.jpg";
import { Link } from "react-scroll";

const Navbar = () => {
  const [sticky, setSticky] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      window.scrollY > 50 ? setSticky(true) : setSticky(false);
    };

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setShowMobileMenu(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  return (
    <nav className={`nav-container ${sticky ? "dark-nav" : ""}`}>
      <div className="nav-content">
        <img src={logo} alt="Logo" className="logo" />

        <ul className="desktop-menu">
          <li><Link to="hero" smooth={true} offset={0} duration={500}>Beranda</Link></li>
          <li><Link to="program" smooth={true} offset={0} duration={500}>Program</Link></li>
          <li><Link to="about" smooth={true} offset={0} duration={500}>Tentang Kami</Link></li>
          <li><Link to="campus" smooth={true} offset={0} duration={500}>Galeri</Link></li>
          <li><Link to="testimonials" smooth={true} offset={0} duration={500}>Testimoni</Link></li>
          <li>
            <a href="/hubungi-kami" className="btn">
              Hubungi Kami
            </a>
          </li>
        </ul>

        {isMobile && (
          <button
            className={`mobile-menu-icon ${
              showMobileMenu ? "close" : "hamburger"
            }`}
            onClick={toggleMobileMenu}
            aria-label={showMobileMenu ? "Close menu" : "Open menu"}
            aria-expanded={showMobileMenu}
          >
            {showMobileMenu ? (
              <>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
              </>
            ) : (
              <>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
              </>
            )}
          </button>
        )}
      </div>

      {isMobile && showMobileMenu && (
        <div
          className="mobile-menu-overlay"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {isMobile && showMobileMenu && (
        <div className="mobile-menu-dropdown">
          <ul>
            <li onClick={closeMobileMenu}>
              <span>Beranda</span>
            </li>
            <li onClick={closeMobileMenu}>
              <span>Program</span>
            </li>
            <li onClick={closeMobileMenu}>
              <span>Tentang Kami</span>
            </li>
            <li onClick={closeMobileMenu}>
              <span>Galeri</span>
            </li>
            <li onClick={closeMobileMenu}>
              <span>Testimoni</span>
            </li>
            <li>
              <a href="/hubungi-kami" onClick={closeMobileMenu} className="btn">
                Hubungi Kami
              </a>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

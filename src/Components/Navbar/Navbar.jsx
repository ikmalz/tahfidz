import React, { useEffect, useState } from "react";
import "./Navbar.css";
import logo from "../../assets/logo1.jpg";

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
    
    window.addEventListener('scroll', handleScroll);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  return (
    <nav className={`nav-container ${sticky ? 'dark-nav' : ''}`}>
      <div className="nav-content">
        <img src={logo} alt="Logo" className="logo" />
        
        <ul className="desktop-menu">
          <li>Beranda</li>
          <li>Program</li>
          <li>Tentang Kami</li>
          <li>Galeri</li>
          <li>Testimoni</li>
          <li>
            <button className="btn">Hubungi Kami</button>
          </li>
        </ul>
        
        {isMobile && (
          <button 
            className={`mobile-menu-icon ${showMobileMenu ? 'close' : 'hamburger'}`}
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
              <button 
                className="btn" 
                onClick={closeMobileMenu}
                aria-label="Hubungi Kami"
              >
                Hubungi Kami
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
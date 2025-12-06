import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./DashboardLayout.css";

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const preloadRoute = (path) => {
    const pages = {
      santri: () => import("../Santri/SantriList/SantriList.jsx"),
      hafalan: () => import("../Hafalan/HafalanList.jsx"),
      jadwal: () => import("../Programs/Programs.jsx"),
      guru: () => import("../About/About.jsx"),
      pengaturan: () => import("../Pengaturan/Pengaturan.jsx"),
    };

    const key = path.toLowerCase();
    if (pages[key]) pages[key]();
  };

  const handleLinkClick = () => {
    if (window.innerWidth <= 768 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {isOpen && window.innerWidth <= 768 && (
        <div 
          className="sidebar-overlay active" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>📘 Dashboard</h3>
          {window.innerWidth <= 768 && (
            <button 
              className="sidebar-close-mobile"
              onClick={onClose}
              aria-label="Close Sidebar"
            >
              ✕
            </button>
          )}
        </div>
        
        <ul>
          <Link
            to="/santri"
            onMouseEnter={() => preloadRoute("santri")}
            onClick={handleLinkClick}
            className={
              isActive("/santri") ? "active sidebar-link" : "sidebar-link"
            }
          >
            <li>Data Santri</li>
          </Link>

          <Link
            to="/hafalan"
            onMouseEnter={() => preloadRoute("hafalan")}
            onClick={handleLinkClick}
            className={
              isActive("/hafalan") ? "active sidebar-link" : "sidebar-link"
            }
          >
            <li>Hafalan</li>
          </Link>

          <Link
            to="/jadwal"
            onMouseEnter={() => preloadRoute("jadwal")}
            onClick={handleLinkClick}
            className={
              isActive("/jadwal") ? "active sidebar-link" : "sidebar-link"
            }
          >
            <li>Jadwal</li>
          </Link>

          <Link
            to="/guru"
            onMouseEnter={() => preloadRoute("guru")}
            onClick={handleLinkClick}
            className={isActive("/guru") ? "active sidebar-link" : "sidebar-link"}
          >
            <li>Guru</li>
          </Link>

          <Link
            to="/pengaturan"
            onMouseEnter={() => preloadRoute("pengaturan")}
            onClick={handleLinkClick}
            className={
              isActive("/pengaturan") ? "active sidebar-link" : "sidebar-link"
            }
          >
            <li>Pengaturan</li>
          </Link>
        </ul>
      </div>
    </>
  );
}
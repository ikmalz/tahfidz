import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import "./DashboardLayout.css";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // Di desktop, sidebar selalu terbuka
      // Di mobile, sidebar tertutup default
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="dashboard-container">
      {isMobile && (
        <button 
          className="sidebar-toggle" 
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          {isSidebarOpen ? '✕' : '☰'}
        </button>
      )}

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={closeSidebar}
      />
      
      <main 
        className={`dashboard-content ${isSidebarOpen && isMobile ? 'sidebar-open' : ''}`} 
        onClick={closeSidebar}
      >
        {children}
      </main>
    </div>
  );
}
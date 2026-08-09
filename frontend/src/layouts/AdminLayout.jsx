import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <div className={`app-container layout-has-sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
      <Navbar 
        onToggleSidebar={handleToggleSidebar} 
        isSidebarCollapsed={isSidebarCollapsed} 
      />
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        isMobileOpen={isMobileOpen} 
      />
      <main className="main-content" onClick={() => setIsMobileOpen(false)}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

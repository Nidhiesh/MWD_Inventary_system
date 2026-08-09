import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUnreadNotifications } from "../services/notificationService";

const Navbar = ({ onToggleSidebar, isSidebarCollapsed }) => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await getUnreadNotifications();
        if (res && res.success) {
          setUnreadCount(res.count || (res.data ? res.data.length : 0));
        }
      } catch (err) {
        console.error("Failed to fetch unread notifications count:", err);
      }
    };

    fetchUnread();
    
    // Check every 30 seconds
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const notificationPath = user.role === "admin" ? "/admin/notifications" : "/staff/notifications";

  return (
    <header className="top-navbar">
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button className="hamburger-menu-btn" onClick={onToggleSidebar} aria-label="Toggle Sidebar">
          ☰
        </button>
        <button 
          onClick={onToggleSidebar}
          style={{
            background: "none",
            border: "none",
            fontSize: "1.2rem",
            cursor: "pointer",
            color: "var(--text-muted)",
            display: "block"
          }}
          className="desktop-sidebar-toggle"
          aria-label="Collapse Sidebar"
        >
          {isSidebarCollapsed ? "→" : "←"}
        </button>
        <Link to={user.role === "admin" ? "/admin/dashboard" : "/staff/dashboard"} className="navbar-brand">
          <span>📦</span> SmartStock
        </Link>
      </div>

      <div className="navbar-right">
        <Link to={notificationPath} className="nav-item-icon" aria-label="Notifications">
          🔔
          {unreadCount > 0 && <span className="notification-dot"></span>}
        </Link>

        <div className="user-profile-menu">
          <div className="user-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="user-info-text">
            <span className="user-name">{user.name || "User"}</span>
            <span className="user-role-badge">{user.role || "staff"}</span>
          </div>
          <button 
            onClick={handleLogout} 
            className="btn btn-secondary btn-sm"
            style={{ marginLeft: "12px" }}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

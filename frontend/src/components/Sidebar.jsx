import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = ({ isCollapsed, isMobileOpen }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const adminMenu = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/products", label: "Products", icon: "📦" },
    { path: "/admin/categories", label: "Categories", icon: "🏷️" },
    { path: "/admin/suppliers", label: "Suppliers", icon: "🤝" },
    { path: "/admin/customers", label: "Customers", icon: "👤" },
    { path: "/admin/inventory", label: "Inventory", icon: "📋" },
    { path: "/admin/sales", label: "Sales", icon: "💵" },
    { path: "/admin/purchases", label: "Purchases", icon: "🛒" },
    { path: "/admin/reports", label: "Reports", icon: "📈" },
    { path: "/admin/notifications", label: "Notifications", icon: "🔔" },
    { path: "/admin/staff", label: "Staff", icon: "👥" }
  ];

  const staffMenu = [
    { path: "/staff/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/staff/products", label: "Products", icon: "📦" },
    { path: "/staff/customers", label: "Customers", icon: "👤" },
    { path: "/staff/inventory", label: "Inventory", icon: "📋" },
    { path: "/staff/sales", label: "Sales", icon: "💵" },
    { path: "/staff/purchases", label: "Purchases", icon: "🛒" },
    { path: "/staff/notifications", label: "Notifications", icon: "🔔" }
  ];

  const menuItems = isAdmin ? adminMenu : staffMenu;

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""} ${isMobileOpen ? "mobile-open" : ""}`}>
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.path}>
            <NavLink 
              to={item.path} 
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span className="sidebar-link-text">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
      <div style={{ padding: "0 12px" }}>
        <div style={{
          borderTop: "1px solid var(--border)",
          padding: "16px 0",
          display: isCollapsed ? "none" : "block",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          textAlign: "center"
        }}>
          SmartStock v1.0.0
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

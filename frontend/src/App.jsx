import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth & Protection Guards
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import StaffLayout from "./layouts/StaffLayout";

// Shared Page
import Login from "./pages/Login";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminCategories from "./pages/admin/Categories";
import AdminSuppliers from "./pages/admin/Suppliers";
import AdminCustomers from "./pages/admin/Customers";
import AdminInventory from "./pages/admin/Inventory";
import AdminSales from "./pages/admin/Sales";
import AdminPurchases from "./pages/admin/Purchases";
import AdminReports from "./pages/admin/Reports";
import AdminNotifications from "./pages/admin/Notifications";
import AdminStaff from "./pages/admin/Staff";

// Staff Pages
import StaffDashboard from "./pages/staff/Dashboard";
import StaffProducts from "./pages/staff/Products";
import StaffCustomers from "./pages/staff/Customers";
import StaffInventory from "./pages/staff/Inventory";
import StaffSales from "./pages/staff/Sales";
import StaffPurchases from "./pages/staff/Purchases";
import StaffNotifications from "./pages/staff/Notifications";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Admin Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["admin"]}>
                <AdminLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="suppliers" element={<AdminSuppliers />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="sales" element={<AdminSales />} />
          <Route path="purchases" element={<AdminPurchases />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="staff" element={<AdminStaff />} />
        </Route>

        {/* Staff Protected Routes */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["staff"]}>
                <StaffLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/staff/dashboard" replace />} />
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="products" element={<StaffProducts />} />
          <Route path="customers" element={<StaffCustomers />} />
          <Route path="inventory" element={<StaffInventory />} />
          <Route path="sales" element={<StaffSales />} />
          <Route path="purchases" element={<StaffPurchases />} />
          <Route path="notifications" element={<StaffNotifications />} />
        </Route>

        {/* Root Redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
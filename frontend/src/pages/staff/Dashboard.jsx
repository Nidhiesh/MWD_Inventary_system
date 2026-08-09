import React, { useEffect, useState } from "react";
import { getDashboard } from "../../services/dashboardService";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import StatusBadge from "../../components/StatusBadge";

const StaffDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getDashboard();
      if (res && res.success) {
        setData(res.data);
      } else {
        setError(res.message || "Failed to load operational metrics.");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.status === 403 
          ? "You do not have permission to view the operational dashboard."
          : "Unable to load dashboard data. Check connection to the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <Loading message="Loading operational dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchDashboardData} />;
  if (!data) return <div className="empty-state">No data available</div>;

  const {
    products = { total: 0, active: 0, lowStock: 0, outOfStock: 0 },
    sales = { today: 0, todayCount: 0 },
    purchases = { today: 0, todayCount: 0 },
    notifications = { unread: 0 },
    recentSales = [],
    recentPurchases = []
  } = data;

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div className="page-header">
        <div className="page-title-area">
          <h2>Good Morning, Staff</h2>
          <p>Operational summary and daily transactions overview.</p>
        </div>
        <button className="btn btn-primary" onClick={fetchDashboardData}>
          🔄 Refresh
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon primary">📦</div>
          <div className="kpi-details">
            <span className="kpi-title">Total Products</span>
            <span className="kpi-value">{products.total}</span>
            <span className="kpi-info">{products.active} active items</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon warning">⚠️</div>
          <div className="kpi-details">
            <span className="kpi-title">Low Stock</span>
            <span className="kpi-value">{products.lowStock}</span>
            <span className="kpi-info">Needs replenishment</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon danger">🚨</div>
          <div className="kpi-details">
            <span className="kpi-title">Out of Stock</span>
            <span className="kpi-value">{products.outOfStock}</span>
            <span className="kpi-info">Zero quantity left</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon success">💵</div>
          <div className="kpi-details">
            <span className="kpi-title">Today's Sales</span>
            <span className="kpi-value">${sales.today.toLocaleString()}</span>
            <span className="kpi-info">{sales.todayCount} sales completed</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon warning">🛒</div>
          <div className="kpi-details">
            <span className="kpi-title">Today's Purchases</span>
            <span className="kpi-value">${purchases.today.toLocaleString()}</span>
            <span className="kpi-info">{purchases.todayCount} purchase orders</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon danger">🔔</div>
          <div className="kpi-details">
            <span className="kpi-title">Unread Alerts</span>
            <span className="kpi-value">{notifications.unread}</span>
            <span className="kpi-info">Requires attention</span>
          </div>
        </div>
      </div>

      {/* Recent transactions grid */}
      <div className="dashboard-grid dashboard-grid-half">
        {/* Recent Sales */}
        <div className="card">
          <h3 className="chart-title" style={{ marginBottom: "16px" }}>Recent Sales</h3>
          {recentSales.length === 0 ? (
            <div className="empty-state">No recent sales found.</div>
          ) : (
            <div className="table-container" style={{ border: "none", boxShadow: "none", margin: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale) => (
                    <tr key={sale._id}>
                      <td>{sale.customer ? sale.customer.name : "Walk-in Customer"}</td>
                      <td style={{ fontWeight: "700" }}>${sale.grandTotal.toLocaleString()}</td>
                      <td>
                        <StatusBadge status={sale.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Purchases */}
        <div className="card">
          <h3 className="chart-title" style={{ marginBottom: "16px" }}>Recent Purchases Logged</h3>
          {recentPurchases.length === 0 ? (
            <div className="empty-state">No recent purchases found.</div>
          ) : (
            <div className="table-container" style={{ border: "none", boxShadow: "none", margin: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Supplier</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPurchases.map((purchase) => (
                    <tr key={purchase._id}>
                      <td>{purchase.supplier ? purchase.supplier.companyName : "Unknown Supplier"}</td>
                      <td style={{ fontWeight: "700" }}>${purchase.grandTotal.toLocaleString()}</td>
                      <td>
                        <StatusBadge status={purchase.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;

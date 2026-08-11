import React, { useEffect, useState } from "react";
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from "recharts";
import { getDashboard } from "../../services/dashboardService";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import StatusBadge from "../../components/StatusBadge";

const Dashboard = () => {
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
        setError(res.message || "Failed to load dashboard summary.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the backend server. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <Loading message="Loading dashboard summary..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchDashboardData} />;
  if (!data) return <div className="empty-state">No data available</div>;

  const {
    products = { total: 0, active: 0, lowStock: 0, outOfStock: 0 },
    categories = { total: 0 },
    suppliers = { total: 0, active: 0 },
    customers = { total: 0, active: 0 },
    sales = { today: 0, todayCount: 0 },
    purchases = { today: 0, todayCount: 0 },
    inventory = { totalValue: 0 },
    notifications = { unread: 0 },
    recentSales = [],
    recentPurchases = []
  } = data;

  // Chart Data calculations based strictly on backend statistics
  const outQty = products.outOfStock || 0;
  const lowQty = products.lowStock || 0;
  const healthyQty = Math.max(0, (products.total || 0) - outQty - lowQty);

  const stockHealthData = [
    { name: "Healthy Stock", value: healthyQty, color: "#16A34A" },
    { name: "Low Stock", value: lowQty, color: "#F59E0B" },
    { name: "Out of Stock", value: outQty, color: "#DC2626" }
  ].filter(item => item.value > 0);

  const todayFinancialData = [
    { name: "Sales", amount: sales.today || 0, count: sales.todayCount || 0 },
    { name: "Purchases", amount: purchases.today || 0, count: purchases.todayCount || 0 }
  ];

  const distributionData = [
    { name: "Products", count: products.total || 0 },
    { name: "Categories", count: categories.total || 0 },
    { name: "Suppliers", count: suppliers.total || 0 },
    { name: "Customers", count: customers.total || 0 }
  ];

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div className="page-header">
        <div className="page-title-area">
          <h2>Good Morning, Admin</h2>
          <p>SmartStock overview and operational metrics.</p>
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
            <span className="kpi-info">{products.active} active products</span>
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
          <div className="kpi-icon primary">🏷️</div>
          <div className="kpi-details">
            <span className="kpi-title">Categories</span>
            <span className="kpi-value">{categories.total}</span>
            <span className="kpi-info">Product divisions</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon success">💵</div>
          <div className="kpi-details">
            <span className="kpi-title">Today's Sales</span>
            <span className="kpi-value">${sales.today.toLocaleString()}</span>
            <span className="kpi-info">{sales.todayCount} transactions</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon warning">🛒</div>
          <div className="kpi-details">
            <span className="kpi-title">Today's Purchases</span>
            <span className="kpi-value">${purchases.today.toLocaleString()}</span>
            <span className="kpi-info">{purchases.todayCount} records</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon success">💰</div>
          <div className="kpi-details">
            <span className="kpi-title">Inventory Value</span>
            <span className="kpi-value">${inventory.totalValue.toLocaleString()}</span>
            <span className="kpi-info">Cost of asset holding</span>
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

      {/* Visual Analytics */}
      <div className="dashboard-grid">
        <div className="card chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Today's Financial Flows ($)</h3>
          </div>
          <div style={{ flexGrow: 1, minHeight: "260px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={todayFinancialData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                <Bar dataKey="amount" fill="#4F46E5" radius={[8, 8, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Stock Health</h3>
          </div>
          <div style={{ flexGrow: 1, minHeight: "220px", position: "relative" }}>
            {stockHealthData.length === 0 ? (
              <div className="empty-state" style={{ height: "100%" }}>No stock items available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockHealthData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stockHealthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Distribution Grid */}
      <div className="dashboard-grid dashboard-grid-half">
        <div className="card chart-card" style={{ minHeight: "300px" }}>
          <div className="chart-header">
            <h3 className="chart-title">System Entity Distribution</h3>
          </div>
          <div style={{ flexGrow: 1, minHeight: "200px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ minHeight: "300px" }}>
          <h3 className="chart-title" style={{ marginBottom: "16px" }}>Recent Activity Summary</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <h4 style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase" }}>Recent Customers Added ({customers.total})</h4>
              <p style={{ fontSize: "0.9rem", fontWeight: "600" }}>Active Accounts: {customers.active} of {customers.total}</p>
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
              <h4 style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase" }}>Recent Suppliers Connected ({suppliers.total})</h4>
              <p style={{ fontSize: "0.9rem", fontWeight: "600" }}>Active Partners: {suppliers.active} of {suppliers.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Grid */}
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
          <h3 className="chart-title" style={{ marginBottom: "16px" }}>Recent Purchases</h3>
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

export default Dashboard;

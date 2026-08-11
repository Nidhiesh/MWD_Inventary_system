import React, { useState, useEffect } from "react";
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from "recharts";
import { getSalesReport, getPurchaseReport, getInventoryReport } from "../../services/reportService";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import StatusBadge from "../../components/StatusBadge";

const Reports = () => {
  // Report Tab: "sales" | "purchases" | "inventory"
  const [activeReport, setActiveReport] = useState("sales");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Date Filters
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // Report Data States
  const [salesData, setSalesData] = useState(null);
  const [purchasesData, setPurchasesData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);

  // Search filter inside tables
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSalesReport = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getSalesReport({ startDate, endDate });
      if (res && res.success) {
        setSalesData(res.data);
      } else {
        setError(res.message || "Failed to load sales report.");
      }
    } catch (err) {
      console.error(err);
      setError("Server error while generating sales report.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchasesReport = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getPurchaseReport({ startDate, endDate });
      if (res && res.success) {
        setPurchasesData(res.data);
      } else {
        setError(res.message || "Failed to load purchases report.");
      }
    } catch (err) {
      console.error(err);
      setError("Server error while generating purchases report.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryReportData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getInventoryReport();
      if (res && res.success) {
        setInventoryData(res.data);
      } else {
        setError(res.message || "Failed to load inventory report.");
      }
    } catch (err) {
      console.error(err);
      setError("Server error while generating inventory report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSearchQuery("");
    if (activeReport === "sales") {
      fetchSalesReport();
    } else if (activeReport === "purchases") {
      fetchPurchasesReport();
    } else if (activeReport === "inventory") {
      fetchInventoryReportData();
    }
  }, [activeReport]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    if (activeReport === "sales") {
      fetchSalesReport();
    } else if (activeReport === "purchases") {
      fetchPurchasesReport();
    }
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div className="page-header">
        <div className="page-title-area">
          <h2>Business Reports</h2>
          <p>Analyze transaction volumes, purchases, and valuation statements.</p>
        </div>
        <button className="btn btn-secondary" onClick={printReport}>
          🖨️ Print / Save PDF
        </button>
      </div>

      {/* Report Selection Tabs */}
      <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid var(--border)", marginBottom: "24px", paddingBottom: "1px" }}>
        <button 
          style={{
            background: "none",
            border: "none",
            borderBottom: activeReport === "sales" ? "3px solid var(--primary)" : "none",
            color: activeReport === "sales" ? "var(--primary)" : "var(--text-muted)",
            fontWeight: activeReport === "sales" ? "700" : "500",
            padding: "12px 16px",
            cursor: "pointer",
            fontSize: "0.95rem"
          }}
          onClick={() => setActiveReport("sales")}
        >
          📊 Sales Analysis
        </button>
        <button 
          style={{
            background: "none",
            border: "none",
            borderBottom: activeReport === "purchases" ? "3px solid var(--primary)" : "none",
            color: activeReport === "purchases" ? "var(--primary)" : "var(--text-muted)",
            fontWeight: activeReport === "purchases" ? "700" : "500",
            padding: "12px 16px",
            cursor: "pointer",
            fontSize: "0.95rem"
          }}
          onClick={() => setActiveReport("purchases")}
        >
          🛒 Procurement Analysis
        </button>
        <button 
          style={{
            background: "none",
            border: "none",
            borderBottom: activeReport === "inventory" ? "3px solid var(--primary)" : "none",
            color: activeReport === "inventory" ? "var(--primary)" : "var(--text-muted)",
            fontWeight: activeReport === "inventory" ? "700" : "500",
            padding: "12px 16px",
            cursor: "pointer",
            fontSize: "0.95rem"
          }}
          onClick={() => setActiveReport("inventory")}
        >
          📋 Valuation & Stock levels
        </button>
      </div>

      {/* Date Filters (for Sales and Purchases) */}
      {activeReport !== "inventory" && (
        <form onSubmit={handleFilterSubmit} className="filter-bar" style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-end" }}>
          <div className="form-group" style={{ margin: 0, minWidth: "150px" }}>
            <label className="form-label" style={{ fontSize: "0.75rem" }}>Start Date</label>
            <input 
              type="date" 
              className="form-input" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
            />
          </div>
          <div className="form-group" style={{ margin: 0, minWidth: "150px" }}>
            <label className="form-label" style={{ fontSize: "0.75rem" }}>End Date</label>
            <input 
              type="date" 
              className="form-input" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: "42px" }}>
            Generate Report
          </button>
        </form>
      )}

      {loading ? (
        <Loading message="Generating business metrics report..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={activeReport === "sales" ? fetchSalesReport : activeReport === "purchases" ? fetchPurchasesReport : fetchInventoryReportData} />
      ) : (
        <div className="report-section">
          {/* SALES REPORT TAB */}
          {activeReport === "sales" && salesData && (
            <>
              {/* Summary KPIs */}
              <div className="reports-summary">
                <div className="kpi-card">
                  <div className="kpi-icon success">💵</div>
                  <div className="kpi-details">
                    <span className="kpi-title">Total Revenue</span>
                    <span className="kpi-value">${(salesData.summary?.totalRevenue || 0).toLocaleString()}</span>
                    <span className="kpi-info">Gross revenue generated</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon primary">📊</div>
                  <div className="kpi-details">
                    <span className="kpi-title">Sales Orders</span>
                    <span className="kpi-value">{salesData.summary?.totalSales || 0}</span>
                    <span className="kpi-info">Invoiced orders completed</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon success">💰</div>
                  <div className="kpi-details">
                    <span className="kpi-title">Average Order Value</span>
                    <span className="kpi-value">
                      ${salesData.summary?.totalSales > 0 
                        ? (salesData.summary.totalRevenue / salesData.summary.totalSales).toFixed(2) 
                        : "0.00"
                      }
                    </span>
                    <span className="kpi-info">Ticket average size</span>
                  </div>
                </div>
              </div>

              {/* Chart */}
              {salesData.sales?.length > 0 && (
                <div className="card chart-card">
                  <h3 className="chart-title">Invoiced Sales Progression</h3>
                  <div style={{ flexGrow: 1, height: "260px", marginTop: "16px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[...salesData.sales].reverse()}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="createdAt" tickFormatter={(val) => new Date(val).toLocaleDateString()} />
                        <YAxis />
                        <Tooltip labelFormatter={(val) => new Date(val).toLocaleString()} />
                        <Area type="monotone" dataKey="grandTotal" stroke="#4F46E5" fillOpacity={0.1} fill="#4F46E5" strokeWidth={2} name="Order Total ($)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Table */}
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 className="chart-title">Invoiced Logs</h3>
                  <div className="search-input-wrapper" style={{ maxWidth: "250px" }}>
                    <span className="search-input-icon">🔍</span>
                    <input 
                      type="text" 
                      placeholder="Filter by customer..." 
                      className="search-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {salesData.sales?.length === 0 ? (
                  <div className="empty-state">No sales transactions during this period.</div>
                ) : (
                  <div className="table-container" style={{ border: "none", boxShadow: "none", margin: 0 }}>
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Total Items</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesData.sales
                          .filter(s => s.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((sale) => (
                            <tr key={sale._id}>
                              <td>{new Date(sale.createdAt).toLocaleDateString()}</td>
                              <td style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "monospace" }}>{sale._id}</td>
                              <td style={{ fontWeight: "600" }}>{sale.customer ? sale.customer.name : "Walk-in Customer"}</td>
                              <td>{sale.items?.length || 0}</td>
                              <td style={{ fontWeight: "700" }}>${sale.grandTotal.toLocaleString()}</td>
                              <td><StatusBadge status={sale.status} /></td>
                            </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* PROCUREMENT REPORT TAB */}
          {activeReport === "purchases" && purchasesData && (
            <>
              {/* Summary KPIs */}
              <div className="reports-summary">
                <div className="kpi-card">
                  <div className="kpi-icon danger">🛒</div>
                  <div className="kpi-details">
                    <span className="kpi-title">Procurement Spend</span>
                    <span className="kpi-value">${(purchasesData.summary?.totalExpenditure || 0).toLocaleString()}</span>
                    <span className="kpi-info">Spend on inventory restocking</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon primary">📋</div>
                  <div className="kpi-details">
                    <span className="kpi-title">Purchases Invoiced</span>
                    <span className="kpi-value">{purchasesData.summary?.totalPurchases || 0}</span>
                    <span className="kpi-info">Purchase bills settled</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon warning">💰</div>
                  <div className="kpi-details">
                    <span className="kpi-title">Average Bill Size</span>
                    <span className="kpi-value">
                      ${purchasesData.summary?.totalPurchases > 0 
                        ? (purchasesData.summary.totalExpenditure / purchasesData.summary.totalPurchases).toFixed(2) 
                        : "0.00"
                      }
                    </span>
                    <span className="kpi-info">Settlement invoice average</span>
                  </div>
                </div>
              </div>

              {/* Chart */}
              {purchasesData.purchases?.length > 0 && (
                <div className="card chart-card">
                  <h3 className="chart-title">Restocking Spend Progression</h3>
                  <div style={{ flexGrow: 1, height: "260px", marginTop: "16px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[...purchasesData.purchases].reverse()}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="createdAt" tickFormatter={(val) => new Date(val).toLocaleDateString()} />
                        <YAxis />
                        <Tooltip labelFormatter={(val) => new Date(val).toLocaleString()} />
                        <Area type="monotone" dataKey="grandTotal" stroke="#EF4444" fillOpacity={0.1} fill="#EF4444" strokeWidth={2} name="Bill Total ($)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Table */}
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 className="chart-title">Procurement History</h3>
                  <div className="search-input-wrapper" style={{ maxWidth: "250px" }}>
                    <span className="search-input-icon">🔍</span>
                    <input 
                      type="text" 
                      placeholder="Filter by Supplier company..." 
                      className="search-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {purchasesData.purchases?.length === 0 ? (
                  <div className="empty-state">No purchases recorded during this period.</div>
                ) : (
                  <div className="table-container" style={{ border: "none", boxShadow: "none", margin: 0 }}>
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Invoice ID</th>
                          <th>Supplier Company</th>
                          <th>Total Items</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchasesData.purchases
                          .filter(p => p.supplier?.companyName?.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((p) => (
                            <tr key={p._id}>
                              <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                              <td style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "monospace" }}>{p._id}</td>
                              <td style={{ fontWeight: "600" }}>{p.supplier ? p.supplier.companyName : "Unknown Supplier"}</td>
                              <td>{p.items?.length || 0}</td>
                              <td style={{ fontWeight: "700" }}>${p.grandTotal.toLocaleString()}</td>
                              <td><StatusBadge status={p.status} /></td>
                            </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* INVENTORY REPORT TAB */}
          {activeReport === "inventory" && inventoryData && (
            <>
              {/* Summary KPIs */}
              <div className="reports-summary">
                <div className="kpi-card">
                  <div className="kpi-icon primary">📦</div>
                  <div className="kpi-details">
                    <span className="kpi-title">Total SKUs</span>
                    <span className="kpi-value">{inventoryData.summary?.totalProducts || 0}</span>
                    <span className="kpi-info">Products in catalog</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon success">💰</div>
                  <div className="kpi-details">
                    <span className="kpi-title">Asset Net Value</span>
                    <span className="kpi-value">${(inventoryData.summary?.totalInventoryValue || 0).toLocaleString()}</span>
                    <span className="kpi-info">Total inventory capital holding</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon warning">⚠️</div>
                  <div className="kpi-details">
                    <span className="kpi-title">Low Stock SKUs</span>
                    <span className="kpi-value">{inventoryData.summary?.lowStockProducts || 0}</span>
                    <span className="kpi-info">Below minimum threshold</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon danger">🚨</div>
                  <div className="kpi-details">
                    <span className="kpi-title">Out of Stock SKUs</span>
                    <span className="kpi-value">{inventoryData.summary?.outOfStockProducts || 0}</span>
                    <span className="kpi-info">No quantity left</span>
                  </div>
                </div>
              </div>

              {/* Chart */}
              {inventoryData.products?.length > 0 && (
                <div className="card chart-card">
                  <h3 className="chart-title">Valuation distribution (Top 10 Assets by Cost Value)</h3>
                  <div style={{ flexGrow: 1, height: "260px", marginTop: "16px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={
                          [...inventoryData.products]
                            .map(p => ({
                              name: p.name,
                              sku: p.sku,
                              value: p.quantity * p.purchasePrice
                            }))
                            .sort((a, b) => b.value - a.value)
                            .slice(0, 10)
                        }
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="sku" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}`, "Asset Value"]} />
                        <Bar dataKey="value" fill="#10B981" radius={[6, 6, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Table */}
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 className="chart-title">Inventory Valuation Statement</h3>
                  <div className="search-input-wrapper" style={{ maxWidth: "250px" }}>
                    <span className="search-input-icon">🔍</span>
                    <input 
                      type="text" 
                      placeholder="Filter by SKU or Name..." 
                      className="search-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {inventoryData.products?.length === 0 ? (
                  <div className="empty-state">No products registered in the database.</div>
                ) : (
                  <div className="table-container" style={{ border: "none", boxShadow: "none", margin: 0 }}>
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>SKU</th>
                          <th>Product Name</th>
                          <th>Category Name</th>
                          <th>Current Stock</th>
                          <th>Purchase Price</th>
                          <th>Asset Cost Value</th>
                          <th>Min Threshold</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryData.products
                          .filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku?.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((p) => {
                            const val = (p.quantity || 0) * (p.purchasePrice || 0);
                            const isLow = p.quantity > 0 && p.quantity <= p.minimumStock;
                            const isOut = p.quantity === 0;

                            return (
                              <tr key={p._id} style={{ backgroundColor: isOut ? "#FFF5F5" : isLow ? "#FFFDF5" : "inherit" }}>
                                <td style={{ fontWeight: "700" }}>{p.sku}</td>
                                <td>{p.name}</td>
                                <td>{p.category ? p.category.name : "N/A"}</td>
                                <td style={{ fontWeight: "700" }}>
                                  {p.quantity} 
                                  {isOut && <span style={{ marginLeft: "4px", color: "var(--danger)", fontSize: "0.75rem" }}>(Out)</span>}
                                  {isLow && <span style={{ marginLeft: "4px", color: "var(--warning)", fontSize: "0.75rem" }}>(Low)</span>}
                                </td>
                                <td>${p.purchasePrice.toLocaleString()}</td>
                                <td style={{ fontWeight: "800", color: "var(--primary)" }}>${val.toLocaleString()}</td>
                                <td>{p.minimumStock}</td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;

import React, { useState, useEffect } from "react";
import { getProducts } from "../../services/productService";
import { getInventoryTransactions } from "../../services/inventoryService";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";

const StaffInventory = () => {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchInventoryData = async () => {
    setLoading(true);
    setError("");
    try {
      const prodRes = await getProducts({ limit: 100 });
      const txRes = await getInventoryTransactions();

      if (prodRes.success) setProducts(prodRes.data);
      if (txRes.success) setTransactions(txRes.data);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the backend server to load inventory statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const totalStockQty = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const outOfStockCount = products.filter(p => p.quantity === 0).length;
  const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity <= p.minimumStock).length;

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div className="page-header">
        <div className="page-title-area">
          <h2>Inventory Auditing</h2>
          <p>Read-only check on stock availability and historical transaction trail.</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon primary">📋</div>
          <div className="kpi-details">
            <span className="kpi-title">Current Stock Qty</span>
            <span className="kpi-value">{totalStockQty}</span>
            <span className="kpi-info">Total units in warehouse</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon danger">🚨</div>
          <div className="kpi-details">
            <span className="kpi-title">Out of Stock</span>
            <span className="kpi-value">{outOfStockCount}</span>
            <span className="kpi-info">Items at zero quantity</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon warning">⚠️</div>
          <div className="kpi-details">
            <span className="kpi-title">Low Stock Alerts</span>
            <span className="kpi-value">{lowStockCount}</span>
            <span className="kpi-info">Below minimum threshold</span>
          </div>
        </div>
      </div>

      {loading ? (
        <Loading message="Loading inventory audit logs..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchInventoryData} />
      ) : (
        <>
          {/* Products list card */}
          <div className="card" style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 className="chart-title">Stock Quantities & Statuses</h3>
              <div className="search-input-wrapper" style={{ maxWidth: "300px" }}>
                <span className="search-input-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Filter by SKU or Name..." 
                  className="search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="table-container" style={{ margin: 0, border: "none", boxShadow: "none" }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product Name</th>
                    <th>Warehouse</th>
                    <th>Stock Qty</th>
                    <th>Min Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => {
                    const isLow = p.quantity > 0 && p.quantity <= p.minimumStock;
                    const isOut = p.quantity === 0;

                    return (
                      <tr key={p._id}>
                        <td style={{ fontWeight: "700" }}>{p.sku}</td>
                        <td>{p.name}</td>
                        <td>{p.warehouse}</td>
                        <td style={{ fontWeight: "700" }}>
                          {p.quantity}
                          {isOut && <span style={{ marginLeft: "4px", color: "var(--danger)" }}>(Out)</span>}
                          {isLow && <span style={{ marginLeft: "4px", color: "var(--warning)" }}>(Low)</span>}
                        </td>
                        <td>{p.minimumStock}</td>
                        <td>
                          <span className={`status-badge ${isOut ? "out-of-stock" : isLow ? "lowstock" : "active"}`}>
                            {isOut ? "OUT OF STOCK" : isLow ? "LOW STOCK" : "HEALTHY"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transaction History log */}
          <div className="card">
            <h3 className="chart-title" style={{ marginBottom: "16px" }}>Audit Trail: Stock Transactions</h3>
            {transactions.length === 0 ? (
              <div className="empty-state">No transactions recorded in system.</div>
            ) : (
              <div className="table-container" style={{ border: "none", boxShadow: "none", margin: 0 }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Type</th>
                      <th>Quantity</th>
                      <th>Prev Stock</th>
                      <th>New Stock</th>
                      <th>Reference ID</th>
                      <th>Notes</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx._id}>
                        <td style={{ fontWeight: "600" }}>
                          {tx.product ? (
                            <>
                              <div>{tx.product.name}</div>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{tx.product.sku}</div>
                            </>
                          ) : "Deleted Product"}
                        </td>
                        <td>
                          <span className={`status-badge ${tx.type === "IN" ? "received" : tx.type === "OUT" ? "cancelled" : "pending"}`}>
                            {tx.type}
                          </span>
                        </td>
                        <td style={{ fontWeight: "700" }}>{tx.quantity}</td>
                        <td>{tx.previousStock ?? tx.previousQuantity ?? "-"}</td>
                        <td>{tx.newStock ?? tx.newQuantity ?? "-"}</td>
                        <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          {tx.referenceId ? `${tx.referenceType || "REF"}: ${tx.referenceId}` : "MANUAL"}
                        </td>
                        <td>{tx.notes || tx.note || <span style={{ color: "var(--text-muted)" }}>No notes</span>}</td>
                        <td>{new Date(tx.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StaffInventory;

import React, { useState, useEffect } from "react";
import { getSales, createSale } from "../../services/salesService";
import { getProducts } from "../../services/productService";
import { getCustomers } from "../../services/customerService";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Tab state: "list" or "create"
  const [activeTab, setActiveTab] = useState("list");

  // POS State
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedItems, setSelectedItems] = useState([]); // { product: {}, quantity: 1 }
  const [saleStatus, setSaleStatus] = useState("COMPLETED");

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  
  // Search
  const [productSearch, setProductSearch] = useState("");
  const [salesSearch, setSalesSearch] = useState("");

  // Detail Modal
  const [detailSale, setDetailSale] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchSalesData = async () => {
    setLoading(true);
    setError("");
    try {
      const salesRes = await getSales();
      const prodRes = await getProducts({ limit: 100 });
      const custRes = await getCustomers();

      if (salesRes.success) setSales(salesRes.data);
      if (prodRes.success) setProducts(prodRes.data.filter(p => p.status === "ACTIVE"));
      if (custRes.success) setCustomers(custRes.data.filter(c => c.status === "ACTIVE"));
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the server to load sales records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  const addToCart = (product) => {
    if (product.quantity <= 0) {
      alert("This product is out of stock!");
      return;
    }
    const existingIndex = selectedItems.findIndex(item => item.product._id === product._id);
    if (existingIndex > -1) {
      const updated = [...selectedItems];
      if (updated[existingIndex].quantity >= product.quantity) {
        alert(`Cannot add more. Only ${product.quantity} units are available in stock.`);
        return;
      }
      updated[existingIndex].quantity += 1;
      setSelectedItems(updated);
    } else {
      setSelectedItems([...selectedItems, { product, quantity: 1 }]);
    }
  };

  const updateCartQty = (productId, delta) => {
    const item = selectedItems.find(i => i.product._id === productId);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      setSelectedItems(selectedItems.filter(i => i.product._id !== productId));
    } else {
      if (delta > 0 && newQty > item.product.quantity) {
        alert(`Cannot add more. Only ${item.product.quantity} units are available in stock.`);
        return;
      }
      setSelectedItems(selectedItems.map(i => 
        i.product._id === productId ? { ...i, quantity: newQty } : i
      ));
    }
  };

  const removeFromCart = (productId) => {
    setSelectedItems(selectedItems.filter(i => i.product._id !== productId));
  };

  const calculateSubtotal = () => {
    return selectedItems.reduce((sum, item) => sum + (item.quantity * item.product.sellingPrice), 0);
  };

  const handleCreateSaleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) {
      setActionError("Please select a customer.");
      return;
    }
    if (selectedItems.length === 0) {
      setActionError("Please add at least one product to the sale invoice.");
      return;
    }

    setActionLoading(true);
    setActionError("");

    try {
      const saleItems = selectedItems.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        sellingPrice: item.product.sellingPrice,
        total: item.quantity * item.product.sellingPrice
      }));

      const grandTotal = calculateSubtotal();

      const saleData = {
        customer: selectedCustomer,
        items: saleItems,
        grandTotal,
        status: saleStatus
      };

      const res = await createSale(saleData);
      if (res && res.success) {
        // Reset POS
        setSelectedCustomer("");
        setSelectedItems([]);
        setSaleStatus("COMPLETED");
        setActiveTab("list");
        fetchSalesData();
      } else {
        setActionError(res.message || "Failed to create sales order.");
      }
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || "Server error while saving sales record.");
    } finally {
      setActionLoading(false);
    }
  };

  const openDetails = (sale) => {
    setDetailSale(sale);
    setIsDetailOpen(true);
  };

  // Filters
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredSales = sales.filter(s => {
    const custName = s.customer ? s.customer.name.toLowerCase() : "";
    const saleId = s._id.toLowerCase();
    return custName.includes(salesSearch.toLowerCase()) || saleId.includes(salesSearch.toLowerCase());
  });

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div className="page-header">
        <div className="page-title-area">
          <h2>Sales Orders</h2>
          <p>Register new customer sales and audit transaction logs.</p>
        </div>
        <div className="action-btn-group">
          <button 
            className={`btn ${activeTab === "list" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("list")}
          >
            📋 Sales Logs
          </button>
          <button 
            className={`btn ${activeTab === "create" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => {
              setActionError("");
              setActiveTab("create");
            }}
          >
            ➕ Register New Sale
          </button>
        </div>
      </div>

      {loading ? (
        <Loading message="Loading sales registry..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchSalesData} />
      ) : activeTab === "list" ? (
        // Sales Logs Tab
        <>
          <div className="filter-bar">
            <div className="search-input-wrapper">
              <span className="search-input-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search sales by Customer name or Order ID..." 
                className="search-input"
                value={salesSearch}
                onChange={(e) => setSalesSearch(e.target.value)}
              />
            </div>
          </div>

          {filteredSales.length === 0 ? (
            <div className="card empty-state">
              <span className="empty-state-icon">💵</span>
              <h3 className="empty-state-title">No Sales Logged</h3>
              <p className="empty-state-desc">Register a new sale to see it listed here.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Order Date</th>
                    <th>Order ID</th>
                    <th>Customer Name</th>
                    <th>Items Count</th>
                    <th>Grand Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr key={sale._id}>
                      <td>{new Date(sale.createdAt).toLocaleDateString()}</td>
                      <td style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                        {sale._id}
                      </td>
                      <td style={{ fontWeight: "700" }}>{sale.customer ? sale.customer.name : "Walk-in Customer"}</td>
                      <td>{sale.items ? sale.items.length : 0} items</td>
                      <td style={{ fontWeight: "800" }}>${sale.grandTotal.toLocaleString()}</td>
                      <td>
                        <StatusBadge status={sale.status} />
                      </td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => openDetails(sale)}>
                          👁️ View Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        // POS / Create Sale Tab
        <div className="sales-layout">
          {/* Left panel: Product Selection */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 className="chart-title">Select Products</h3>
              <div className="search-input-wrapper" style={{ maxWidth: "240px" }}>
                <span className="search-input-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Filter by name or SKU..." 
                  className="search-input"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="empty-state">No active products found.</div>
            ) : (
              <div className="items-grid">
                {filteredProducts.map((p) => {
                  const isOut = p.quantity === 0;
                  const isLow = p.quantity > 0 && p.quantity <= p.minimumStock;
                  
                  return (
                    <div 
                      key={p._id} 
                      className={`product-item-card ${isOut ? "out-of-stock" : isLow ? "low-stock" : ""}`}
                      onClick={() => !isOut && addToCart(p)}
                    >
                      <div>
                        <div className="product-item-name">{p.name}</div>
                        <div className="product-item-sku">{p.sku}</div>
                      </div>
                      <div>
                        <div className="product-item-qty" style={{ color: isOut ? "var(--danger)" : isLow ? "var(--warning)" : "var(--text-muted)" }}>
                          {isOut ? "Out of Stock" : `Qty: ${p.quantity}`}
                        </div>
                        <div className="product-item-price">${p.sellingPrice.toLocaleString()}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right panel: Order Summary */}
          <div className="card order-summary-panel">
            <h3 className="chart-title">Sales Invoice</h3>
            {actionError && <div className="login-error" style={{ marginTop: "12px" }}>⚠️ {actionError}</div>}

            <form onSubmit={handleCreateSaleSubmit} style={{ display: "flex", flexDirection: "column", flexGrow: 1, marginTop: "16px" }}>
              <div className="form-group">
                <label className="form-label">Customer *</label>
                <select 
                  className="form-select"
                  required
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>)}
                </select>
              </div>

              {/* Added items list */}
              <div className="order-items-list">
                {selectedItems.length === 0 ? (
                  <div className="empty-state" style={{ padding: "20px 0" }}>
                    <span style={{ fontSize: "2rem" }}>🛒</span>
                    <p style={{ fontSize: "0.85rem" }}>Invoice is empty. Click on products to add.</p>
                  </div>
                ) : (
                  selectedItems.map((item) => (
                    <div key={item.product._id} className="order-item-row">
                      <div className="order-item-details">
                        <span style={{ fontWeight: "600", fontSize: "0.85rem" }}>{item.product.name}</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>SKU: {item.product.sku}</span>
                        <div className="order-item-qty-selector">
                          <button type="button" className="qty-btn" onClick={() => updateCartQty(item.product._id, -1)}>-</button>
                          <span className="qty-value">{item.quantity}</span>
                          <button type="button" className="qty-btn" onClick={() => updateCartQty(item.product._id, 1)}>+</button>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span className="order-item-total">${(item.quantity * item.product.sellingPrice).toLocaleString()}</span>
                        <div>
                          <button 
                            type="button" 
                            style={{ background: "none", border: "none", color: "var(--danger)", fontSize: "0.8rem", cursor: "pointer", marginTop: "4px" }}
                            onClick={() => removeFromCart(item.product._id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pricing breakdown */}
              <div className="order-pricing">
                <div className="pricing-row">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toLocaleString()}</span>
                </div>
                <div className="pricing-row">
                  <span>Sales Tax (0%):</span>
                  <span>$0.00</span>
                </div>
                <div className="pricing-row total">
                  <span>Grand Total:</span>
                  <span>${calculateSubtotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Sales Status */}
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label className="form-label">Sales Status</label>
                <select 
                  className="form-select"
                  value={saleStatus}
                  onChange={(e) => setSaleStatus(e.target.value)}
                >
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: "100%", padding: "14px" }}
                disabled={actionLoading || selectedItems.length === 0}
              >
                {actionLoading ? "Registering Sale..." : "💵 Checkout & Complete"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Detail Invoice Modal */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Sales Invoice Details" size="large">
        {detailSale && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--border)", paddingBottom: "16px", marginBottom: "16px" }}>
              <div>
                <h4 style={{ color: "var(--primary)", fontWeight: "800" }}>SmartStock Invoice</h4>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>Order ID: {detailSale._id}</p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Date: {new Date(detailSale.createdAt).toLocaleString()}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <StatusBadge status={detailSale.status} />
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <h5 style={{ fontWeight: "700", marginBottom: "6px" }}>Customer Details</h5>
              {detailSale.customer ? (
                <div style={{ fontSize: "0.875rem" }}>
                  <div><strong>Name:</strong> {detailSale.customer.name}</div>
                  <div><strong>Phone:</strong> {detailSale.customer.phone}</div>
                  {detailSale.customer.email && <div><strong>Email:</strong> {detailSale.customer.email}</div>}
                </div>
              ) : (
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Walk-in Customer</p>
              )}
            </div>

            <h5 style={{ fontWeight: "700", marginBottom: "10px" }}>Invoice Items</h5>
            <div className="table-container" style={{ border: "1px solid var(--border)", boxShadow: "none" }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Product SKU</th>
                    <th>Product Name</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th style={{ textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {detailSale.items && detailSale.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.product ? item.product.sku : "N/A"}</td>
                      <td>{item.product ? item.product.name : "Deleted Product"}</td>
                      <td>${item.sellingPrice.toLocaleString()}</td>
                      <td>{item.quantity}</td>
                      <td style={{ textAlign: "right", fontWeight: "700" }}>${item.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <div style={{ width: "240px", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.9rem" }}>
                  <span>Subtotal:</span>
                  <span>${detailSale.grandTotal.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "800", fontSize: "1.1rem", borderTop: "1px dashed var(--border)", paddingTop: "8px", marginTop: "4px" }}>
                  <span>Grand Total:</span>
                  <span style={{ color: "var(--primary)" }}>${detailSale.grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ margin: "24px -24px -24px -24px" }}>
              <button className="btn btn-secondary" onClick={() => setIsDetailOpen(false)}>
                Close Invoice
              </button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                🖨️ Print Invoice
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Sales;

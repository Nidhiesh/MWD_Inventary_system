import React, { useState, useEffect } from "react";
import { getPurchases, createPurchase } from "../../services/purchaseService";
import { getProducts } from "../../services/productService";
import { getSuppliers } from "../../services/supplierService";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";

const StaffPurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Tab state: "list" or "create"
  const [activeTab, setActiveTab] = useState("list");

  // Purchase order creator state
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedItems, setSelectedItems] = useState([]); // { product: {}, quantity: 1, costPrice: 0 }
  const [purchaseStatus, setPurchaseStatus] = useState("RECEIVED");

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  
  // Search filters
  const [productSearch, setProductSearch] = useState("");
  const [purchasesSearch, setPurchasesSearch] = useState("");

  // Detail Modal
  const [detailPurchase, setDetailPurchase] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchPurchasesData = async () => {
    setLoading(true);
    setError("");
    try {
      const purchaseRes = await getPurchases();
      const prodRes = await getProducts({ limit: 100 });
      const supRes = await getSuppliers();

      if (purchaseRes.success) setPurchases(purchaseRes.data);
      if (prodRes.success) setProducts(prodRes.data.filter(p => p.status === "ACTIVE"));
      if (supRes.success) setSuppliers(supRes.data.filter(s => s.status === "ACTIVE"));
    } catch (err) {
      console.error(err);
      setError("Unable to load purchases database from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchasesData();
  }, []);

  const addToCart = (product) => {
    const existingIndex = selectedItems.findIndex(item => item.product._id === product._id);
    if (existingIndex > -1) {
      const updated = [...selectedItems];
      updated[existingIndex].quantity += 1;
      setSelectedItems(updated);
    } else {
      setSelectedItems([...selectedItems, { 
        product, 
        quantity: 1, 
        costPrice: product.purchasePrice
      }]);
    }
  };

  const updateCartQty = (productId, delta) => {
    const item = selectedItems.find(i => i.product._id === productId);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      setSelectedItems(selectedItems.filter(i => i.product._id !== productId));
    } else {
      setSelectedItems(selectedItems.map(i => 
        i.product._id === productId ? { ...i, quantity: newQty } : i
      ));
    }
  };

  const updateCartPrice = (productId, price) => {
    setSelectedItems(selectedItems.map(i => 
      i.product._id === productId ? { ...i, costPrice: Number(price) } : i
    ));
  };

  const removeFromCart = (productId) => {
    setSelectedItems(selectedItems.filter(i => i.product._id !== productId));
  };

  const calculateSubtotal = () => {
    return selectedItems.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
  };

  const handleCreatePurchaseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSupplier) {
      setActionError("Please select a supplier.");
      return;
    }
    if (selectedItems.length === 0) {
      setActionError("Please add at least one product to the purchase order.");
      return;
    }

    setActionLoading(true);
    setActionError("");

    try {
      const purchaseItems = selectedItems.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        costPrice: item.costPrice,
        total: item.quantity * item.costPrice
      }));

      const grandTotal = calculateSubtotal();

      const purchaseData = {
        supplier: selectedSupplier,
        items: purchaseItems,
        grandTotal,
        status: purchaseStatus
      };

      const res = await createPurchase(purchaseData);
      if (res && res.success) {
        setSelectedSupplier("");
        setSelectedItems([]);
        setPurchaseStatus("RECEIVED");
        setActiveTab("list");
        fetchPurchasesData();
      } else {
        setActionError(res.message || "Failed to create purchase order.");
      }
    } catch (err) {
      console.error(err);
      setActionError(
        err.response?.data?.message || 
        "The backend server failed to process this request. Note: There is an unresolved model reference in the backend's purchaseController when status is RECEIVED."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openDetails = (purchase) => {
    setDetailPurchase(purchase);
    setIsDetailOpen(true);
  };

  // Filters
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredPurchases = purchases.filter(p => {
    const supplierName = p.supplier ? p.supplier.companyName.toLowerCase() : "";
    const purchaseId = p._id.toLowerCase();
    return supplierName.includes(purchasesSearch.toLowerCase()) || purchaseId.includes(purchasesSearch.toLowerCase());
  });

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div className="page-header">
        <div className="page-title-area">
          <h2>Purchase Orders</h2>
          <p>Register incoming supplier product shipments and verify receipts.</p>
        </div>
        <div className="action-btn-group">
          <button 
            className={`btn ${activeTab === "list" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("list")}
          >
            📋 Purchase Logs
          </button>
          <button 
            className={`btn ${activeTab === "create" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => {
              setActionError("");
              setActiveTab("create");
            }}
          >
            ➕ Register New Purchase
          </button>
        </div>
      </div>

      {loading ? (
        <Loading message="Loading purchases database..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchPurchasesData} />
      ) : activeTab === "list" ? (
        // Purchases List Tab
        <>
          <div className="filter-bar">
            <div className="search-input-wrapper">
              <span className="search-input-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search purchases by Supplier company or Order ID..." 
                className="search-input"
                value={purchasesSearch}
                onChange={(e) => setPurchasesSearch(e.target.value)}
              />
            </div>
          </div>

          {filteredPurchases.length === 0 ? (
            <div className="card empty-state">
              <span className="empty-state-icon">🛒</span>
              <h3 className="empty-state-title">No Purchases Logged</h3>
              <p className="empty-state-desc">Register a new purchase receipt to see it listed here.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Purchase ID</th>
                    <th>Supplier</th>
                    <th>Items Count</th>
                    <th>Grand Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPurchases.map((purchase) => (
                    <tr key={purchase._id}>
                      <td>{new Date(purchase.createdAt).toLocaleDateString()}</td>
                      <td style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                        {purchase._id}
                      </td>
                      <td style={{ fontWeight: "700" }}>{purchase.supplier ? purchase.supplier.companyName : "Unknown Supplier"}</td>
                      <td>{purchase.items ? purchase.items.length : 0} items</td>
                      <td style={{ fontWeight: "800" }}>${purchase.grandTotal.toLocaleString()}</td>
                      <td>
                        <StatusBadge status={purchase.status} />
                      </td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => openDetails(purchase)}>
                          👁️ View Details
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
        // Create Purchase order Form
        <div className="sales-layout">
          {/* Left panel: Product Selection */}
          <div className="card">
            <div style={{ display: "flex", justify: "space-between", alignItems: "center", marginBottom: "16px" }}>
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
                  const isLow = p.quantity <= p.minimumStock;
                  return (
                    <div 
                      key={p._id} 
                      className={`product-item-card ${isLow ? "low-stock" : ""}`}
                      onClick={() => addToCart(p)}
                    >
                      <div>
                        <div className="product-item-name">{p.name}</div>
                        <div className="product-item-sku">{p.sku}</div>
                      </div>
                      <div>
                        <div className="product-item-qty">Stock: {p.quantity}</div>
                        <div className="product-item-price">${p.purchasePrice.toLocaleString()}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right panel: Order Summary */}
          <div className="card order-summary-panel">
            <h3 className="chart-title">Purchase Details</h3>
            {actionError && <div className="login-error" style={{ marginTop: "12px" }}>⚠️ {actionError}</div>}

            <form onSubmit={handleCreatePurchaseSubmit} style={{ display: "flex", flexDirection: "column", flexGrow: 1, marginTop: "16px" }}>
              <div className="form-group">
                <label className="form-label">Supplier *</label>
                <select 
                  className="form-select"
                  required
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                >
                  <option value="">-- Choose Supplier --</option>
                  {suppliers.map(s => <option key={s._id} value={s._id}>{s.companyName}</option>)}
                </select>
              </div>

              {/* Added items list */}
              <div className="order-items-list">
                {selectedItems.length === 0 ? (
                  <div className="empty-state" style={{ padding: "20px 0" }}>
                    <span style={{ fontSize: "2rem" }}>🛒</span>
                    <p style={{ fontSize: "0.85rem" }}>Order is empty. Click on products to add.</p>
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
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-end" }}>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>$</span>
                          <input 
                            type="number"
                            style={{ width: "65px", padding: "2px 4px", fontSize: "0.85rem", border: "1px solid var(--border)", borderRadius: "4px" }}
                            value={item.costPrice}
                            min="0"
                            step="0.01"
                            onChange={(e) => updateCartPrice(item.product._id, e.target.value)}
                          />
                        </div>
                        <span className="order-item-total" style={{ display: "block", marginTop: "6px" }}>
                          ${(item.quantity * item.costPrice).toLocaleString()}
                        </span>
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
                  <span>Total Cost:</span>
                  <span>${calculateSubtotal().toLocaleString()}</span>
                </div>
                <div className="pricing-row total">
                  <span>Grand Total:</span>
                  <span>${calculateSubtotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Purchase Status */}
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label className="form-label">Purchase Status</label>
                <select 
                  className="form-select"
                  value={purchaseStatus}
                  onChange={(e) => setPurchaseStatus(e.target.value)}
                >
                  <option value="RECEIVED">RECEIVED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: "100%", padding: "14px" }}
                disabled={actionLoading || selectedItems.length === 0}
              >
                {actionLoading ? "Registering Purchase..." : "📥 Receive Stock"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Detail Purchase Modal */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Purchase Order Receipt" size="large">
        {detailPurchase && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--border)", paddingBottom: "16px", marginBottom: "16px" }}>
              <div>
                <h4 style={{ color: "var(--primary)", fontWeight: "800" }}>SmartStock Purchase Order</h4>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>Receipt ID: {detailPurchase._id}</p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Date: {new Date(detailPurchase.createdAt).toLocaleString()}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <StatusBadge status={detailPurchase.status} />
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <h5 style={{ fontWeight: "700", marginBottom: "6px" }}>Supplier Details</h5>
              {detailPurchase.supplier ? (
                <div style={{ fontSize: "0.875rem" }}>
                  <div><strong>Company:</strong> {detailPurchase.supplier.companyName}</div>
                  <div><strong>Contact Person:</strong> {detailPurchase.supplier.phone}</div>
                  {detailPurchase.supplier.email && <div><strong>Email:</strong> {detailPurchase.supplier.email}</div>}
                </div>
              ) : (
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Unknown Supplier</p>
              )}
            </div>

            <h5 style={{ fontWeight: "700", marginBottom: "10px" }}>Shipment Items</h5>
            <div className="table-container" style={{ border: "1px solid var(--border)", boxShadow: "none" }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Product SKU</th>
                    <th>Product Name</th>
                    <th>Cost Price</th>
                    <th>Quantity</th>
                    <th style={{ textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {detailPurchase.items && detailPurchase.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.product ? item.product.sku : "N/A"}</td>
                      <td>{item.product ? item.product.name : "Deleted Product"}</td>
                      <td>${item.costPrice.toLocaleString()}</td>
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
                  <span>${detailPurchase.grandTotal.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "800", fontSize: "1.1rem", borderTop: "1px dashed var(--border)", paddingTop: "8px", marginTop: "4px" }}>
                  <span>Grand Total:</span>
                  <span style={{ color: "var(--primary)" }}>${detailPurchase.grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ margin: "24px -24px -24px -24px" }}>
              <button className="btn btn-secondary" onClick={() => setIsDetailOpen(false)}>
                Close Receipt
              </button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                🖨️ Print Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StaffPurchases;

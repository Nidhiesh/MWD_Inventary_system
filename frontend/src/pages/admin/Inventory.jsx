import React, { useState, useEffect } from "react";
import { getProducts, updateProduct } from "../../services/productService";
import { getInventoryTransactions } from "../../services/inventoryService";
import { getSuppliers } from "../../services/supplierService";
import { getCustomers } from "../../services/customerService";
import { createPurchase } from "../../services/purchaseService";
import { createSale } from "../../services/salesService";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search
  const [search, setSearch] = useState("");

  // Modals
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [isStockOutOpen, setIsStockOutOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  // Form Fields
  const [inFields, setInFields] = useState({
    productId: "",
    supplierId: "",
    quantity: 1,
    costPrice: 0
  });

  const [outFields, setOutFields] = useState({
    productId: "",
    customerId: "",
    quantity: 1,
    sellingPrice: 0
  });

  const [adjustFields, setAdjustFields] = useState({
    productId: "",
    newQuantity: 0,
    minimumStock: 10
  });

  const fetchInventoryData = async () => {
    setLoading(true);
    setError("");
    try {
      const prodRes = await getProducts({ limit: 100 });
      const txRes = await getInventoryTransactions();
      const supRes = await getSuppliers();
      const custRes = await getCustomers();

      if (prodRes.success) setProducts(prodRes.data);
      if (txRes.success) setTransactions(txRes.data);
      if (supRes.success) setSuppliers(supRes.data);
      if (custRes.success) setCustomers(custRes.data);
      
    } catch (err) {
      console.error(err);
      setError("Unable to load inventory data. Check connection to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const openStockInModal = (product = null) => {
    setActionError("");
    const prodId = product ? product._id : products[0]?._id || "";
    const activeProd = products.find(p => p._id === prodId);
    setInFields({
      productId: prodId,
      supplierId: suppliers[0]?._id || "",
      quantity: 1,
      costPrice: activeProd ? activeProd.purchasePrice : 0
    });
    setIsStockInOpen(true);
  };

  const openStockOutModal = (product = null) => {
    setActionError("");
    const prodId = product ? product._id : products[0]?._id || "";
    const activeProd = products.find(p => p._id === prodId);
    setOutFields({
      productId: prodId,
      customerId: customers[0]?._id || "",
      quantity: 1,
      sellingPrice: activeProd ? activeProd.sellingPrice : 0
    });
    setIsStockOutOpen(true);
  };

  const openAdjustModal = (product) => {
    setActionError("");
    setSelectedProduct(product);
    setAdjustFields({
      productId: product._id,
      newQuantity: product.quantity,
      minimumStock: product.minimumStock
    });
    setIsAdjustOpen(true);
  };

  const handleStockInSubmit = async (e) => {
    e.preventDefault();
    if (!inFields.supplierId) {
      setActionError("Supplier is required to complete Stock IN.");
      return;
    }
    setActionLoading(true);
    setActionError("");
    try {
      const activeProd = products.find(p => p._id === inFields.productId);
      // Create a purchase to register Stock IN
      const purchaseData = {
        supplier: inFields.supplierId,
        items: [
          {
            product: inFields.productId,
            quantity: Number(inFields.quantity),
            costPrice: Number(inFields.costPrice),
            total: Number(inFields.quantity) * Number(inFields.costPrice)
          }
        ],
        grandTotal: Number(inFields.quantity) * Number(inFields.costPrice),
        status: "RECEIVED"
      };

      // Call API
      const res = await createPurchase(purchaseData);
      if (res && res.success) {
        setIsStockInOpen(false);
        fetchInventoryData();
      } else {
        setActionError(res.message || "Failed to submit Purchase Stock IN.");
      }
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || "Server error during Stock IN registration. Note: Check backend console for missing requires.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStockOutSubmit = async (e) => {
    e.preventDefault();
    if (!outFields.customerId) {
      setActionError("Customer is required to complete Stock OUT.");
      return;
    }
    
    // Check stock limit on frontend
    const activeProd = products.find(p => p._id === outFields.productId);
    if (activeProd && activeProd.quantity < Number(outFields.quantity)) {
      setActionError(`Insufficient stock. Available: ${activeProd.quantity}, Requested: ${outFields.quantity}`);
      return;
    }

    setActionLoading(true);
    setActionError("");
    try {
      // Create a sale to register Stock OUT
      const saleData = {
        customer: outFields.customerId,
        items: [
          {
            product: outFields.productId,
            quantity: Number(outFields.quantity),
            sellingPrice: Number(outFields.sellingPrice),
            total: Number(outFields.quantity) * Number(outFields.sellingPrice)
          }
        ],
        grandTotal: Number(outFields.quantity) * Number(outFields.sellingPrice),
        status: "COMPLETED"
      };

      // Call API
      const res = await createSale(saleData);
      if (res && res.success) {
        setIsStockOutOpen(false);
        fetchInventoryData();
      } else {
        setActionError(res.message || "Failed to submit Sale Stock OUT.");
      }
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || "Server error during Stock OUT registration.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError("");
    try {
      const res = await updateProduct(adjustFields.productId, {
        quantity: Number(adjustFields.newQuantity),
        minimumStock: Number(adjustFields.minimumStock)
      });
      if (res && res.success) {
        setIsAdjustOpen(false);
        fetchInventoryData();
      } else {
        setActionError(res.message || "Failed to adjust product quantity.");
      }
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || "Server error while adjusting quantity.");
    } finally {
      setActionLoading(false);
    }
  };

  // Local calculations
  const totalStockQty = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const outOfStockCount = products.filter(p => p.quantity === 0).length;
  const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity <= p.minimumStock).length;
  const totalVal = products.reduce((sum, p) => sum + ((p.quantity || 0) * (p.purchasePrice || 0)), 0);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div className="page-header">
        <div className="page-title-area">
          <h2>Inventory Dashboard</h2>
          <p>Supervise stock levels, adjust quantities, and view transaction audits.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn btn-secondary" onClick={() => openStockInModal()}>
            📥 Stock IN
          </button>
          <button className="btn btn-danger" onClick={() => openStockOutModal()}>
            📤 Stock OUT
          </button>
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

        <div className="kpi-card">
          <div className="kpi-icon success">💰</div>
          <div className="kpi-details">
            <span className="kpi-title">Asset Net Value</span>
            <span className="kpi-value">${totalVal.toLocaleString()}</span>
            <span className="kpi-info">Based on purchase prices</span>
          </div>
        </div>
      </div>

      {loading ? (
        <Loading message="Loading inventory state..." />
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
                    <th>Action</th>
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
                        <td>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => openAdjustModal(p)}
                          >
                            ⚙️ Adjust
                          </button>
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

      {/* Stock IN Modal */}
      <Modal isOpen={isStockInOpen} onClose={() => setIsStockInOpen(false)} title="Stock IN Operation (Log Purchase)">
        <form onSubmit={handleStockInSubmit}>
          {actionError && <div className="login-error">⚠️ {actionError}</div>}
          
          <div className="form-group">
            <label className="form-label">Select Product *</label>
            <select 
              name="productId"
              className="form-select"
              required
              value={inFields.productId}
              onChange={(e) => {
                const val = e.target.value;
                const active = products.find(p => p._id === val);
                setInFields(prev => ({
                  ...prev,
                  productId: val,
                  costPrice: active ? active.purchasePrice : 0
                }));
              }}
            >
              {products.map(p => <option key={p._id} value={p._id}>{p.name} (SKU: {p.sku})</option>)}
            </select>
          </div>

          <div className="form-group" style={{ marginTop: "12px" }}>
            <label className="form-label">Select Supplier *</label>
            <select 
              name="supplierId"
              className="form-select"
              required
              value={inFields.supplierId}
              onChange={(e) => setInFields(prev => ({ ...prev, supplierId: e.target.value }))}
            >
              {suppliers.length === 0 ? (
                <option value="">No suppliers registered. Create one first!</option>
              ) : (
                suppliers.map(s => <option key={s._id} value={s._id}>{s.companyName}</option>)
              )}
            </select>
          </div>

          <div className="form-grid form-grid-2" style={{ marginTop: "12px" }}>
            <div className="form-group">
              <label className="form-label">Purchase Quantity *</label>
              <input 
                type="number"
                name="quantity"
                min="1"
                required
                className="form-input"
                value={inFields.quantity}
                onChange={(e) => setInFields(prev => ({ ...prev, quantity: Number(e.target.value) }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cost Price per unit ($) *</label>
              <input 
                type="number"
                name="costPrice"
                min="0"
                step="0.01"
                required
                className="form-input"
                value={inFields.costPrice}
                onChange={(e) => setInFields(prev => ({ ...prev, costPrice: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div style={{ marginTop: "16px", padding: "12px", background: "var(--background)", borderRadius: "var(--radius-md)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700" }}>
              <span>Grand Total:</span>
              <span style={{ color: "var(--primary)" }}>${(inFields.quantity * inFields.costPrice).toLocaleString()}</span>
            </div>
          </div>

          <div className="modal-footer" style={{ margin: "20px -24px -24px -24px" }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setIsStockInOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={actionLoading}
            >
              {actionLoading ? "Registering..." : "Submit Stock IN"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock OUT Modal */}
      <Modal isOpen={isStockOutOpen} onClose={() => setIsStockOutOpen(false)} title="Stock OUT Operation (Log Sale)">
        <form onSubmit={handleStockOutSubmit}>
          {actionError && <div className="login-error">⚠️ {actionError}</div>}
          
          <div className="form-group">
            <label className="form-label">Select Product *</label>
            <select 
              name="productId"
              className="form-select"
              required
              value={outFields.productId}
              onChange={(e) => {
                const val = e.target.value;
                const active = products.find(p => p._id === val);
                setOutFields(prev => ({
                  ...prev,
                  productId: val,
                  sellingPrice: active ? active.sellingPrice : 0
                }));
              }}
            >
              {products.map(p => <option key={p._id} value={p._id}>{p.name} (SKU: {p.sku})</option>)}
            </select>
          </div>

          <div className="form-group" style={{ marginTop: "12px" }}>
            <label className="form-label">Select Customer *</label>
            <select 
              name="customerId"
              className="form-select"
              required
              value={outFields.customerId}
              onChange={(e) => setOutFields(prev => ({ ...prev, customerId: e.target.value }))}
            >
              {customers.length === 0 ? (
                <option value="">No customers registered. Create one first!</option>
              ) : (
                customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)
              )}
            </select>
          </div>

          <div className="form-grid form-grid-2" style={{ marginTop: "12px" }}>
            <div className="form-group">
              <label className="form-label">Sales Quantity *</label>
              <input 
                type="number"
                name="quantity"
                min="1"
                required
                className="form-input"
                value={outFields.quantity}
                onChange={(e) => setOutFields(prev => ({ ...prev, quantity: Number(e.target.value) }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Selling Price per unit ($) *</label>
              <input 
                type="number"
                name="sellingPrice"
                min="0"
                step="0.01"
                required
                className="form-input"
                value={outFields.sellingPrice}
                onChange={(e) => setOutFields(prev => ({ ...prev, sellingPrice: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div style={{ marginTop: "16px", padding: "12px", background: "var(--background)", borderRadius: "var(--radius-md)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700" }}>
              <span>Grand Total:</span>
              <span style={{ color: "var(--success)" }}>${(outFields.quantity * outFields.sellingPrice).toLocaleString()}</span>
            </div>
          </div>

          <div className="modal-footer" style={{ margin: "20px -24px -24px -24px" }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setIsStockOutOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={actionLoading}
            >
              {actionLoading ? "Registering..." : "Submit Stock OUT"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Adjust Modal */}
      <Modal isOpen={isAdjustOpen} onClose={() => setIsAdjustOpen(false)} title={`Manual Adjust: ${selectedProduct?.name}`}>
        <form onSubmit={handleAdjustSubmit}>
          {actionError && <div className="login-error">⚠️ {actionError}</div>}
          
          <div className="form-group">
            <label className="form-label">Warehouse Stock Quantity *</label>
            <input 
              type="number"
              name="newQuantity"
              min="0"
              required
              className="form-input"
              value={adjustFields.newQuantity}
              onChange={(e) => setAdjustFields(prev => ({ ...prev, newQuantity: Number(e.target.value) }))}
            />
          </div>

          <div className="form-group" style={{ marginTop: "12px" }}>
            <label className="form-label">Minimum Stock Alert Threshold *</label>
            <input 
              type="number"
              name="minimumStock"
              min="0"
              required
              className="form-input"
              value={adjustFields.minimumStock}
              onChange={(e) => setAdjustFields(prev => ({ ...prev, minimumStock: Number(e.target.value) }))}
            />
          </div>

          <div className="modal-footer" style={{ margin: "20px -24px -24px -24px" }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setIsAdjustOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={actionLoading}
            >
              {actionLoading ? "Saving..." : "Save Adjustments"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;

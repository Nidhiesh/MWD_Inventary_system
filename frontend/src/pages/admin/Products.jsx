import React, { useState, useEffect } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";

const Products = () => {
  // Products states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesMap, setCategoriesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [limit] = useState(10);

  // Filter/Search states
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [lowStock, setLowStock] = useState(false);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  // Form states
  const [formFields, setFormFields] = useState({
    name: "",
    sku: "",
    category: "",
    description: "",
    purchasePrice: 0,
    sellingPrice: 0,
    quantity: 0,
    minimumStock: 10,
    warehouse: "Main Warehouse",
    status: "ACTIVE"
  });

  const fetchCategoriesList = async () => {
    try {
      const res = await getCategories({ limit: 100 });
      if (res && res.success) {
        setCategories(res.data);
        const mapping = {};
        res.data.forEach(cat => {
          mapping[cat._id] = cat.name;
        });
        setCategoriesMap(mapping);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchProductsList = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        limit,
        search: search || undefined,
        status: status || undefined,
        lowStock: lowStock ? "true" : undefined
      };
      const res = await getProducts(params);
      if (res && res.success) {
        setProducts(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
          setTotalProducts(res.pagination.total);
        }
      } else {
        setError(res.message || "Failed to load products list.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load products. Check connection to the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesList();
  }, []);

  useEffect(() => {
    fetchProductsList();
  }, [page, status, lowStock]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProductsList();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFields(prev => ({
      ...prev,
      [name]: name === "purchasePrice" || name === "sellingPrice" || name === "quantity" || name === "minimumStock"
        ? Number(value)
        : value
    }));
  };

  const openAddModal = () => {
    setActionError("");
    setFormFields({
      name: "",
      sku: "",
      category: categories[0]?._id || "",
      description: "",
      purchasePrice: 0,
      sellingPrice: 0,
      quantity: 0,
      minimumStock: 10,
      warehouse: "Main Warehouse",
      status: "ACTIVE"
    });
    setIsAddOpen(true);
  };

  const openEditModal = (product) => {
    setActionError("");
    setCurrentProduct(product);
    setFormFields({
      name: product.name || "",
      sku: product.sku || "",
      category: product.category || "",
      description: product.description || "",
      purchasePrice: product.purchasePrice || 0,
      sellingPrice: product.sellingPrice || 0,
      quantity: product.quantity || 0,
      minimumStock: product.minimumStock || 10,
      warehouse: product.warehouse || "Main Warehouse",
      status: product.status || "ACTIVE"
    });
    setIsEditOpen(true);
  };

  const openDeleteModal = (product) => {
    setActionError("");
    setCurrentProduct(product);
    setIsDeleteOpen(true);
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!formFields.category) {
      setActionError("Product category is required. Please create a category first.");
      return;
    }
    setActionLoading(true);
    setActionError("");
    try {
      const res = await createProduct(formFields);
      if (res && res.success) {
        setIsAddOpen(false);
        fetchProductsList();
      } else {
        setActionError(res.message || "Failed to create product.");
      }
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || "Server error while creating product.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditProductSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError("");
    try {
      const res = await updateProduct(currentProduct._id, formFields);
      if (res && res.success) {
        setIsEditOpen(false);
        fetchProductsList();
      } else {
        setActionError(res.message || "Failed to update product.");
      }
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || "Server error while updating product.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProductConfirm = async () => {
    setActionLoading(true);
    setActionError("");
    try {
      const res = await deleteProduct(currentProduct._id);
      if (res && res.success) {
        setIsDeleteOpen(false);
        fetchProductsList();
      } else {
        setActionError(res.message || "Failed to delete product.");
      }
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || "Server error while deleting product.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div className="page-header">
        <div className="page-title-area">
          <h2>Products Management</h2>
          <p>Create, update, and manage your inventory items.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          ➕ Add Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <form onSubmit={handleSearchSubmit} className="search-input-wrapper">
          <span className="search-input-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search by SKU or name..." 
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <select 
          className="filter-select"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active Only</option>
          <option value="INACTIVE">Inactive Only</option>
        </select>

        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.875rem", cursor: "pointer" }}>
          <input 
            type="checkbox" 
            checked={lowStock}
            onChange={(e) => {
              setLowStock(e.target.checked);
              setPage(1);
            }}
          />
          ⚠️ Show Low Stock Only
        </label>
      </div>

      {/* Main List */}
      {loading ? (
        <Loading message="Loading product list..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchProductsList} />
      ) : products.length === 0 ? (
        <div className="card empty-state">
          <span className="empty-state-icon">📦</span>
          <h3 className="empty-state-title">No Products Found</h3>
          <p className="empty-state-desc">Try modifying your filters or add a new product to get started.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Warehouse</th>
                  <th>Quantity</th>
                  <th>Min Stock</th>
                  <th>Buy Price</th>
                  <th>Sell Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const isLow = product.quantity > 0 && product.quantity <= product.minimumStock;
                  const isOut = product.quantity === 0;
                  
                  return (
                    <tr 
                      key={product._id} 
                      style={{ 
                        backgroundColor: isOut ? "#FFF5F5" : isLow ? "#FFFDF5" : "inherit"
                      }}
                    >
                      <td style={{ fontWeight: "700" }}>{product.sku}</td>
                      <td>
                        <div style={{ fontWeight: "600" }}>{product.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {product.description || "No description"}
                        </div>
                      </td>
                      <td>{categoriesMap[product.category] || "Loading..."}</td>
                      <td>{product.warehouse}</td>
                      <td style={{ fontWeight: "700" }}>
                        {product.quantity}
                        {isOut && <span style={{ marginLeft: "6px", color: "var(--danger)", fontSize: "0.75rem" }}>(Out)</span>}
                        {isLow && <span style={{ marginLeft: "6px", color: "var(--warning)", fontSize: "0.75rem" }}>(Low)</span>}
                      </td>
                      <td>{product.minimumStock}</td>
                      <td>${product.purchasePrice.toLocaleString()}</td>
                      <td>${product.sellingPrice.toLocaleString()}</td>
                      <td>
                        <StatusBadge status={product.status} />
                      </td>
                      <td>
                        <div className="action-btn-group">
                          <button 
                            className="icon-btn" 
                            title="Edit"
                            onClick={() => openEditModal(product)}
                          >
                            ✏️
                          </button>
                          <button 
                            className="icon-btn delete" 
                            title="Delete"
                            onClick={() => openDeleteModal(product)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* Pagination footer */}
            <div className="pagination-container">
              <span className="pagination-text">
                Showing Page {page} of {totalPages} ({totalProducts} total products)
              </span>
              <div className="pagination-buttons">
                <button 
                  className="btn btn-secondary btn-sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <button 
                  className="btn btn-secondary btn-sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Product Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Product">
        <form onSubmit={handleAddProductSubmit}>
          {actionError && <div className="login-error">⚠️ {actionError}</div>}
          
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input 
                type="text" 
                name="name" 
                className="form-input" 
                required 
                value={formFields.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">SKU Code *</label>
              <input 
                type="text" 
                name="sku" 
                className="form-input" 
                required 
                placeholder="e.g. LAP-ASUS-X515"
                value={formFields.sku}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-grid form-grid-2" style={{ marginTop: "12px" }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select 
                name="category" 
                className="form-select" 
                required 
                value={formFields.category}
                onChange={handleInputChange}
              >
                {categories.length === 0 ? (
                  <option value="">No categories. Create one first!</option>
                ) : (
                  categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)
                )}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Warehouse Name</label>
              <input 
                type="text" 
                name="warehouse" 
                className="form-input" 
                value={formFields.warehouse}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: "12px" }}>
            <label className="form-label">Description</label>
            <textarea 
              name="description" 
              className="form-textarea" 
              rows="2"
              value={formFields.description}
              onChange={handleInputChange}
            ></textarea>
          </div>

          <div className="form-grid form-grid-2" style={{ marginTop: "12px" }}>
            <div className="form-group">
              <label className="form-label">Purchase Price ($) *</label>
              <input 
                type="number" 
                name="purchasePrice" 
                min="0"
                step="0.01"
                className="form-input" 
                required 
                value={formFields.purchasePrice}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Selling Price ($) *</label>
              <input 
                type="number" 
                name="sellingPrice" 
                min="0"
                step="0.01"
                className="form-input" 
                required 
                value={formFields.sellingPrice}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-grid form-grid-2" style={{ marginTop: "12px" }}>
            <div className="form-group">
              <label className="form-label">Initial Quantity *</label>
              <input 
                type="number" 
                name="quantity" 
                min="0"
                className="form-input" 
                required 
                value={formFields.quantity}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Min Stock Threshold *</label>
              <input 
                type="number" 
                name="minimumStock" 
                min="0"
                className="form-input" 
                required 
                value={formFields.minimumStock}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: "12px" }}>
            <label className="form-label">Status</label>
            <select 
              name="status" 
              className="form-select"
              value={formFields.status}
              onChange={handleInputChange}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div className="modal-footer" style={{ margin: "20px -24px -24px -24px" }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setIsAddOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={actionLoading}
            >
              {actionLoading ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Modify Product Detail">
        <form onSubmit={handleEditProductSubmit}>
          {actionError && <div className="login-error">⚠️ {actionError}</div>}
          
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input 
                type="text" 
                name="name" 
                className="form-input" 
                required 
                value={formFields.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">SKU Code *</label>
              <input 
                type="text" 
                name="sku" 
                className="form-input" 
                required 
                disabled
                value={formFields.sku}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-grid form-grid-2" style={{ marginTop: "12px" }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select 
                name="category" 
                className="form-select" 
                required 
                value={formFields.category}
                onChange={handleInputChange}
              >
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Warehouse Name</label>
              <input 
                type="text" 
                name="warehouse" 
                className="form-input" 
                value={formFields.warehouse}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: "12px" }}>
            <label className="form-label">Description</label>
            <textarea 
              name="description" 
              className="form-textarea" 
              rows="2"
              value={formFields.description}
              onChange={handleInputChange}
            ></textarea>
          </div>

          <div className="form-grid form-grid-2" style={{ marginTop: "12px" }}>
            <div className="form-group">
              <label className="form-label">Purchase Price ($) *</label>
              <input 
                type="number" 
                name="purchasePrice" 
                min="0"
                step="0.01"
                className="form-input" 
                required 
                value={formFields.purchasePrice}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Selling Price ($) *</label>
              <input 
                type="number" 
                name="sellingPrice" 
                min="0"
                step="0.01"
                className="form-input" 
                required 
                value={formFields.sellingPrice}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-grid form-grid-2" style={{ marginTop: "12px" }}>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input 
                type="number" 
                name="quantity" 
                min="0"
                className="form-input" 
                required 
                value={formFields.quantity}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Min Stock Threshold *</label>
              <input 
                type="number" 
                name="minimumStock" 
                min="0"
                className="form-input" 
                required 
                value={formFields.minimumStock}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: "12px" }}>
            <label className="form-label">Status</label>
            <select 
              name="status" 
              className="form-select"
              value={formFields.status}
              onChange={handleInputChange}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div className="modal-footer" style={{ margin: "20px -24px -24px -24px" }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setIsEditOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={actionLoading}
            >
              {actionLoading ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteProductConfirm}
        title="Delete Product"
        message={`Are you sure you want to permanently delete the product "${currentProduct?.name}" (SKU: ${currentProduct?.sku})? This action cannot be undone.`}
        loading={actionLoading}
      />
    </div>
  );
};

export default Products;

import React, { useState, useEffect } from "react";
import { getProducts } from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import StatusBadge from "../../components/StatusBadge";

const StaffProducts = () => {
  const [products, setProducts] = useState([]);
  const [categoriesMap, setCategoriesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [limit] = useState(10);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [lowStock, setLowStock] = useState(false);

  const fetchCategoriesList = async () => {
    try {
      const res = await getCategories({ limit: 100 });
      if (res && res.success) {
        const mapping = {};
        res.data.forEach(cat => {
          mapping[cat._id] = cat.name;
        });
        setCategoriesMap(mapping);
      }
    } catch (err) {
      console.error(err);
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
        setError(res.message || "Failed to load products.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the backend server to load products.");
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

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div className="page-header">
        <div className="page-title-area">
          <h2>Product Inventory List</h2>
          <p>Read-only overview of current quantities, SKU codes, and status checks.</p>
        </div>
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
          ⚠️ Low Stock Alerts
        </label>
      </div>

      {loading ? (
        <Loading message="Loading products list..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchProductsList} />
      ) : products.length === 0 ? (
        <div className="card empty-state">
          <span className="empty-state-icon">📦</span>
          <h3 className="empty-state-title">No Products Found</h3>
          <p className="empty-state-desc">Try modifying your search or filter inputs.</p>
        </div>
      ) : (
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
                <th>Unit Price</th>
                <th>Status</th>
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
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {product.description || "No description"}
                      </div>
                    </td>
                    <td>{categoriesMap[product.category] || "Loading..."}</td>
                    <td>{product.warehouse}</td>
                    <td style={{ fontWeight: "700" }}>
                      {product.quantity}
                      {isOut && <span style={{ marginLeft: "4px", color: "var(--danger)", fontSize: "0.75rem" }}>(Out)</span>}
                      {isLow && <span style={{ marginLeft: "4px", color: "var(--warning)", fontSize: "0.75rem" }}>(Low)</span>}
                    </td>
                    <td>{product.minimumStock}</td>
                    <td>${product.sellingPrice.toLocaleString()}</td>
                    <td>
                      <StatusBadge status={product.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
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
      )}
    </div>
  );
};

export default StaffProducts;

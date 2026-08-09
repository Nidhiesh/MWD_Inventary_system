import React, { useState, useEffect } from "react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../../services/categoryService";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search & Filter
  const [search, setSearch] = useState("");

  // Modal actions
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  // Form Fields
  const [formFields, setFormFields] = useState({
    name: "",
    description: "",
    status: "ACTIVE"
  });

  const fetchCategoriesList = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getCategories();
      if (res && res.success) {
        setCategories(res.data);
      } else {
        setError(res.message || "Failed to load categories.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load categories. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesList();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFields(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setActionError("");
    setFormFields({
      name: "",
      description: "",
      status: "ACTIVE"
    });
    setIsAddOpen(true);
  };

  const openEditModal = (category) => {
    setActionError("");
    setCurrentCategory(category);
    setFormFields({
      name: category.name || "",
      description: category.description || "",
      status: category.status || "ACTIVE"
    });
    setIsEditOpen(true);
  };

  const openDeleteModal = (category) => {
    setActionError("");
    setCurrentCategory(category);
    setIsDeleteOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError("");
    try {
      const res = await createCategory(formFields);
      if (res && res.success) {
        setIsAddOpen(false);
        fetchCategoriesList();
      } else {
        setActionError(res.message || "Failed to create category.");
      }
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || "Server error while creating category.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError("");
    try {
      const res = await updateCategory(currentCategory._id, formFields);
      if (res && res.success) {
        setIsEditOpen(false);
        fetchCategoriesList();
      } else {
        setActionError(res.message || "Failed to update category.");
      }
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || "Server error while updating category.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    setActionError("");
    try {
      const res = await deleteCategory(currentCategory._id);
      if (res && res.success) {
        setIsDeleteOpen(false);
        fetchCategoriesList();
      } else {
        setActionError(res.message || "Failed to delete category.");
      }
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || "Server error while deleting category.");
    } finally {
      setActionLoading(false);
    }
  };

  // Local search filter
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(search.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div className="page-header">
        <div className="page-title-area">
          <h2>Categories Management</h2>
          <p>Organize products into classification groups.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          ➕ Add Category
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <span className="search-input-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search categories by name or description..." 
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <Loading message="Loading category list..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchCategoriesList} />
      ) : filteredCategories.length === 0 ? (
        <div className="card empty-state">
          <span className="empty-state-icon">🏷️</span>
          <h3 className="empty-state-title">No Categories Found</h3>
          <p className="empty-state-desc">Add a new category or refine your search filter.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category._id}>
                  <td style={{ fontWeight: "700" }}>{category.name}</td>
                  <td>{category.description || <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>No description</span>}</td>
                  <td>
                    <StatusBadge status={category.status} />
                  </td>
                  <td>
                    <div className="action-btn-group">
                      <button 
                        className="icon-btn" 
                        title="Edit"
                        onClick={() => openEditModal(category)}
                      >
                        ✏️
                      </button>
                      <button 
                        className="icon-btn delete" 
                        title="Delete"
                        onClick={() => openDeleteModal(category)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Category">
        <form onSubmit={handleAddSubmit}>
          {actionError && <div className="login-error">⚠️ {actionError}</div>}
          
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input 
              type="text" 
              name="name" 
              className="form-input" 
              required 
              value={formFields.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group" style={{ marginTop: "12px" }}>
            <label className="form-label">Description</label>
            <textarea 
              name="description" 
              className="form-textarea" 
              rows="3"
              value={formFields.description}
              onChange={handleInputChange}
            ></textarea>
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
              {actionLoading ? "Saving..." : "Save Category"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Modify Category Detail">
        <form onSubmit={handleEditSubmit}>
          {actionError && <div className="login-error">⚠️ {actionError}</div>}
          
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input 
              type="text" 
              name="name" 
              className="form-input" 
              required 
              value={formFields.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group" style={{ marginTop: "12px" }}>
            <label className="form-label">Description</label>
            <textarea 
              name="description" 
              className="form-textarea" 
              rows="3"
              value={formFields.description}
              onChange={handleInputChange}
            ></textarea>
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
              {actionLoading ? "Updating..." : "Update Category"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <ConfirmDialog 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message={`Are you sure you want to permanently delete the category "${currentCategory?.name}"? Make sure no products are currently associated with it.`}
        loading={actionLoading}
      />
    </div>
  );
};

export default Categories;

import React, { useState, useEffect } from "react";
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from "../../services/supplierService";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search
  const [search, setSearch] = useState("");

  // Modal actions
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  // Form Fields
  const [formFields, setFormFields] = useState({
    name: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    gstNumber: "",
    status: "ACTIVE"
  });

  const fetchSuppliersList = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getSuppliers();
      if (res && res.success) {
        setSuppliers(res.data);
      } else {
        setError(res.message || "Failed to load suppliers.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load suppliers. Check if the server is active.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliersList();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFields(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setActionError("");
    setFormFields({
      name: "",
      companyName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "India",
      gstNumber: "",
      status: "ACTIVE"
    });
    setIsAddOpen(true);
  };

  const openEditModal = (supplier) => {
    setActionError("");
    setCurrentSupplier(supplier);
    setFormFields({
      name: supplier.name || "",
      companyName: supplier.companyName || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      city: supplier.city || "",
      state: supplier.state || "",
      country: supplier.country || "India",
      gstNumber: supplier.gstNumber || "",
      status: supplier.status || "ACTIVE"
    });
    setIsEditOpen(true);
  };

  const openDeleteModal = (supplier) => {
    setActionError("");
    setCurrentSupplier(supplier);
    setIsDeleteOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError("");
    try {
      const res = await createSupplier(formFields);
      if (res && res.success) {
        setIsAddOpen(false);
        fetchSuppliersList();
      } else {
        setActionError(res.message || "Failed to create supplier.");
      }
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || "Server error while creating supplier.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError("");
    try {
      const res = await updateSupplier(currentSupplier._id, formFields);
      if (res && res.success) {
        setIsEditOpen(false);
        fetchSuppliersList();
      } else {
        setActionError(res.message || "Failed to update supplier.");
      }
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || "Server error while updating supplier.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    setActionError("");
    try {
      const res = await deleteSupplier(currentSupplier._id);
      if (res && res.success) {
        setIsDeleteOpen(false);
        fetchSuppliersList();
      } else {
        setActionError(res.message || "Failed to delete supplier.");
      }
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || "Server error while deleting supplier.");
    } finally {
      setActionLoading(false);
    }
  };

  // Local filter
  const filteredSuppliers = suppliers.filter(sup => 
    sup.companyName.toLowerCase().includes(search.toLowerCase()) ||
    sup.name.toLowerCase().includes(search.toLowerCase()) ||
    sup.email.toLowerCase().includes(search.toLowerCase()) ||
    (sup.phone && sup.phone.includes(search))
  );

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div className="page-header">
        <div className="page-title-area">
          <h2>Suppliers Management</h2>
          <p>Register and coordinate wholesale product suppliers.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          ➕ Add Supplier
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <span className="search-input-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search suppliers by company, contact name, email, or phone..." 
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <Loading message="Loading supplier list..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchSuppliersList} />
      ) : filteredSuppliers.length === 0 ? (
        <div className="card empty-state">
          <span className="empty-state-icon">🤝</span>
          <h3 className="empty-state-title">No Suppliers Found</h3>
          <p className="empty-state-desc">Refine your search parameters or register a new supplier.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>Email</th>
                <th>GSTIN</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier._id}>
                  <td style={{ fontWeight: "700" }}>{supplier.companyName}</td>
                  <td>{supplier.name}</td>
                  <td>{supplier.phone}</td>
                  <td>{supplier.email}</td>
                  <td>{supplier.gstNumber || <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>N/A</span>}</td>
                  <td>
                    {supplier.city && supplier.state 
                      ? `${supplier.city}, ${supplier.state}` 
                      : supplier.city || supplier.state || supplier.country || "N/A"
                    }
                  </td>
                  <td>
                    <StatusBadge status={supplier.status} />
                  </td>
                  <td>
                    <div className="action-btn-group">
                      <button 
                        className="icon-btn" 
                        title="Edit"
                        onClick={() => openEditModal(supplier)}
                      >
                        ✏️
                      </button>
                      <button 
                        className="icon-btn delete" 
                        title="Delete"
                        onClick={() => openDeleteModal(supplier)}
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
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Supplier Profile">
        <form onSubmit={handleAddSubmit}>
          {actionError && <div className="login-error">⚠️ {actionError}</div>}
          
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input 
                type="text" 
                name="companyName" 
                className="form-input" 
                required 
                value={formFields.companyName}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Person Name *</label>
              <input 
                type="text" 
                name="name" 
                className="form-input" 
                required 
                value={formFields.name}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-grid form-grid-2" style={{ marginTop: "12px" }}>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input 
                type="email" 
                name="email" 
                className="form-input" 
                required 
                value={formFields.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input 
                type="text" 
                name="phone" 
                className="form-input" 
                required 
                value={formFields.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-grid form-grid-2" style={{ marginTop: "12px" }}>
            <div className="form-group">
              <label className="form-label">GST Number</label>
              <input 
                type="text" 
                name="gstNumber" 
                className="form-input" 
                placeholder="e.g. 22AAAAA0000A1Z5"
                value={formFields.gstNumber}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Country</label>
              <input 
                type="text" 
                name="country" 
                className="form-input" 
                value={formFields.country}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-grid form-grid-2" style={{ marginTop: "12px" }}>
            <div className="form-group">
              <label className="form-label">City</label>
              <input 
                type="text" 
                name="city" 
                className="form-input" 
                value={formFields.city}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input 
                type="text" 
                name="state" 
                className="form-input" 
                value={formFields.state}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: "12px" }}>
            <label className="form-label">Address</label>
            <textarea 
              name="address" 
              className="form-textarea" 
              rows="2"
              value={formFields.address}
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
              {actionLoading ? "Saving..." : "Add Supplier"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Modify Supplier Details">
        <form onSubmit={handleEditSubmit}>
          {actionError && <div className="login-error">⚠️ {actionError}</div>}
          
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input 
                type="text" 
                name="companyName" 
                className="form-input" 
                required 
                value={formFields.companyName}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Person Name *</label>
              <input 
                type="text" 
                name="name" 
                className="form-input" 
                required 
                value={formFields.name}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-grid form-grid-2" style={{ marginTop: "12px" }}>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input 
                type="email" 
                name="email" 
                className="form-input" 
                required 
                value={formFields.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input 
                type="text" 
                name="phone" 
                className="form-input" 
                required 
                value={formFields.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-grid form-grid-2" style={{ marginTop: "12px" }}>
            <div className="form-group">
              <label className="form-label">GST Number</label>
              <input 
                type="text" 
                name="gstNumber" 
                className="form-input" 
                placeholder="e.g. 22AAAAA0000A1Z5"
                value={formFields.gstNumber}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Country</label>
              <input 
                type="text" 
                name="country" 
                className="form-input" 
                value={formFields.country}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-grid form-grid-2" style={{ marginTop: "12px" }}>
            <div className="form-group">
              <label className="form-label">City</label>
              <input 
                type="text" 
                name="city" 
                className="form-input" 
                value={formFields.city}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input 
                type="text" 
                name="state" 
                className="form-input" 
                value={formFields.state}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: "12px" }}>
            <label className="form-label">Address</label>
            <textarea 
              name="address" 
              className="form-textarea" 
              rows="2"
              value={formFields.address}
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
              {actionLoading ? "Updating..." : "Update Supplier"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Supplier"
        message={`Are you sure you want to permanently delete the supplier "${currentSupplier?.companyName}"?`}
        loading={actionLoading}
      />
    </div>
  );
};

export default Suppliers;

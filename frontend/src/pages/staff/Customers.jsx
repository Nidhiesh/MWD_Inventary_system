import React, { useState, useEffect } from "react";
import { getCustomers, createCustomer, updateCustomer } from "../../services/customerService";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";

const StaffCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search
  const [search, setSearch] = useState("");

  // Modal actions
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  // Form Fields
  const [formFields, setFormFields] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    status: "ACTIVE"
  });

  const fetchCustomersList = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getCustomers();
      if (res && res.success) {
        setCustomers(res.data);
      } else {
        setError(res.message || "Failed to load customer list.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the backend server to load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomersList();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFields(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setActionError("");
    setFormFields({
      name: "",
      phone: "",
      email: "",
      address: "",
      status: "ACTIVE"
    });
    setIsAddOpen(true);
  };

  const openEditModal = (customer) => {
    setActionError("");
    setCurrentCustomer(customer);
    setFormFields({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      status: customer.status || "ACTIVE"
    });
    setIsEditOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formFields.phone.trim()) {
      setActionError("Customer phone is required.");
      return;
    }
    setActionLoading(true);
    setActionError("");
    try {
      const res = await createCustomer(formFields);
      if (res && res.success) {
        setIsAddOpen(false);
        fetchCustomersList();
      } else {
        setActionError(res.message || "Failed to add customer.");
      }
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || err.message || "Server error while saving customer profile.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formFields.phone.trim()) {
      setActionError("Customer phone is required.");
      return;
    }
    setActionLoading(true);
    setActionError("");
    try {
      const res = await updateCustomer(currentCustomer._id, formFields);
      if (res && res.success) {
        setIsEditOpen(false);
        fetchCustomersList();
      } else {
        setActionError(res.message || "Failed to update customer details.");
      }
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || err.message || "Server error while updating customer profile.");
    } finally {
      setActionLoading(false);
    }
  };

  // Local filter
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div className="page-header">
        <div className="page-title-area">
          <h2>Customers Registry</h2>
          <p>View, search, and register customer accounts.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          ➕ Add Customer
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <span className="search-input-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search customers by name, phone, or email..." 
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <Loading message="Loading customer profile data..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchCustomersList} />
      ) : filteredCustomers.length === 0 ? (
        <div className="card empty-state">
          <span className="empty-state-icon">👤</span>
          <h3 className="empty-state-title">No Customers Registered</h3>
          <p className="empty-state-desc">Register a new customer profile to get started.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Phone Number *</th>
                <th>Email Address</th>
                <th>Shipping Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer._id}>
                  <td style={{ fontWeight: "700" }}>{customer.name}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.email || <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>N/A</span>}</td>
                  <td>{customer.address || <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>N/A</span>}</td>
                  <td>
                    <StatusBadge status={customer.status} />
                  </td>
                  <td>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => openEditModal(customer)}
                    >
                      ✏️ Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register Customer Profile">
        <form onSubmit={handleAddSubmit}>
          {actionError && <div className="login-error">⚠️ {actionError}</div>}
          
          <div className="form-group">
            <label className="form-label">Full Name *</label>
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
            <label className="form-label">Phone Number *</label>
            <input 
              type="text" 
              name="phone" 
              className="form-input" 
              required 
              placeholder="Customer phone is required"
              value={formFields.phone}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group" style={{ marginTop: "12px" }}>
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              name="email" 
              className="form-input" 
              placeholder="e.g. customer@example.com"
              value={formFields.email}
              onChange={handleInputChange}
            />
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
              {actionLoading ? "Registering..." : "Add Customer"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Modify Customer Details">
        <form onSubmit={handleEditSubmit}>
          {actionError && <div className="login-error">⚠️ {actionError}</div>}
          
          <div className="form-group">
            <label className="form-label">Full Name *</label>
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

          <div className="form-group" style={{ marginTop: "12px" }}>
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              name="email" 
              className="form-input" 
              value={formFields.email}
              onChange={handleInputChange}
            />
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
              {actionLoading ? "Updating..." : "Update Customer"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffCustomers;

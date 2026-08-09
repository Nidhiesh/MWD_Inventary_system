import React, { useState, useEffect } from "react";
import { getStaff, createStaff, toggleStaffStatus } from "../../services/staffService";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import Modal from "../../components/Modal";

const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  // Form Fields
  const [formFields, setFormFields] = useState({
    name: "",
    email: "",
    password: "",
    phone: ""
  });

  const fetchStaffData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getStaff();
      if (res && res.success) {
        setStaffList(res.staff || []);
      } else {
        setError(res.message || "Failed to load staff list.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the backend server to load staff profiles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFields(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setActionError("");
    setFormFields({
      name: "",
      email: "",
      password: "",
      phone: ""
    });
    setIsAddOpen(true);
  };

  const handleCreateStaffSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError("");
    try {
      const res = await createStaff(formFields);
      if (res && res.success) {
        setIsAddOpen(false);
        fetchStaffData();
      } else {
        setActionError(res.message || "Failed to create staff account.");
      }
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || "Server error while creating staff account.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentActive) => {
    const actionName = currentActive ? "disable" : "enable";
    if (!confirm(`Are you sure you want to ${actionName} this staff account?`)) return;

    setActionLoading(true);
    try {
      const res = await toggleStaffStatus(id);
      if (res && res.success) {
        setStaffList(staffList.map(s => s._id === id ? { ...s, isActive: res.isActive } : s));
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to change staff status.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div className="page-header">
        <div className="page-title-area">
          <h2>Staff Management</h2>
          <p>Register new staff accounts, review profiles, and enable/disable system access.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          ➕ Add Staff Member
        </button>
      </div>

      {loading ? (
        <Loading message="Loading staff accounts..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchStaffData} />
      ) : staffList.length === 0 ? (
        <div className="card empty-state">
          <span className="empty-state-icon">👥</span>
          <h3 className="empty-state-title">No Staff Registered</h3>
          <p className="empty-state-desc">Add a new staff member account to get started.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff) => (
                <tr key={staff._id}>
                  <td style={{ fontWeight: "700" }}>{staff.name}</td>
                  <td>{staff.email}</td>
                  <td>{staff.phone || <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>N/A</span>}</td>
                  <td>{new Date(staff.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${staff.isActive ? "active" : "inactive"}`}>
                      {staff.isActive ? "ACTIVE" : "DISABLED"}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={`btn ${staff.isActive ? "btn-secondary" : "btn-primary"} btn-sm`}
                      onClick={() => handleToggleStatus(staff._id, staff.isActive)}
                      disabled={actionLoading}
                    >
                      {staff.isActive ? "🚫 Disable" : "✔️ Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register Staff Member">
        <form onSubmit={handleCreateStaffSubmit}>
          {actionError && <div className="login-error">⚠️ {actionError}</div>}
          
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input 
              type="text" 
              name="name" 
              className="form-input" 
              required 
              placeholder="e.g. John Doe"
              value={formFields.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group" style={{ marginTop: "12px" }}>
            <label className="form-label">Email Address *</label>
            <input 
              type="email" 
              name="email" 
              className="form-input" 
              required 
              placeholder="e.g. staff1@smartstock.com"
              value={formFields.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group" style={{ marginTop: "12px" }}>
            <label className="form-label">Login Password *</label>
            <input 
              type="password" 
              name="password" 
              className="form-input" 
              required 
              minLength="6"
              placeholder="At least 6 characters"
              value={formFields.password}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group" style={{ marginTop: "12px" }}>
            <label className="form-label">Phone Number</label>
            <input 
              type="text" 
              name="phone" 
              className="form-input" 
              placeholder="e.g. 9876543210"
              value={formFields.phone}
              onChange={handleInputChange}
            />
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
              {actionLoading ? "Registering..." : "Add Staff Member"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Staff;

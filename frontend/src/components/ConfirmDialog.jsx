import React from "react";
import Modal from "./Modal";

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title = "Confirm Action", message = "Are you sure you want to perform this action?", loading = false }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div style={{ padding: "8px 0" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>{message}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-danger" 
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Confirming..." : "Confirm"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;

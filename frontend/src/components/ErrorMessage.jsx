import React from "react";

const ErrorMessage = ({ message = "Something went wrong.", onRetry }) => {
  return (
    <div style={{
      padding: "20px",
      borderRadius: "var(--radius-lg)",
      backgroundColor: "var(--danger-light)",
      border: "1px solid rgba(220, 38, 38, 0.1)",
      color: "var(--danger)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "12px",
      textAlign: "center",
      margin: "20px 0"
    }}>
      <span style={{ fontSize: "2rem" }}>⚠️</span>
      <div>
        <h4 style={{ fontWeight: "700", marginBottom: "4px" }}>Error</h4>
        <p style={{ fontSize: "0.875rem" }}>{message}</p>
      </div>
      {onRetry && (
        <button 
          onClick={onRetry} 
          className="btn btn-secondary btn-sm"
          style={{ borderColor: "rgba(220, 38, 38, 0.2)", color: "var(--danger)" }}
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;

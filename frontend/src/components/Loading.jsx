import React from "react";

const Loading = ({ message = "Loading..." }) => {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      width: "100%",
      height: "100%"
    }}>
      <div style={{
        width: "40px",
        height: "40px",
        border: "4px solid var(--border)",
        borderTop: "4px solid var(--primary)",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginBottom: "12px"
      }}></div>
      <p style={{
        color: "var(--text-muted)",
        fontSize: "0.875rem",
        fontWeight: "500"
      }}>{message}</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loading;

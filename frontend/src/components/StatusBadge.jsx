import React from "react";

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalizedStatus = status.toLowerCase().replace(/_/g, "-");
  
  // Format for display
  let displayName = status.toUpperCase().replace(/_/g, " ");

  return (
    <span className={`status-badge ${normalizedStatus}`}>
      {displayName}
    </span>
  );
};

export default StatusBadge;

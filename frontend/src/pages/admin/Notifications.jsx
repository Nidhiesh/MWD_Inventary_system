import React, { useState, useEffect } from "react";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "../../services/notificationService";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";

const Notifications = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getNotifications();
      if (res && res.success) {
        setAlerts(res.data || []);
      } else {
        setError(res.message || "Failed to load notifications.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load notifications. Check connectivity to the database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleMarkRead = async (id) => {
    setActionLoading(true);
    try {
      const res = await markAsRead(id);
      if (res && res.success) {
        setAlerts(alerts.map(a => a._id === id ? { ...a, isRead: true } : a));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    setActionLoading(true);
    try {
      const res = await markAllAsRead();
      if (res && res.success) {
        setAlerts(alerts.map(a => ({ ...a, isRead: true })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;
    setActionLoading(true);
    try {
      const res = await deleteNotification(id);
      if (res && res.success) {
        setAlerts(alerts.filter(a => a._id !== id));
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete notification. Make sure you are logged in as Admin.");
    } finally {
      setActionLoading(false);
    }
  };

  const unreadCount = alerts.filter(a => !a.isRead).length;

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div className="page-header">
        <div className="page-title-area">
          <h2>Alert Notifications ({alerts.length})</h2>
          <p>Supervise low stock, out of stock, and reorder warnings.</p>
        </div>
        {unreadCount > 0 && (
          <button 
            className="btn btn-secondary" 
            onClick={handleMarkAllRead}
            disabled={actionLoading}
          >
            ✓ Mark All As Read
          </button>
        )}
      </div>

      {loading ? (
        <Loading message="Loading system notifications..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchAlerts} />
      ) : alerts.length === 0 ? (
        <div className="card empty-state">
          <span className="empty-state-icon">🔔</span>
          <h3 className="empty-state-title">No Notifications</h3>
          <p className="empty-state-desc">Your inventory is in good shape! No alerts found.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {alerts.map((alert) => (
            <div 
              key={alert._id} 
              className={`notification-item ${!alert.isRead ? "unread" : ""}`}
            >
              <div className="notification-main">
                <span style={{ fontSize: "1.25rem", marginTop: "2px" }}>
                  {alert.type === "OUT_OF_STOCK" ? "🚨" : alert.type === "LOW_STOCK" ? "⚠️" : "🔔"}
                </span>
                <div className="notification-text-area">
                  <span className="notification-msg">{alert.message}</span>
                  <span className="notification-time">{new Date(alert.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                {!alert.isRead && (
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleMarkRead(alert._id)}
                    disabled={actionLoading}
                  >
                    Mark Read
                  </button>
                )}
                <button 
                  className="icon-btn delete"
                  title="Delete Alert"
                  onClick={() => handleDelete(alert._id)}
                  disabled={actionLoading}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;

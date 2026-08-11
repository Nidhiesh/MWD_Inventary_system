import api from "./api";

// ==========================================
// GET ALL NOTIFICATIONS
// ==========================================

export const getNotifications = async () => {
    const response = await api.get("/notifications");
    return response.data;
};


// ==========================================
// GET UNREAD NOTIFICATIONS
// ==========================================

export const getUnreadNotifications = async () => {
    const response = await api.get("/notifications/unread");
    return response.data;
};


// ==========================================
// MARK ONE AS READ
// ==========================================

export const markAsRead = async (id) => {
    const response = await api.put(
        `/notifications/${id}/read`
    );

    return response.data;
};


// ==========================================
// MARK ONE AS READ - ALTERNATIVE NAME
// ==========================================

export const markNotificationAsRead = async (id) => {
    return markAsRead(id);
};


// ==========================================
// MARK ALL AS READ
// ==========================================

export const markAllAsRead = async () => {
    const response = await api.put(
        "/notifications/read-all"
    );

    return response.data;
};


// ==========================================
// MARK ALL AS READ - ALTERNATIVE NAME
// ==========================================

export const markAllNotificationsAsRead = async () => {
    return markAllAsRead();
};


// ==========================================
// DELETE NOTIFICATION
// ==========================================

export const deleteNotification = async (id) => {
    const response = await api.delete(
        `/notifications/${id}`
    );

    return response.data;
};
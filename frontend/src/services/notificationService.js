import api from "./api";

export const getNotifications = async () => {
  const response = await api.get("/alerts");
  return response.data;
};

export const getUnreadNotifications = async () => {
  const response = await api.get("/alerts/unread");
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await api.put("/alerts/read-all");
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await api.put(`/alerts/${id}/read`);
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(`/alerts/${id}`);
  return response.data;
};

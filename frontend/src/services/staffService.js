import api from "./api";

export const getStaff = async () => {
  const response = await api.get("/auth/staff");
  return response.data;
};

export const createStaff = async (staffData) => {
  const response = await api.post("/auth/staff", staffData);
  return response.data;
};

export const toggleStaffStatus = async (id) => {
  const response = await api.patch(`/auth/staff/${id}/status`);
  return response.data;
};

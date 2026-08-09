import api from "./api";

export const getSalesReport = async (params) => {
  const response = await api.get("/reports/sales", { params });
  return response.data;
};

export const getPurchaseReport = async (params) => {
  const response = await api.get("/reports/purchases", { params });
  return response.data;
};

export const getInventoryReport = async () => {
  const response = await api.get("/reports/inventory");
  return response.data;
};

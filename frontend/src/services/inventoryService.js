import api from "./api";

export const getInventoryTransactions = async () => {
  const response = await api.get("/inventory");
  return response.data;
};

export const getProductTransactions = async (productId) => {
  const response = await api.get(`/inventory/product/${productId}`);
  return response.data;
};

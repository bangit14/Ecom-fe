import api, { apiGet } from "./api";

const ORDER_BASE_PATH = "/orders";

export const orderService = {
  getMyOrders: async ({ page = 0, size = 10, sortBy, sortDir } = {}) => {
    const response = await apiGet(`${ORDER_BASE_PATH}/my`, {
      params: { page, size, sortBy, sortDir },
    });
    return response.data;
  },

  getMyOrderDetails: async (orderId) => {
    const response = await apiGet(`${ORDER_BASE_PATH}/my/${orderId}`);
    return response.data;
  },

  createOrder: async (payload) => {
    const response = await api.post(`${ORDER_BASE_PATH}/create`, payload);
    return response.data;
  },

  cancelOrder: async (orderId, reason) => {
    await api.put(`${ORDER_BASE_PATH}/${orderId}/cancel`, null, {
      params: { reason },
    });
  },

  getAllOrders: async ({
    filter = {},
    page = 0,
    size = 10,
    sortBy,
    sortDir,
  } = {}) => {
    const params = {
      ...filter,
      page,
      size,
      ...(sortBy ? { sortBy } : {}),
      ...(sortDir ? { sortDir } : {}),
    };
    const response = await apiGet(`${ORDER_BASE_PATH}/all`, { params });
    return response.data;
  },

  updateOrderStatus: async (orderId, status, note) => {
    await api.put(`${ORDER_BASE_PATH}/${orderId}/update-status`, null, {
      params: { status, note },
    });
  },
};

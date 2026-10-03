import api, { apiGet } from "./api";

const CART_BASE_PATH = "/carts";

export const cartService = {
  // Backend now returns CartResponse shape
  getCartItems: async () => {
    const response = await apiGet(`${CART_BASE_PATH}/items`);
    return response.data;
  },

  addToCart: async (cartItem) => {
    await api.post(`${CART_BASE_PATH}/add`, cartItem);
  },

  updateCartItem: async ({ quantity, variantId }) => {
    await api.put(`${CART_BASE_PATH}/update`, {
      variantId,
      quantity,
    });
  },

  removeCartItem: async ({ variantId }) => {
    await api.delete(`${CART_BASE_PATH}/remove`, {
      params: { variantId },
    });
  },

  clearCart: async () => {
    await api.delete(`${CART_BASE_PATH}/clear`);
  },

  getCartItemCount: async () => {
    const response = await apiGet(`${CART_BASE_PATH}/count`);
    return Number(response.data) || 0;
  },
};


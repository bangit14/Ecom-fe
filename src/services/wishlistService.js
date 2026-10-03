import api, { apiGet } from "./api";

const WISHLIST_BASE_PATH = "/wishlists";

export const wishlistService = {
  getMyWishlist: async ({ page = 0, size = 12 } = {}) => {
    const response = await apiGet(`${WISHLIST_BASE_PATH}/my`, {
      params: { page, size },
    });
    return response.data;
  },

  toggleWishlistItem: async (productId) => {
    const response = await api.post(`${WISHLIST_BASE_PATH}/toggle`, null, {
      params: { productId },
    });
    return response.data;
  },
};

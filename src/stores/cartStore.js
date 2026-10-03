import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartService } from "../services/cartService";
import { getCurrentRole } from "../utils/authSession";

const CART_COUNT_TTL_MS = 60000;

const isCustomerRole = (role) => role === "CUSTOMER" || role === "USER";

export const useCartStore = create(
  persist(
    (set, get) => ({
      cartItemCount: 0,
      lastFetchedAt: 0,
      setCartItemCount: (count) =>
        set({
          cartItemCount: Number(count) || 0,
          lastFetchedAt: Date.now(),
        }),
      refreshCartItemCount: async (force = false) => {
        const now = Date.now();
        const { lastFetchedAt } = get();

        if (
          !force &&
          lastFetchedAt &&
          now - lastFetchedAt < CART_COUNT_TTL_MS
        ) {
          return get().cartItemCount;
        }

        const token = localStorage.getItem("token");
        const role = getCurrentRole();

        if (!token || !isCustomerRole(role)) {
          set({ cartItemCount: 0, lastFetchedAt: now });
          return 0;
        }

        try {
          const count = await cartService.getCartItemCount();
          const nextCount = Number(count) || 0;
          set({ cartItemCount: nextCount, lastFetchedAt: now });
          return nextCount;
        } catch {
          set({ cartItemCount: 0, lastFetchedAt: now });
          return 0;
        }
      },
    }),
    {
      name: "cart-count-store",
      partialize: (state) => ({
        cartItemCount: state.cartItemCount,
        lastFetchedAt: state.lastFetchedAt,
      }),
    },
  ),
);

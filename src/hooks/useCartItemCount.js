import { useEffect } from "react";
import { useCartStore } from "../stores/cartStore";

export const useCartItemCount = () => {
  const cartItemCount = useCartStore((state) => state.cartItemCount);
  const setCartItemCount = useCartStore((state) => state.setCartItemCount);
  const refreshCartItemCount = useCartStore(
    (state) => state.refreshCartItemCount,
  );

  useEffect(() => {
    refreshCartItemCount();
  }, [refreshCartItemCount]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === "token" || event.key === "role") {
        refreshCartItemCount(true);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [refreshCartItemCount]);

  return {
    cartItemCount,
    setCartItemCount,
    refreshCartItemCount,
  };
};

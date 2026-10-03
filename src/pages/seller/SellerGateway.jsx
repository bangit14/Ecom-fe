import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import { userService } from "../../services/userService";
import { getCurrentRole } from "../../utils/authSession";

export default function SellerGateway() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [destination, setDestination] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const resolveSellerDestination = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        if (isMounted) {
          setDestination("/seller/login");
          setLoading(false);
        }
        return;
      }

      // First check local role if available immediately
      const cachedRole = getCurrentRole();
      if (cachedRole === "ADMIN" || cachedRole === "STORE_OWNER" || cachedRole === "SELLER") {
        if (isMounted) {
          setDestination("/seller/dashboard");
          setLoading(false);
        }
        return;
      }

      try {
        const profile = await userService.getUserProfile();
        if (!isMounted) return;

        const isSellerOrAdmin =
          profile?.role === "ADMIN" ||
          profile?.role === "STORE_OWNER" ||
          profile?.role === "SELLER" ||
          (Array.isArray(profile?.roles) &&
            profile.roles.some((r) => ["ADMIN", "STORE_OWNER", "SELLER"].includes(r)));

        const hasConfiguredStore = Boolean(profile?.storeId) || isSellerOrAdmin;

        if (hasConfiguredStore) {
          setDestination("/seller/dashboard");
        } else {
          setDestination("/seller/register");
        }
      } catch (err) {
        if (!isMounted) return;
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          setDestination("/seller/login");
        } else {
          // In case profile call fails for any other reason, default to register flow
          setDestination("/seller/register");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    resolveSellerDestination();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center animate-pulse">
            <BuildingStorefrontIcon className="h-8 w-8" />
          </div>
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Đang chuyển hướng đến Kênh Người Bán...
          </p>
        </div>
      </div>
    );
  }

  return <Navigate to={destination || "/seller/login"} replace />;
}

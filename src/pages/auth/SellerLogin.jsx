import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  BuildingStorefrontIcon,
  LockClosedIcon,
  ShoppingBagIcon,
  UserIcon,
  ArrowRightIcon,
  ChartBarIcon,
  TruckIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import api from "../../services/api";
import { getErrorMessage } from "../../utils/errorHandler";
import { userService } from "../../services/userService";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";
import {
  extractUserIdFromLoginResponse,
  syncUserIdFromToken,
  syncRoleFromToken,
  syncPermissionsFromToken,
} from "../../utils/authSession";

const extractLoginToken = (response) => {
  const rawToken =
    response.data?.token ||
    response.data?.access_token ||
    response.data?.accessToken ||
    response.data?.data?.token ||
    response.data?.data?.access_token ||
    response.data?.data?.accessToken ||
    response.headers?.authorization ||
    response.headers?.Authorization;

  return typeof rawToken === "string"
    ? rawToken.replace(/^Bearer\s+/i, "").trim()
    : "";
};

export default function SellerLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingExistingSession, setCheckingExistingSession] = useState(true);

  // If already logged in, check store status and auto-redirect
  useEffect(() => {
    let isMounted = true;
    const checkAuthAndRedirect = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        if (isMounted) setCheckingExistingSession(false);
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
          navigate("/seller/dashboard", { replace: true });
        } else {
          navigate("/seller/register", { replace: true });
        }
      } catch {
        if (isMounted) setCheckingExistingSession(false);
      }
    };

    checkAuthAndRedirect();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });

      const token = extractLoginToken(response);
      if (!token) {
        throw new Error(t("auth.login.error") || "Đăng nhập thất bại");
      }

      localStorage.setItem("token", token);
      const role = syncRoleFromToken(token);
      syncPermissionsFromToken(token);

      const userId = extractUserIdFromLoginResponse(response.data);
      if (userId) {
        localStorage.setItem("userId", String(userId));
      } else {
        syncUserIdFromToken(token);
      }

      // Fetch user profile to determine whether store is configured
      let profile = null;
      try {
        profile = await userService.getUserProfile();
        if (profile?.id) {
          localStorage.setItem("userId", String(profile.id));
        }
        if (profile?.username) {
          localStorage.setItem("username", profile.username);
        }
      } catch {
        // Fallback gracefully
      }

      toast.success("Đăng nhập Kênh Người Bán thành công!");

      const isSellerOrAdmin =
        role === "ADMIN" ||
        role === "STORE_OWNER" ||
        role === "SELLER" ||
        profile?.role === "ADMIN" ||
        profile?.role === "STORE_OWNER" ||
        profile?.role === "SELLER" ||
        (Array.isArray(profile?.roles) &&
          profile.roles.some((r) => ["ADMIN", "STORE_OWNER", "SELLER"].includes(r)));

      const hasStore = Boolean(profile?.storeId) || isSellerOrAdmin;

      if (hasStore) {
        const fromPath = location.state?.from?.pathname;
        navigate(fromPath && fromPath !== "/seller/login" ? fromPath : "/seller/dashboard", {
          replace: true,
        });
      } else {
        toast("Chào mừng bạn! Hãy hoàn tất thiết lập gian hàng để bắt đầu bán hàng.", {
          icon: "🏪",
          duration: 4000,
        });
        navigate("/seller/register", { replace: true });
      }
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.error === "EMAIL_NOT_VERIFIED" || errorData?.code === 3005) {
        const unverifiedEmail =
          errorData?.data?.email ||
          (username.includes("@") ? username.trim() : "");
        toast.error(
          errorData.message ||
            "Tài khoản chưa được xác minh email. Vui lòng xác minh để tiếp tục.",
        );
        navigate("/verify-code", {
          state: { email: unverifiedEmail, isFromLogin: true },
        });
        return;
      }

      const message = getErrorMessage(err, "Tài khoản hoặc mật khẩu không chính xác");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingExistingSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 font-medium">
          Đang kiểm tra thông tin người bán...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/70 dark:bg-gray-950 text-gray-800 dark:text-gray-100">
      {/* Top Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2.5 group"
              aria-label="Về trang chủ"
            >
              <div className="rounded-xl bg-blue-50 dark:bg-blue-900/30 p-1.5 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform duration-200">
                <ShoppingBagIcon className="h-6 w-6" />
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent tracking-tight">
                Shobbe
              </span>
            </Link>

            <span className="text-gray-300 dark:text-gray-700 text-xl font-light">
              |
            </span>

            <div className="flex items-center gap-2">
              <BuildingStorefrontIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h1 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100">
                Kênh Người Bán
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <Link
              to="/support"
              className="hidden sm:flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              <QuestionMarkCircleIcon className="h-4 w-4" />
              <span>{t("header.help") || "Bạn cần giúp đỡ?"}</span>
            </Link>
            <span className="hidden sm:inline text-gray-300 dark:text-gray-700">|</span>
            <LanguageSwitcher variant="topbar" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Feature Showcase Banner (Desktop) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-8 pr-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/70 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-4 border border-blue-200 dark:border-blue-900">
                <BuildingStorefrontIcon className="h-4 w-4" />
                <span>Shobbe Seller Centre</span>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
                Bán hàng chuyên nghiệp, bứt phá doanh thu cùng Shobbe
              </h2>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Quản lý sản phẩm, theo dõi đơn hàng, kết nối nhiều nhà vận chuyển (GHN, GHTK...) và tiếp cận hàng triệu khách hàng tiềm năng.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 shadow-2xs">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
                  <ChartBarIcon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Báo cáo & Phân tích thời gian thực
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Theo dõi doanh số, lượt truy cập và hiệu suất kinh doanh chính xác.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 shadow-2xs">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
                  <TruckIcon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Tích hợp Vận chuyển Đa kênh
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Hỗ trợ Hỏa Tốc, Giao Nhanh và Tiết Kiệm từ các đối tác hàng đầu.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 shadow-2xs">
                <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 shrink-0">
                  <ShieldCheckIcon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Thanh toán an toàn & Đối soát tự động
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Dòng tiền minh bạch, nhận tiền hàng nhanh chóng và bảo mật cao.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Login Box */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-900 p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
              <div className="text-left mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                  <BuildingStorefrontIcon className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Đăng nhập Người bán
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Nhập thông tin tài khoản để truy cập vào Kênh quản lý gian hàng
                </p>
              </div>

              {error && (
                <div className="mb-5 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-3.5 rounded-r-xl">
                  <p className="text-xs sm:text-sm text-red-700 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="seller-username"
                    className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1"
                  >
                    Tên đăng nhập hoặc Email
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="seller-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="pl-11 w-full px-3.5 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600 text-sm"
                      placeholder="Nhập tên đăng nhập hoặc email"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="seller-password"
                    className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1"
                  >
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="seller-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-11 w-full px-3.5 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600 text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center">
                    <input
                      id="seller-remember"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    />
                    <label
                      htmlFor="seller-remember"
                      className="ml-2 block text-xs text-gray-600 dark:text-gray-400 cursor-pointer"
                    >
                      Ghi nhớ đăng nhập
                    </label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 transition shadow-md hover:shadow-lg font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang đăng nhập...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng nhập Kênh Người Bán</span>
                      <ArrowRightIcon className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Navigation Options for Buyer & New Seller */}
              <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 space-y-3 text-center">
                <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-gray-700 dark:text-gray-300">
                  <span>Chưa có tài khoản Người bán? </span>
                  <Link
                    to="/seller/register"
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 ml-1"
                  >
                    Đăng ký ngay <ArrowRightIcon className="h-3 w-3" />
                  </Link>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Bạn là người mua hàng?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                  >
                    Đăng nhập tài khoản mua
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>© 2026 Shobbe. Nền tảng thương mại điện tử dành cho Người bán.</p>
      </footer>
    </div>
  );
}

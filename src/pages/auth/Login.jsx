// src/pages/auth/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import api from "../../services/api";
import { getErrorMessage } from "../../utils/errorHandler";
import { userService } from "../../services/userService";
import CustomerAccountHeader from "../../components/customer/CustomerAccountHeader";
import CustomerAccountFooter from "../../components/customer/CustomerAccountFooter";
import GoogleAuthModal, { GoogleLogoIcon } from "../../components/auth/GoogleAuthModal";
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

const redirectByRole = (role, navigate) => {
  if (role === "ADMIN" || role === "STORE_OWNER" || role === "SELLER") {
    navigate("/admin");
    return;
  }

  if (role === "STAFF") {
    navigate("/admin/profile");
    return;
  }

  navigate("/");
};

const syncUserContext = async (response, token, role) => {
  const userId = extractUserIdFromLoginResponse(response.data);
  if (userId) {
    localStorage.setItem("userId", String(userId));
    return;
  }

  const tokenUserId = syncUserIdFromToken(token);
  if (tokenUserId) {
    return;
  }

  // Customer/User khong can ep goi profile ngay khi login.
  if (role === "CUSTOMER" || role === "USER") {
    return;
  }

  try {
    const profile = await userService.getUserProfile();
    if (profile?.id) {
      localStorage.setItem("userId", String(profile.id));
    }
  } catch {
    // Bỏ qua để không chặn flow login nếu profile fetch lỗi tạm thời.
  }
};

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleModalOpen, setGoogleModalOpen] = useState(false);

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
        throw new Error(t("auth.login.error"));
      }

      localStorage.setItem("token", token);
      const role = syncRoleFromToken(token);
      syncPermissionsFromToken(token);
      await syncUserContext(response, token, role);

      toast.success(t("auth.login.success"));
      redirectByRole(role, navigate);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.error === "EMAIL_NOT_VERIFIED" || errorData?.code === 3005) {
        const unverifiedEmail =
          errorData?.data?.email ||
          (username.includes("@") ? username.trim() : "");
        toast.error(
          errorData.message ||
            "Tài khoản chưa được xác minh email. Mã xác thực mới đã được gửi tới email của bạn.",
        );
        navigate("/verify-code", {
          state: { email: unverifiedEmail, isFromLogin: true },
        });
        return;
      }

      const message = getErrorMessage(
        err,
        t("auth.login.error"),
      );
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <CustomerAccountHeader showSearch={false} />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {t("auth.login.title")}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t("auth.login.subtitle")}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t("auth.login.username")}
                </label>
                <div className="mt-1 relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="pl-10 w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t("auth.login.usernamePlaceholder")}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t("auth.login.password")}
                </label>
                <div className="mt-1 relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t("auth.login.passwordPlaceholder")}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  {t("auth.login.rememberMe")}
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                {t("auth.login.forgotPassword")}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition shadow-md hover:shadow-lg font-medium"
            >
              {loading ? t("auth.login.submitting") : t("auth.login.submit")}
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
              <span className="flex-shrink mx-4 text-xs font-medium text-gray-400 dark:text-gray-500">
                {t("auth.orContinueWith")}
              </span>
              <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
            </div>

            <button
              type="button"
              onClick={() => setGoogleModalOpen(true)}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium transition shadow-sm hover:border-gray-400"
            >
              <GoogleLogoIcon className="w-5 h-5" />
              <span>{t("auth.googleLogin")}</span>
            </button>
          </form>

          <div className="space-y-2 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              {t("auth.login.noAccount")}{" "}
              <Link
                to="/register"
                className="font-medium text-primary hover:underline"
              >
                {t("auth.login.registerNow")}
              </Link>
            </p>
            <p className="pt-2 border-t border-gray-100 dark:border-gray-700 text-xs">
              Bạn muốn bán hàng trên Shobbe?{" "}
              <Link
                to="/seller/login"
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Đăng nhập Kênh Người Bán
              </Link>
            </p>
          </div>
        </div>
      </main>

      <CustomerAccountFooter variant="compact" />

      <GoogleAuthModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        onSuccess={(role) => redirectByRole(role, navigate)}
        mode="login"
      />
    </div>
  );
}

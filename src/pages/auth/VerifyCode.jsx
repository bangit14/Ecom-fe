// src/pages/auth/VerifyCode.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import api from "../../services/api";
import toast from "react-hot-toast";
import CustomerAccountHeader from "../../components/customer/CustomerAccountHeader";
import CustomerAccountFooter from "../../components/customer/CustomerAccountFooter";
import {
  extractUserIdFromLoginResponse,
  syncUserIdFromToken,
  syncRoleFromToken,
  syncPermissionsFromToken,
} from "../../utils/authSession";

export default function VerifyCode() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  const handleInputChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);

    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const verificationCode = code.join("");

    if (verificationCode.length !== 6) {
      setError(t("auth.verify.code"));
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/verify-code", {
        email: email,
        code: verificationCode,
      });

      const token =
        response.data?.token ||
        response.data?.accessToken ||
        response.data?.access_token ||
        response.data?.data?.token;

      if (token) {
        localStorage.setItem("token", token);
        const role = syncRoleFromToken(token);
        syncPermissionsFromToken(token);
        const userId = extractUserIdFromLoginResponse(response.data);
        if (userId) {
          localStorage.setItem("userId", String(userId));
        } else {
          syncUserIdFromToken(token);
        }
      }

      toast.success(t("auth.verify.success"));

      // Nếu từ flow Login chuyển sang thì điều hướng về Home, nếu từ Register thì về Login
      if (location.state?.isFromLogin) {
        navigate("/");
      } else {
        navigate(token ? "/" : "/login");
      }
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = t("auth.login.error");

      if (errorData) {
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await api.post("/auth/resend-code", { email });
      toast.success(t("auth.verify.resend"));
    } catch (err) {
      toast.error(err?.response?.data?.message || t("common.error"));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <CustomerAccountHeader showSearch={false} />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <ShieldCheckIcon className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("auth.verify.title")}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t("auth.verify.subtitle")}{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {email}
              </span>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
                {t("auth.verify.code")}
              </label>
              <div className="flex gap-2 justify-center">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || code.join("").length !== 6}
              className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? t("auth.login.submitting") : t("auth.verify.submit")}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("auth.verify.resend")}?{" "}
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("auth.verify.resend")}
                </button>
              </p>
            </div>
          </form>

          <div className="text-center">
            <button
              onClick={() => navigate("/register")}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
            >
              {t("common.back")}
            </button>
          </div>
        </div>
      </main>

      <CustomerAccountFooter variant="compact" />
    </div>
  );
}

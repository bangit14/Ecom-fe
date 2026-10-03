import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { EyeIcon, EyeSlashIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { userService } from "../../../services/userService";
import { getErrorMessage } from "../../../utils/errorHandler";
import { getCurrentUserId } from "../../../utils/authSession";
import PasswordRequirements from "../../../components/auth/PasswordRequirements";
import { validatePassword } from "../../../utils/passwordValidator";

export default function ChangePasswordForm() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      toast.error(t("common.notFound"));
      return;
    }

    const validation = validatePassword(form.newPassword);
    if (!validation.isValid) {
      toast.error(t("auth.register.passwordInvalid"));
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error(t("auth.register.passwordsDontMatch"));
      return;
    }

    setLoading(true);
    try {
      await userService.changePassword(currentUserId, {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });
      localStorage.setItem("userId", String(currentUserId));
      setForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success(t("account.passwordChanged"));
    } catch (err) {
      toast.error(getErrorMessage(err, t("common.error")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 dark:border-gray-700">
        <LockClosedIcon className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {t("account.changePasswordTitle")}
        </h2>
      </div>

      {/* Old Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t("account.currentPassword")}
        </label>
        <div className="relative">
          <input
            name="oldPassword"
            type={showOld ? "text" : "password"}
            value={form.oldPassword}
            onChange={handleChange}
            placeholder={t("account.currentPassword")}
            required
            className="w-full pl-3 pr-10 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="button"
            onClick={() => setShowOld(!showOld)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            {showOld ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* New Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t("account.newPassword")}
        </label>
        <div className="relative">
          <input
            name="newPassword"
            type={showNew ? "text" : "password"}
            value={form.newPassword}
            onChange={handleChange}
            placeholder={t("account.newPassword")}
            required
            className="w-full pl-3 pr-10 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            {showNew ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          </button>
        </div>
        <PasswordRequirements password={form.newPassword} />
      </div>

      {/* Confirm New Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t("account.confirmNewPassword")}
        </label>
        <div className="relative">
          <input
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder={t("account.confirmNewPassword")}
            required
            className="w-full pl-3 pr-10 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            {showConfirm ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
      >
        {loading ? t("account.saving") : t("account.changePasswordTitle")}
      </button>
    </form>
  );
}

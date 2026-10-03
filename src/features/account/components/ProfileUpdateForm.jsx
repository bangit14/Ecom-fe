import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { userService } from "../../../services/userService";
import { getErrorMessage } from "../../../utils/errorHandler";

const toInputDate = (value) => {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 10);
};

export default function ProfileUpdateForm() {
  const { t, i18n } = useTranslation();
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    dateOfBirth: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const data = await userService.getUserProfile();
        setProfile(data);
        if (data?.id) {
          localStorage.setItem("userId", String(data.id));
        }
        setForm({
          fullName: data.fullName || "",
          phone: data.phone || "",
          dateOfBirth: toInputDate(data.dateOfBirth),
        });
      } catch (err) {
        toast.error(getErrorMessage(err, t("common.error")));
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentUserId = profile?.id;
    if (!currentUserId) {
      toast.error(t("common.notFound"));
      return;
    }

    setSubmitting(true);
    try {
      await userService.updateProfile(currentUserId, {
        fullName: form.fullName,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth || null,
      });
      localStorage.setItem("userId", String(currentUserId));
      toast.success(t("account.profileUpdated"));

      const refreshed = await userService.getUserProfile();
      setProfile(refreshed);
      setForm({
        fullName: refreshed.fullName || "",
        phone: refreshed.phone || "",
        dateOfBirth: toInputDate(refreshed.dateOfBirth),
      });
    } catch (err) {
      toast.error(getErrorMessage(err, t("common.error")));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("common.loading")}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 bg-white dark:bg-gray-800 p-5 rounded-xl shadow"
    >
      <h2 className="text-lg font-semibold">{t("account.profileTitle")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="profile-id"
            className="block text-sm mb-1 text-gray-600 dark:text-gray-300"
          >
            ID
          </label>
          <input
            id="profile-id"
            value={profile?.id ?? ""}
            readOnly
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700/70"
          />
        </div>
        <div>
          <label
            htmlFor="profile-username"
            className="block text-sm mb-1 text-gray-600 dark:text-gray-300"
          >
            Username
          </label>
          <input
            id="profile-username"
            value={profile?.username || ""}
            readOnly
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700/70"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="profile-email"
          className="block text-sm mb-1 text-gray-600 dark:text-gray-300"
        >
          Email
        </label>
        <input
          id="profile-email"
          value={profile?.email || ""}
          readOnly
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700/70"
        />
      </div>

      <div>
        <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
          {t("account.fullName")}
        </label>
        <input
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder={t("account.fullName")}
          required
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
        />
      </div>

      <div>
        <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
          {t("account.phone")}
        </label>
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder={t("account.phone")}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
        />
      </div>

      <div>
        <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
          {t("account.birthday")}
        </label>
        <input
          name="dateOfBirth"
          type="date"
          value={form.dateOfBirth}
          onChange={handleChange}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? t("account.saving") : t("account.saveProfile")}
      </button>
    </form>
  );
}

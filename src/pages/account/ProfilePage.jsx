import { useTranslation } from "react-i18next";
import ProfileUpdateForm from "../../features/account/components/ProfileUpdateForm";

export default function ProfilePage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t("account.profileTitle")}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {t("account.profileSubtitle")}
        </p>
      </div>
      <ProfileUpdateForm />
    </div>
  );
}

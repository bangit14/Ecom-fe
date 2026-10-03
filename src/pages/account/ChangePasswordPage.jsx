import { useTranslation } from "react-i18next";
import ChangePasswordForm from "../../features/account/components/ChangePasswordForm";

export default function ChangePasswordPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t("account.changePasswordTitle")}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {t("account.changePasswordSubtitle")}
        </p>
      </div>
      <ChangePasswordForm />
    </div>
  );
}

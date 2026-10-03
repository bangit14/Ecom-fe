import { useTranslation } from "react-i18next";

export default function AccountVouchersPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("account.vouchersTitle")}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {t("account.profileSubtitle")}
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-600">{t("account.noVouchers")}</p>
      </div>
    </div>
  );
}

import { useTranslation } from "react-i18next";

export default function AccountNotificationsPage() {
  const { t } = useTranslation();

  const notifications = [
    {
      id: 1,
      title: t("header.orderConfirmed"),
      time: t("header.twoMinAgo"),
    },
    {
      id: 2,
      title: t("header.newDiscount"),
      time: t("header.oneHourAgo"),
    },
    {
      id: 3,
      title: t("header.wishlistDiscount"),
      time: t("header.yesterday"),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("account.notifications")}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {t("account.profileSubtitle")}
        </p>
      </div>

      <ul className="space-y-2">
        {notifications.map((item) => (
          <li key={item.id} className="rounded-xl border border-gray-200 p-3">
            <p className="text-sm font-medium text-gray-800">{item.title}</p>
            <p className="mt-1 text-xs text-gray-500">{item.time}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

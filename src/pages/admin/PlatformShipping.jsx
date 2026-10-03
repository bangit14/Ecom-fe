import { useState } from "react";
import toast from "react-hot-toast";
import {
  TruckIcon,
  PlusIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const PLATFORM_CARRIERS = [
  {
    id: 1,
    code: "GHN",
    name: "Giao Hàng Nhanh (GHN)",
    status: "ACTIVE",
    baseFee: 22000,
    extraFeePerKg: 5000,
    codSupport: true,
    webhookUrl: "http://api.shobbe.vn/api/webhooks/shipping/ghn",
    coverage: "63 tỉnh thành",
  },
  {
    id: 2,
    code: "GHTK",
    name: "Giao Hàng Tiết Kiệm (GHTK)",
    status: "ACTIVE",
    baseFee: 18000,
    extraFeePerKg: 4500,
    codSupport: true,
    webhookUrl: "http://api.shobbe.vn/api/webhooks/shipping/ghtk",
    coverage: "63 tỉnh thành",
  },
  {
    id: 3,
    code: "AHAMOVE",
    name: "Ahamove Instant",
    status: "ACTIVE",
    baseFee: 25000,
    extraFeePerKg: 8000,
    codSupport: true,
    webhookUrl: "http://api.shobbe.vn/api/webhooks/shipping/ahamove",
    coverage: "Hà Nội, TP.HCM, Đà Nẵng",
  },
];

export default function PlatformShipping() {
  const [carriers, setCarriers] = useState(PLATFORM_CARRIERS);

  const handleToggleStatus = (id) => {
    setCarriers((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
          : c,
      ),
    );
    toast.success("Đã cập nhật trạng thái nhà vận chuyển toàn sàn!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
          Quản Lý Vận Chuyển Cấp Sàn
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Hợp đồng đối tác vận chuyển, cấu hình Webhook nhận trạng thái tự động và bảng giá cước chuẩn
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {carriers.map((c) => (
          <div
            key={c.id}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-base text-gray-900 dark:text-white">
                {c.name}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  c.status === "ACTIVE"
                    ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {c.status === "ACTIVE" ? "Đang kết nối" : "Tạm ngưng"}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
              <p>Mã hệ thống: <strong className="font-mono text-blue-600">{c.code}</strong></p>
              <p>Phí cơ bản: <strong>{c.baseFee.toLocaleString("vi-VN")} đ</strong> / kg đầu</p>
              <p>Mỗi kg tiếp theo: <strong>+{c.extraFeePerKg.toLocaleString("vi-VN")} đ</strong></p>
              <p>Khu vực phủ sóng: <strong>{c.coverage}</strong></p>
              <p className="text-[10px] font-mono text-gray-400 truncate mt-1">Webhook: {c.webhookUrl}</p>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                type="button"
                onClick={() => handleToggleStatus(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  c.status === "ACTIVE"
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {c.status === "ACTIVE" ? "Tạm ngưng kết nối" : "Kích hoạt"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

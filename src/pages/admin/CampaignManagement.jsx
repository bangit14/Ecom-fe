import { useState } from "react";
import toast from "react-hot-toast";
import {
  SparklesIcon,
  PlusIcon,
  TagIcon,
  PhotoIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const PLATFORM_CAMPAIGNS = [
  {
    id: "CAMP-99",
    name: "SIÊU SALE 9.9 - TRIỆU DEAL 0Đ TOÀN SÀN",
    discountBudget: "500.000.000 đ",
    participatingShops: 450,
    startDate: "05/09/2026",
    endDate: "15/09/2026",
    status: "ACTIVE",
  },
  {
    id: "CAMP-1010",
    name: "SIÊU HỘI MUA SẮM 10.10 - FREESHIP MỌI MIỀN",
    discountBudget: "800.000.000 đ",
    participatingShops: 120,
    startDate: "01/10/2026",
    endDate: "12/10/2026",
    status: "UPCOMING",
  },
];

const PLATFORM_VOUCHERS = [
  {
    id: 1,
    code: "SHOBBEALL50K",
    name: "Voucher Sàn Giảm 50.000đ Đơn Từ 300.000đ",
    type: "FIXED",
    discount: 50000,
    minOrder: 300000,
    totalCount: 5000,
    usedCount: 3840,
    status: "ACTIVE",
  },
  {
    id: 2,
    code: "FREESHIPMAX",
    name: "Miễn Phí Vận Chuyển Toàn Sàn Tối Đa 30.000đ",
    type: "SHIPPING",
    discount: 30000,
    minOrder: 150000,
    totalCount: 10000,
    usedCount: 9240,
    status: "ACTIVE",
  },
];

export default function CampaignManagement() {
  const [activeTab, setActiveTab] = useState("CAMPAIGNS");
  const [campaigns, setCampaigns] = useState(PLATFORM_CAMPAIGNS);
  const [vouchers, setVouchers] = useState(PLATFORM_VOUCHERS);

  const handleCreateCampaign = () => {
    const name = globalThis.prompt("Nhập tên chiến dịch khuyến mãi mới:") || "Chiến dịch Sale Cuối Tuần";
    const newCamp = {
      id: `CAMP-${Date.now().toString().slice(-4)}`,
      name,
      discountBudget: "200.000.000 đ",
      participatingShops: 50,
      startDate: "15/09/2026",
      endDate: "20/09/2026",
      status: "ACTIVE",
    };
    setCampaigns((prev) => [newCamp, ...prev]);
    toast.success("Đã tạo chiến dịch Mega Sale toàn sàn thành công!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
            Khuyến Mãi Cấp Sàn & Chiến Dịch Mega Sale
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Quản lý chiến dịch khuyến mãi toàn sàn, kho voucher Shobbe và vị trí hiển thị ưu tiên
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateCampaign}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Tạo chiến dịch mới</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-2 flex gap-2 shadow-2xs">
        <button
          onClick={() => setActiveTab("CAMPAIGNS")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "CAMPAIGNS" ? "bg-blue-600 text-white shadow-xs" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <SparklesIcon className="h-4 w-4" />
          <span>Chiến dịch Mega Sale ({campaigns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("VOUCHERS")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "VOUCHERS" ? "bg-blue-600 text-white shadow-xs" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <TagIcon className="h-4 w-4" />
          <span>Voucher Toàn Sàn ({vouchers.length})</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      {activeTab === "CAMPAIGNS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                  {c.id}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    c.status === "ACTIVE"
                      ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {c.status === "ACTIVE" ? "Đang diễn ra" : "Sắp diễn ra"}
                </span>
              </div>

              <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
                {c.name}
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div>
                  <p className="text-[11px] text-gray-400">Ngân sách tài trợ:</p>
                  <p className="font-bold text-blue-600">{c.discountBudget}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Shop tham gia:</p>
                  <p className="font-bold">{c.participatingShops} Shop</p>
                </div>
              </div>

              <p className="text-[11px] text-gray-400">
                Thời gian: {c.startDate} - {c.endDate}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Platform Vouchers */}
      {activeTab === "VOUCHERS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vouchers.map((v) => (
            <div
              key={v.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-2xs space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-red-600 bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded">
                  {v.code}
                </span>
                <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 font-bold text-[10px]">
                  Hiệu lực
                </span>
              </div>
              <p className="font-bold text-gray-900 dark:text-gray-100">{v.name}</p>
              <p className="text-gray-500">Đơn tối thiểu: {v.minOrder.toLocaleString("vi-VN")} đ</p>
              <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-gray-500">
                <span>Đã phát hành: {v.totalCount} lượt</span>
                <span>Đã sử dụng: <strong className="text-blue-600">{v.usedCount}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

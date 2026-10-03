import { useState } from "react";
import toast from "react-hot-toast";
import {
  BuildingStorefrontIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  LockClosedIcon,
  LockOpenIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

const INITIAL_SHOPS = [
  {
    id: "SHOP-1001",
    name: "Coolmate Official Store",
    owner: "nguyen_van_a",
    email: "coolmate.vn@gmail.com",
    phone: "0987654321",
    tier: "MALL", // MALL, PREFERRED, REGULAR
    status: "ACTIVE", // ACTIVE, PENDING_APPROVAL, SUSPENDED, BANNED
    totalProducts: 142,
    totalSales: 4520,
    rating: 4.9,
    registeredAt: "10/01/2026",
  },
  {
    id: "SHOP-1002",
    name: "Thời Trang Sneaker Retro",
    owner: "le_thi_bich",
    email: "sneaker.retro@gmail.com",
    phone: "0912345678",
    tier: "PREFERRED",
    status: "ACTIVE",
    totalProducts: 48,
    totalSales: 890,
    rating: 4.8,
    registeredAt: "15/05/2026",
  },
  {
    id: "SHOP-1003",
    name: "Mỹ Phẩm Xách Tay Korea",
    owner: "tran_thu_ha",
    email: "korea.cosmetics@gmail.com",
    phone: "0934567890",
    tier: "REGULAR",
    status: "PENDING_APPROVAL",
    totalProducts: 12,
    totalSales: 0,
    rating: 5.0,
    registeredAt: "13/09/2026",
  },
  {
    id: "SHOP-1004",
    name: "Phụ Kiện Điện Thoại Giá Sỉ",
    owner: "hoang_long",
    email: "phukien.long@gmail.com",
    phone: "0977889900",
    tier: "REGULAR",
    status: "SUSPENDED",
    totalProducts: 35,
    totalSales: 310,
    rating: 3.2,
    registeredAt: "20/03/2026",
  },
];

export default function ShopsManagement() {
  const [shops, setShops] = useState(INITIAL_SHOPS);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredShops = shops.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === "ALL") return true;
    return s.status === activeTab;
  });

  const handleApproveShop = (id) => {
    setShops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "ACTIVE" } : s)),
    );
    toast.success(`Đã phê duyệt gian hàng ${id} mở bán trên sàn Shobbe!`);
  };

  const handleToggleTier = (id, currentTier) => {
    const nextTier =
      currentTier === "REGULAR" ? "PREFERRED" : currentTier === "PREFERRED" ? "MALL" : "REGULAR";
    setShops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, tier: nextTier } : s)),
    );
    toast.success(`Đã cập nhật nhãn gian hàng thành ${nextTier}!`);
  };

  const handleToggleStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setShops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: nextStatus } : s)),
    );
    toast.success(nextStatus === "SUSPENDED" ? "Đã tạm dừng hoạt động gian hàng!" : "Đã kích hoạt lại gian hàng!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
          Quản Lý & Duyệt Gian Hàng (Shops)
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Xét duyệt hồ sơ shop mới, cấp nhãn Shop Yêu Thích / Shobbe Mall và kiểm soát vi phạm
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-2 flex flex-wrap gap-1 shadow-2xs">
        {[
          { key: "ALL", label: "Tất cả", count: shops.length },
          { key: "ACTIVE", label: "Đang hoạt động", count: shops.filter((s) => s.status === "ACTIVE").length },
          { key: "PENDING_APPROVAL", label: "Chờ xét duyệt", count: shops.filter((s) => s.status === "PENDING_APPROVAL").length },
          { key: "SUSPENDED", label: "Đang tạm dừng / Phạt", count: shops.filter((s) => s.status === "SUSPENDED").length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === tab.key
                ? "bg-blue-600 text-white shadow-xs"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.key ? "bg-white/20 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm theo tên shop, chủ shop, mã shop..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/30"
        />
      </div>

      {/* Shops Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500 font-bold bg-gray-50/60 dark:bg-gray-800/40">
                <th className="p-4">Gian hàng</th>
                <th className="p-4">Chủ sở hữu</th>
                <th className="p-4">Phân hạng (Tier)</th>
                <th className="p-4">Sản phẩm / Doanh số</th>
                <th className="p-4">Đánh giá</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredShops.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <td className="p-4">
                    <p className="font-bold text-gray-900 dark:text-gray-100">{s.name}</p>
                    <p className="text-[11px] text-gray-400 font-mono">ID: {s.id} • Ngày tạo: {s.registeredAt}</p>
                  </td>

                  <td className="p-4">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{s.owner}</p>
                    <p className="text-[11px] text-gray-500">{s.email}</p>
                  </td>

                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => handleToggleTier(s.id, s.tier)}
                      title="Click để đổi phân hạng"
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer transition-transform hover:scale-105 ${
                        s.tier === "MALL"
                          ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200"
                          : s.tier === "PREFERRED"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {s.tier === "MALL" && "👑 Shobbe Mall"}
                      {s.tier === "PREFERRED" && "⭐ Shop Yêu Thích"}
                      {s.tier === "REGULAR" && "Shop Thường"}
                    </button>
                  </td>

                  <td className="p-4 text-gray-700 dark:text-gray-300">
                    <p className="font-semibold">{s.totalProducts} SP</p>
                    <p className="text-[11px] text-gray-400">Đã bán: {s.totalSales}</p>
                  </td>

                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-500">
                      ★ {s.rating}
                    </span>
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === "ACTIVE"
                          ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                          : s.status === "PENDING_APPROVAL"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                      }`}
                    >
                      {s.status === "ACTIVE" && "Đang bán"}
                      {s.status === "PENDING_APPROVAL" && "Chờ duyệt"}
                      {s.status === "SUSPENDED" && "Tạm ngưng"}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {s.status === "PENDING_APPROVAL" && (
                        <button
                          type="button"
                          onClick={() => handleApproveShop(s.id)}
                          className="px-2.5 py-1 rounded-lg bg-green-600 text-white font-bold text-[11px] hover:bg-green-700 cursor-pointer shadow-2xs"
                        >
                          Duyệt mở shop
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(s.id, s.status)}
                        title={s.status === "ACTIVE" ? "Tạm ngưng shop" : "Kích hoạt shop"}
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        {s.status === "ACTIVE" ? <LockClosedIcon className="h-4 w-4 text-red-500" /> : <LockOpenIcon className="h-4 w-4 text-green-600" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

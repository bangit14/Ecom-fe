import { useState } from "react";
import toast from "react-hot-toast";
import {
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowDownTrayIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

const WITHDRAWAL_REQUESTS = [
  {
    id: "REQ-77401",
    shopName: "Coolmate Official Store",
    amount: 15000000,
    bankName: "Vietcombank",
    accountNumber: "0971000888666",
    accountHolder: "CONG TY TNHH COOLMATE",
    requestedAt: "13/09/2026 14:00",
    status: "PENDING",
  },
  {
    id: "REQ-77395",
    shopName: "Thời Trang Sneaker Retro",
    amount: 3200000,
    bankName: "Techcombank",
    accountNumber: "19034567891234",
    accountHolder: "LE THI BICH",
    requestedAt: "13/09/2026 09:30",
    status: "PENDING",
  },
  {
    id: "REQ-77380",
    shopName: "Mỹ Phẩm Korea",
    amount: 4800000,
    bankName: "MBBank",
    accountNumber: "888899990000",
    accountHolder: "TRAN THU HA",
    requestedAt: "12/09/2026 17:10",
    status: "COMPLETED",
  },
];

export default function PlatformFinance() {
  const [requests, setRequests] = useState(WITHDRAWAL_REQUESTS);

  const platformStats = {
    totalGMV: 1845000000, // 1.84 tỷ VNĐ
    platformRevenue: 92250000, // 5% hoa hồng
    escrowHolding: 215000000, // Tiền đang tạm giữ chờ giao hàng
    pendingWithdrawal: 18200000, // Tiền seller yêu cầu rút
  };

  const handleApprove = (id) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "COMPLETED" } : r)),
    );
    toast.success(`Đã phê duyệt lệnh rút tiền ${id}! Tiền đã chuyển về tài khoản ngân hàng của Seller.`);
  };

  const handleReject = (id) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "REJECTED" } : r)),
    );
    toast.error(`Đã từ chối lệnh rút tiền ${id}! Tiền đã hoàn lại ví Seller.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
          Tài Chính Sàn & Đối Soát Thanh Toán
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Tổng quan dòng tiền sàn, doanh thu hoa hồng và duyệt lệnh rút tiền của người bán
        </p>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-gray-500">Tổng GMV toàn sàn</span>
          <p className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
            {(platformStats.totalGMV / 1000000000).toFixed(2)} Tỷ đ
          </p>
          <span className="text-[11px] text-green-600 font-bold">+24.5% tháng này</span>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-gray-500">Doanh thu sàn (Hoa hồng 5%)</span>
          <p className="text-xl sm:text-2xl font-extrabold text-blue-600">
            {platformStats.platformRevenue.toLocaleString("vi-VN")} đ
          </p>
          <span className="text-[11px] text-gray-400">Thực thu từ giao dịch</span>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-gray-500">Tiền tạm giữ (Escrow)</span>
          <p className="text-xl sm:text-2xl font-extrabold text-amber-600">
            {platformStats.escrowHolding.toLocaleString("vi-VN")} đ
          </p>
          <span className="text-[11px] text-gray-400">Chờ đơn giao thành công</span>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-gray-500">Yêu cầu rút chờ duyệt</span>
          <p className="text-xl sm:text-2xl font-extrabold text-red-600">
            {platformStats.pendingWithdrawal.toLocaleString("vi-VN")} đ
          </p>
          <span className="text-[11px] text-red-500 font-semibold">{requests.filter((r) => r.status === "PENDING").length} lệnh cần duyệt</span>
        </div>
      </div>

      {/* Withdrawal Approval Queue */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs overflow-hidden space-y-4 p-6">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
          Danh sách yêu cầu rút tiền của Seller
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500 font-bold bg-gray-50/60 dark:bg-gray-800/40">
                <th className="p-3">Mã lệnh</th>
                <th className="p-3">Gian hàng</th>
                <th className="p-3">Số tiền rút</th>
                <th className="p-3">Tài khoản thụ hưởng</th>
                <th className="p-3">Thời gian tạo</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 text-right">Xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:border-gray-800">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <td className="p-3 font-mono font-bold text-gray-900 dark:text-gray-100">{r.id}</td>
                  <td className="p-3 font-semibold text-gray-800 dark:text-gray-200">{r.shopName}</td>
                  <td className="p-3 font-extrabold text-sm text-blue-600 dark:text-blue-400">
                    {r.amount.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="p-3">
                    <p className="font-bold text-gray-900 dark:text-gray-100">{r.accountHolder}</p>
                    <p className="text-[11px] text-gray-500 font-mono">{r.bankName} - {r.accountNumber}</p>
                  </td>
                  <td className="p-3 text-gray-500">{r.requestedAt}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.status === "COMPLETED"
                          ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                          : r.status === "PENDING"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                      }`}
                    >
                      {r.status === "COMPLETED" && "Đã chuyển tiền"}
                      {r.status === "PENDING" && "Chờ duyệt"}
                      {r.status === "REJECTED" && "Từ chối"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {r.status === "PENDING" ? (
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleReject(r.id)}
                          className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-bold"
                        >
                          Từ chối
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(r.id)}
                          className="px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700 font-bold shadow-2xs"
                        >
                          Duyệt chuyển tiền
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 font-medium">Đã xử lý</span>
                    )}
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

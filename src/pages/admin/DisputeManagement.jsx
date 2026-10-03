import { useState } from "react";
import toast from "react-hot-toast";
import {
  ScaleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

const DISPUTES = [
  {
    id: "DISP-501",
    orderId: "ORD-98214",
    buyer: "Trần Minh Quân",
    seller: "Coolmate Official Store",
    reason: "Hàng nhận được bị rách chỉ ở phần tay áo, yêu cầu hoàn tiền",
    amount: 150000,
    evidenceImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80",
    status: "PENDING_ARBITRATION", // PENDING_ARBITRATION, REFUNDED_TO_BUYER, REJECTED
    createdAt: "13/09/2026 15:00",
  },
  {
    id: "DISP-502",
    orderId: "ORD-98100",
    buyer: "Võ Thị Hằng",
    seller: "Thời Trang Sneaker Retro",
    reason: "Giao sai size giày (đặt 38 giao 40)",
    amount: 550000,
    evidenceImage: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=200&q=80",
    status: "REFUNDED_TO_BUYER",
    createdAt: "11/09/2026 10:15",
  },
];

export default function DisputeManagement() {
  const [disputes, setDisputes] = useState(DISPUTES);

  const handleRefundBuyer = (id) => {
    setDisputes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "REFUNDED_TO_BUYER" } : d)),
    );
    toast.success(`Trọng tài sàn quyết định: Hoàn tiền ${disputes.find((d) => d.id === id)?.amount.toLocaleString("vi-VN")} đ cho Người mua.`);
  };

  const handleRejectDispute = (id) => {
    setDisputes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "REJECTED" } : d)),
    );
    toast.error(`Bác bỏ khiếu nại ${id}. Tiền hàng được chuyển tiếp cho Seller.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
          Giải Quyết Tranh Chấp & Khiếu Nại (Disputes)
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Trọng tài xử lý khiếu nại giữa Người Mua và Người Bán, quyết định hoàn tiền hoặc đóng băng đơn
        </p>
      </div>

      <div className="space-y-4">
        {disputes.map((d) => (
          <div
            key={d.id}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-2xs space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-extrabold text-sm text-gray-900 dark:text-white">{d.id}</span>
                <span className="text-gray-400">•</span>
                <span className="text-blue-600 font-mono font-bold">Đơn #{d.orderId}</span>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  d.status === "PENDING_ARBITRATION"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    : d.status === "REFUNDED_TO_BUYER"
                      ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {d.status === "PENDING_ARBITRATION" && "Chờ trọng tài sàn xử lý"}
                {d.status === "REFUNDED_TO_BUYER" && "Đã hoàn tiền cho Người mua"}
                {d.status === "REJECTED" && "Bác bỏ khiếu nại"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40">
              <p>Người khiếu nại (Buyer): <strong className="text-gray-900 dark:text-white">{d.buyer}</strong></p>
              <p>Bên bị khiếu nại (Seller): <strong className="text-gray-900 dark:text-white">{d.seller}</strong></p>
              <p className="md:col-span-2 text-red-600 dark:text-red-400">
                Lý do: <strong>{d.reason}</strong> (Số tiền tranh chấp: <strong>{d.amount.toLocaleString("vi-VN")} đ</strong>)
              </p>
            </div>

            {d.status === "PENDING_ARBITRATION" && (
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => handleRejectDispute(d.id)}
                  className="px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-bold"
                >
                  Bác bỏ khiếu nại (Thanh toán cho Seller)
                </button>
                <button
                  type="button"
                  onClick={() => handleRefundBuyer(d.id)}
                  className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-2xs"
                >
                  Duyệt hoàn tiền cho Buyer ({d.amount.toLocaleString("vi-VN")} đ)
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState } from "react";
import toast from "react-hot-toast";
import {
  TicketIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckCircleIcon,
  ClockIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

const TICKETS = [
  {
    id: "TCK-9901",
    requester: "Coolmate Official Store",
    type: "SELLER_SUPPORT",
    subject: "Hỗ trợ kết nối webhook đơn vị vận chuyển GHN bị timeout",
    priority: "HIGH",
    assignedTo: "Kỹ thuật - Lê Văn C",
    status: "IN_PROGRESS",
    createdAt: "13/09/2026 13:20",
  },
  {
    id: "TCK-9902",
    requester: "Phạm Thu Thảo (Buyer)",
    type: "BUYER_SUPPORT",
    subject: "Tài khoản không nhận được mã OTP xác thực email",
    priority: "MEDIUM",
    assignedTo: "CSKH - Nguyễn Thị D",
    status: "RESOLVED",
    createdAt: "12/09/2026 09:45",
  },
  {
    id: "TCK-9903",
    requester: "Thời Trang Sneaker",
    type: "SELLER_SUPPORT",
    subject: "Yêu cầu nâng cấp nhãn gian hàng lên Shobbe Mall",
    priority: "LOW",
    assignedTo: "Thương mại - Trần Văn E",
    status: "OPEN",
    createdAt: "13/09/2026 15:10",
  },
];

export default function TicketManagement() {
  const [tickets, setTickets] = useState(TICKETS);

  const handleResolveTicket = (id) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "RESOLVED" } : t)),
    );
    toast.success(`Ticket ${id} đã được đánh dấu Đã xử lý xong!`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
          Hệ Thống CSKH & Ticket Hỗ Trợ Nội Bộ
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Tiếp nhận yêu cầu hỗ trợ từ Buyer & Seller, phân công xử lý theo phòng ban
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500 font-bold bg-gray-50/60 dark:bg-gray-800/40">
                <th className="p-4">Mã Ticket</th>
                <th className="p-4">Người yêu cầu</th>
                <th className="p-4">Chủ đề & Nội dung</th>
                <th className="p-4">Độ ưu tiên</th>
                <th className="p-4">Phụ trách</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:border-gray-800">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <td className="p-4 font-mono font-bold text-gray-900 dark:text-gray-100">{t.id}</td>
                  <td className="p-4 font-semibold text-gray-800 dark:text-gray-200">{t.requester}</td>
                  <td className="p-4 max-w-xs">
                    <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{t.subject}</p>
                    <span className="text-[10px] text-gray-400">{t.createdAt}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        t.priority === "HIGH"
                          ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                          : t.priority === "MEDIUM"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="p-4 text-gray-700 dark:text-gray-300 font-medium">{t.assignedTo}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === "RESOLVED"
                          ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                          : t.status === "IN_PROGRESS"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {t.status === "RESOLVED" ? "Đã giải quyết" : t.status === "IN_PROGRESS" ? "Đang xử lý" : "Mới tiếp nhận"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {t.status !== "RESOLVED" ? (
                      <button
                        type="button"
                        onClick={() => handleResolveTicket(t.id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg cursor-pointer"
                      >
                        Đóng ticket
                      </button>
                    ) : (
                      <span className="text-gray-400">Đã đóng</span>
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

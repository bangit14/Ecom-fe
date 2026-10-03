import { useState } from "react";
import toast from "react-hot-toast";
import {
  ShieldCheckIcon,
  PlusIcon,
  UserPlusIcon,
  KeyIcon,
  CheckCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const ROLES = [
  {
    id: "ROLE_SUPER_ADMIN",
    name: "Super Administrator (Quản trị tối cao)",
    description: "Toàn quyền quản trị hệ thống, tài chính, phân quyền và cấu hình sàn",
    usersCount: 2,
    permissions: ["ALL_PRIVILEGES", "MANAGE_FINANCE", "MANAGE_USERS", "SYSTEM_SETTINGS"],
  },
  {
    id: "ROLE_MODERATOR",
    name: "Kiểm duyệt viên nội dung (Content Moderator)",
    description: "Kiểm duyệt sản phẩm mới, duyệt hồ sơ shop, xử lý hàng cấm/hàng giả",
    usersCount: 5,
    permissions: ["APPROVE_PRODUCTS", "APPROVE_SHOPS", "MODERATE_REVIEWS"],
  },
  {
    id: "ROLE_FINANCE_ADMIN",
    name: "Kế toán & Tài chính sàn (Finance Admin)",
    description: "Quản lý dòng tiền, duyệt lệnh rút tiền của Seller, đối soát nhà vận chuyển",
    usersCount: 3,
    permissions: ["VIEW_REVENUE", "APPROVE_WITHDRAWALS", "RECONCILE_CARRIERS"],
  },
  {
    id: "ROLE_SUPPORT_AGENT",
    name: "Chăm sóc khách hàng & Xử lý khiếu nại (CS Agent)",
    description: "Tiếp nhận ticket hỗ trợ, giải quyết tranh chấp buyer - seller",
    usersCount: 8,
    permissions: ["MANAGE_TICKETS", "ARBITRATE_DISPUTES", "CHAT_SUPPORT"],
  },
];

export default function RolesManagement() {
  const [roles, setRoles] = useState(ROLES);

  const handleAddNewRole = () => {
    const roleName = globalThis.prompt("Nhập tên vai trò mới:") || "Nhân viên vận hành sàn";
    const newR = {
      id: `ROLE_${Date.now().toString().slice(-4)}`,
      name: roleName,
      description: "Vai trò tùy chỉnh được tạo bởi Super Admin",
      usersCount: 1,
      permissions: ["MANAGE_PRODUCTS", "VIEW_REPORTS"],
    };
    setRoles((prev) => [...prev, newR]);
    toast.success(`Đã tạo vai trò mới: ${roleName}!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
            Phân Quyền Nhân Viên Sàn (RBAC)
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Quản lý vai trò (Roles) và ma trận quyền hạn (Permissions) cho đội ngũ vận hành sàn Shobbe
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddNewRole}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Tạo vai trò mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((r) => (
          <div
            key={r.id}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-2xs space-y-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded text-[11px]">
                {r.id}
              </span>
              <span className="text-gray-500 font-semibold">{r.usersCount} nhân sự</span>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">{r.name}</h3>
              <p className="text-gray-500 mt-1">{r.description}</p>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Quyền hạn:</p>
              <div className="flex flex-wrap gap-1.5">
                {r.permissions.map((p, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-[10px]">
                    ✓ {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

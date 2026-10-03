import { useState } from "react";
import toast from "react-hot-toast";
import {
  UserGroupIcon,
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  XMarkIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";

const INITIAL_STAFF = [
  {
    id: 1,
    fullName: "Nguyễn Văn Tuấn",
    username: "tuan_packer",
    email: "tuan.packer@gmail.com",
    role: "Xử lý & Đóng gói đơn",
    permissions: ["Xem đơn hàng", "In phiếu gửi hàng", "Xác nhận đơn"],
    status: "ACTIVE",
    lastLogin: "13/09/2026 15:20",
  },
  {
    id: 2,
    fullName: "Trần Thị Mai",
    username: "mai_cskh",
    email: "mai.cskh@gmail.com",
    role: "Chăm sóc khách hàng",
    permissions: ["Chat với khách", "Phản hồi đánh giá", "Xem sản phẩm"],
    status: "ACTIVE",
    lastLogin: "13/09/2026 14:10",
  },
  {
    id: 3,
    fullName: "Lê Quốc Bảo",
    username: "bao_marketing",
    email: "bao.mkt@gmail.com",
    role: "Chuyên viên Marketing",
    permissions: ["Tạo Voucher", "Cài đặt Flash Sale", "Xem báo cáo doanh số"],
    status: "ACTIVE",
    lastLogin: "12/09/2026 18:40",
  },
];

export default function SellerStaff() {
  const [staffList, setStaffList] = useState(INITIAL_STAFF);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    role: "Xử lý & Đóng gói đơn",
  });

  const handleAddStaff = (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.username.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const newStaff = {
      id: Date.now(),
      fullName: form.fullName.trim(),
      username: form.username.trim(),
      email: form.email.trim() || `${form.username}@gmail.com`,
      role: form.role,
      permissions:
        form.role === "Xử lý & Đóng gói đơn"
          ? ["Xem đơn hàng", "In phiếu gửi hàng", "Xác nhận đơn"]
          : form.role === "Chăm sóc khách hàng"
            ? ["Chat với khách", "Phản hồi đánh giá"]
            : ["Tạo Voucher", "Xem báo cáo doanh số"],
      status: "ACTIVE",
      lastLogin: "Chưa đăng nhập",
    };

    setStaffList((prev) => [newStaff, ...prev]);
    toast.success(`Đã thêm nhân viên ${newStaff.fullName} thành công!`);
    setShowModal(false);
  };

  const handleDeleteStaff = (id) => {
    if (globalThis.confirm("Bạn có chắc chắn muốn xóa nhân viên này khỏi gian hàng?")) {
      setStaffList((prev) => prev.filter((s) => s.id !== id));
      toast.success("Đã xóa nhân viên");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
            Nhân Viên & Phân Quyền Shop
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Tạo tài khoản phụ (Sub-accounts) và phân công quyền hạn cho nhân viên xử lý đơn, CSKH, marketing
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setForm({
              fullName: "",
              username: "",
              email: "",
              password: "",
              role: "Xử lý & Đóng gói đơn",
            });
            setShowModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Thêm nhân viên mới</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500 font-bold bg-gray-50/60 dark:bg-gray-800/40">
                <th className="p-4">Nhân viên</th>
                <th className="p-4">Tên đăng nhập</th>
                <th className="p-4">Vai trò</th>
                <th className="p-4">Quyền hạn được cấp</th>
                <th className="p-4">Lần đăng nhập cuối</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {staffList.map((st) => (
                <tr key={st.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <td className="p-4">
                    <p className="font-bold text-gray-900 dark:text-gray-100">{st.fullName}</p>
                    <p className="text-[11px] text-gray-500">{st.email}</p>
                  </td>
                  <td className="p-4 font-mono text-gray-700 dark:text-gray-300">{st.username}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold text-[11px]">
                      {st.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {st.permissions.map((p, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px]">
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-gray-500">{st.lastLogin}</td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteStaff(st.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Staff */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Thêm tài khoản nhân viên phụ</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Họ và tên nhân viên</label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Văn Tuấn"
                  value={form.fullName}
                  onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Tên đăng nhập</label>
                <input
                  type="text"
                  placeholder="tuan_nv"
                  value={form.username}
                  onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Mật khẩu khởi tạo</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Vai trò & Phân quyền</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
                >
                  <option value="Xử lý & Đóng gói đơn">Xử lý & Đóng gói đơn (Kho)</option>
                  <option value="Chăm sóc khách hàng">Chăm sóc khách hàng (CSKH / Chat)</option>
                  <option value="Chuyên viên Marketing">Chuyên viên Marketing (Khuyến mãi / Voucher)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-600 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

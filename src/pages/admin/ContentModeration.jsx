import { useState } from "react";
import toast from "react-hot-toast";
import {
  ShieldExclamationIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  FlagIcon,
} from "@heroicons/react/24/outline";

const PENDING_PRODUCTS = [
  {
    id: 301,
    name: "Đồng Hồ Thông Minh Sport T500 Bluetooth",
    shop: "Coolmate Official Store",
    category: "Thiết Bị Điện Tử",
    price: 350000,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80",
    reason: "Sản phẩm điện tử mới đăng - cần duyệt kiểm định nguồn gốc",
    submittedAt: "13/09/2026 14:10",
  },
  {
    id: 302,
    name: "Bộ Kem Dưỡng Trắng Da Ban Đêm Cao Cấp",
    shop: "Mỹ Phẩm Korea",
    category: "Mỹ Phẩm & Làm Đẹp",
    price: 490000,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=200&q=80",
    reason: "Ngành hàng mỹ phẩm - cần kiểm tra công bố chất lượng",
    submittedAt: "13/09/2026 11:30",
  },
];

const REPORTED_REVIEWS = [
  {
    id: 501,
    productName: "Áo Khoác Gió Nam Thể Thao",
    shop: "Thời Trang Sneaker Retro",
    reportedUser: "pham_hung",
    comment: "Hàng này là hàng giả hàng nhái lừa đảo, mọi người đừng mua!!!",
    reportReason: "Bị báo cáo: Nghi vấn vu khống hoặc spam từ đối thủ cạnh tranh",
    date: "12/09/2026",
  },
];

export default function ContentModeration() {
  const [activeTab, setActiveTab] = useState("PRODUCTS"); // PRODUCTS, REVIEWS
  const [pendingProducts, setPendingProducts] = useState(PENDING_PRODUCTS);
  const [reportedReviews, setReportedReviews] = useState(REPORTED_REVIEWS);

  const handleApproveProduct = (id) => {
    setPendingProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success(`Đã duyệt sản phẩm #${id} lên sàn thành công!`);
  };

  const handleRejectProduct = (id) => {
    const reason = globalThis.prompt("Nhập lý do từ chối kiểm duyệt:") || "Vi phạm quy định hình ảnh/thông tin sản phẩm";
    setPendingProducts((prev) => prev.filter((p) => p.id !== id));
    toast.error(`Đã từ chối sản phẩm #${id}. Lý do: ${reason}`);
  };

  const handleDeleteReview = (id) => {
    setReportedReviews((prev) => prev.filter((r) => r.id !== id));
    toast.success(`Đã xóa đánh giá vi phạm #${id}`);
  };

  const handleKeepReview = (id) => {
    setReportedReviews((prev) => prev.filter((r) => r.id !== id));
    toast.success(`Đã giữ lại đánh giá #${id} (Hợp lệ)`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
          Kiểm Duyệt Nội Dung & An Toàn Sàn
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Hàng đợi kiểm duyệt sản phẩm mới đăng, quét hàng cấm/hàng giả và xử lý đánh giá bị báo cáo
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-2 flex gap-2 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab("PRODUCTS")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "PRODUCTS" ? "bg-blue-600 text-white shadow-xs" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <ShieldExclamationIcon className="h-4 w-4" />
          <span>Sản phẩm chờ duyệt ({pendingProducts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("REVIEWS")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "REVIEWS" ? "bg-blue-600 text-white shadow-xs" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <FlagIcon className="h-4 w-4" />
          <span>Đánh giá bị báo cáo ({reportedReviews.length})</span>
        </button>
      </div>

      {/* Products Queue */}
      {activeTab === "PRODUCTS" && (
        <div className="space-y-4">
          {pendingProducts.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center text-gray-500 text-xs">
              🎉 Tuyệt vời! Không còn sản phẩm nào đang chờ kiểm duyệt.
            </div>
          ) : (
            pendingProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <img src={p.image} alt={p.name} className="w-16 h-16 rounded-xl object-cover border border-gray-100 dark:border-gray-800 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-gray-900 dark:text-gray-100">{p.name}</span>
                      <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 text-[10px] font-bold">
                        {p.category}
                      </span>
                    </div>
                    <p className="text-gray-500 mt-0.5">
                      Gian hàng: <strong className="text-gray-800 dark:text-gray-200">{p.shop}</strong> • Giá bán: <strong className="text-blue-600">{p.price.toLocaleString("vi-VN")} đ</strong>
                    </p>
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
                      ⚠️ {p.reason}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleRejectProduct(p.id)}
                    className="px-3.5 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-bold cursor-pointer"
                  >
                    Từ chối
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproveProduct(p.id)}
                    className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-xs cursor-pointer"
                  >
                    Duyệt lên sàn
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reviews Queue */}
      {activeTab === "REVIEWS" && (
        <div className="space-y-4">
          {reportedReviews.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center text-gray-500 text-xs">
              Không có đánh giá nào bị khiếu nại.
            </div>
          ) : (
            reportedReviews.map((r) => (
              <div
                key={r.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-2xs space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold text-gray-900 dark:text-gray-100">
                    Người đánh giá: {r.reportedUser} • Sản phẩm: {r.productName} ({r.shop})
                  </p>
                  <span className="text-[11px] text-gray-400">{r.date}</span>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 italic">
                  "{r.comment}"
                </div>

                <p className="text-[11px] text-red-600 font-semibold">
                  Lý do báo cáo: {r.reportReason}
                </p>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => handleKeepReview(r.id)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 font-semibold hover:bg-gray-100"
                  >
                    Bỏ qua (Giữ lại)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteReview(r.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 shadow-2xs"
                  >
                    Xóa đánh giá vi phạm
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

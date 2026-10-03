import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Cog6ToothIcon,
  PhotoIcon,
  ClockIcon,
  ShieldCheckIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import { userService } from "../../services/userService";

export default function SellerSettings() {
  const [shopInfo, setShopInfo] = useState({
    shopName: "Gian Hàng Thời Trang Shobbe",
    description: "Chuyên cung cấp quần áo thời trang nam nữ cao cấp, chuẩn form, chất vải thoáng mát.",
    logo: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=150&q=80",
    banner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80",
    openingHours: "08:00 - 22:00 (Hàng ngày)",
    returnPolicy: "Hỗ trợ đổi trả miễn phí trong 7 ngày nếu lỗi từ nhà sản xuất hoặc không vừa size.",
    vacationMode: false,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = await userService.getUserProfile();
        if (user) {
          setShopInfo((prev) => ({
            ...prev,
            shopName: prev.shopName || (user.username ? `Shop ${user.username}` : prev.shopName),
          }));
        }
      } catch {
        // Fallback
      }
    };
    fetchProfile();
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    toast.success("Đã cập nhật thông tin và chính sách gian hàng thành công!");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
          Cài Đặt Gian Hàng
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Chỉnh sửa thông tin thương hiệu, hình ảnh đại diện, giờ mở cửa và chính sách bán hàng
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Brand Information */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            Thông tin thương hiệu & Hình ảnh
          </h3>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Tên gian hàng (Shop Name) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={shopInfo.shopName}
              onChange={(e) => setShopInfo((p) => ({ ...p, shopName: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Mô tả giới thiệu Shop
            </label>
            <textarea
              rows={3}
              value={shopInfo.description}
              onChange={(e) => setShopInfo((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                URL Logo đại diện Shop
              </label>
              <input
                type="url"
                value={shopInfo.logo}
                onChange={(e) => setShopInfo((p) => ({ ...p, logo: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
              />
              {shopInfo.logo && (
                <img
                  src={shopInfo.logo}
                  alt="Logo preview"
                  className="mt-2 w-16 h-16 rounded-xl object-cover border border-gray-200"
                />
              )}
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                URL Banner trang trí Shop
              </label>
              <input
                type="url"
                value={shopInfo.banner}
                onChange={(e) => setShopInfo((p) => ({ ...p, banner: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
              />
              {shopInfo.banner && (
                <img
                  src={shopInfo.banner}
                  alt="Banner preview"
                  className="mt-2 w-full h-16 rounded-xl object-cover border border-gray-200"
                />
              )}
            </div>
          </div>
        </div>

        {/* Operational & Return Policy */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            Vận hành & Chính sách riêng
          </h3>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Thời gian làm việc / Giờ hỗ trợ khách
            </label>
            <input
              type="text"
              value={shopInfo.openingHours}
              onChange={(e) => setShopInfo((p) => ({ ...p, openingHours: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Chính sách bảo hành & Đổi trả riêng
            </label>
            <textarea
              rows={3}
              value={shopInfo.returnPolicy}
              onChange={(e) => setShopInfo((p) => ({ ...p, returnPolicy: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
            <div>
              <p className="font-bold text-gray-900 dark:text-gray-100">Chế độ tạm nghỉ bán (Vacation Mode)</p>
              <p className="text-gray-500 text-[11px] mt-0.5">Tạm thời ẩn nút mua hàng khi bạn đi nghỉ lễ hoặc hết hàng</p>
            </div>
            <input
              type="checkbox"
              checked={shopInfo.vacationMode}
              onChange={(e) => setShopInfo((p) => ({ ...p, vacationMode: e.target.checked }))}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm cursor-pointer"
          >
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
}

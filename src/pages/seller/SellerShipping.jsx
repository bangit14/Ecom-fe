import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  TruckIcon,
  MapPinIcon,
  PlusIcon,
  KeyIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { userService } from "../../services/userService";

const CARRIERS = [
  {
    code: "GHN",
    name: "Giao Hàng Nhanh (GHN Express)",
    logo: "📦",
    desc: "Mạng lưới bưu cục toàn quốc, hỗ trợ lấy hàng tận nơi trong 2 giờ",
    enabled: true,
    token: "ghn_live_token_9831a8bc",
    shopId: "192847",
    services: ["Giao Chuẩn (1-3 ngày)", "Giao Hàng Cồng Kềnh"],
  },
  {
    code: "GHTK",
    name: "Giao Hàng Tiết Kiệm (GHTK)",
    logo: "🚚",
    desc: "Tối ưu chi phí, tỷ lệ giao thành công cao trên 63 tỉnh thành",
    enabled: true,
    token: "ghtk_api_key_88492019",
    shopId: "S84920",
    services: ["Giao Tiết Kiệm", "Giao Nhanh"],
  },
  {
    code: "AHAMOVE",
    name: "Ahamove Giao Siêu Tốc",
    logo: "⚡",
    desc: "Giao hàng nội thành bằng xe máy siêu tốc từ 30 phút - 2 giờ",
    enabled: false,
    token: "",
    shopId: "",
    services: ["Hỏa Tốc 2H", "Siêu Rẻ 4H"],
  },
  {
    code: "GOSHIP",
    name: "GoShip Multi-Carrier Gateway",
    logo: "🌐",
    desc: "Tự động so sánh giá và định tuyến nhà vận chuyển rẻ nhất",
    enabled: false,
    token: "",
    shopId: "",
    services: ["Tự động chọn carrier tối ưu"],
  },
];

export default function SellerShipping() {
  const [carriers, setCarriers] = useState(CARRIERS);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [settings, setSettings] = useState({
    defaultPayer: "BUYER", // SHOP, BUYER
    enableCod: true,
    enableInsurance: false,
    autoAssignCarrier: true,
  });
  const [editingCarrier, setEditingCarrier] = useState(null);

  useEffect(() => {
    const loadAddr = async () => {
      try {
        const list = await userService.getAddresses();
        if (Array.isArray(list) && list.length > 0) {
          setAddresses(list);
          const def = list.find((a) => a.isDefault || a.default) || list[0];
          setSelectedAddress(def);
        }
      } catch {
        // Fallback
      }
    };
    loadAddr();
  }, []);

  const handleToggleCarrier = (code) => {
    setCarriers((prev) =>
      prev.map((c) => {
        if (c.code === code) {
          const next = !c.enabled;
          toast.success(next ? `Đã kích hoạt ${c.name}` : `Đã tắt ${c.name}`);
          return { ...c, enabled: next };
        }
        return c;
      }),
    );
  };

  const handleSaveCarrierConfig = (e) => {
    e.preventDefault();
    if (editingCarrier) {
      setCarriers((prev) =>
        prev.map((c) => (c.code === editingCarrier.code ? editingCarrier : c)),
      );
      toast.success(`Đã lưu cấu hình API cho ${editingCarrier.name}!`);
      setEditingCarrier(null);
    }
  };

  const handleSaveAllSettings = () => {
    toast.success("Đã lưu tất cả cài đặt vận chuyển gian hàng!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
            Cài Đặt Vận Chuyển
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Kết nối tài khoản nhà vận chuyển, địa chỉ kho lấy hàng và phương thức giao
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAllSettings}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm cursor-pointer"
        >
          Lưu cài đặt
        </button>
      </div>

      {/* Warehouse / Pickup Address */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
              <MapPinIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Địa chỉ lấy hàng mặc định
              </h3>
              <p className="text-xs text-gray-500">
                Bưu tá của các hãng vận chuyển sẽ đến địa chỉ này để lấy hàng
              </p>
            </div>
          </div>
        </div>

        {selectedAddress ? (
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs space-y-1">
              <p className="font-bold text-gray-900 dark:text-gray-100">
                {selectedAddress.recipentName || selectedAddress.fullName} ({selectedAddress.phone})
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                {selectedAddress.addressDetail || selectedAddress.addressLine}, {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.province}
              </p>
            </div>
            <span className="px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-lg shrink-0 w-fit">
              Đang áp dụng
            </span>
          </div>
        ) : (
          <p className="text-xs text-gray-500">Chưa có địa chỉ nào được chọn làm kho lấy hàng.</p>
        )}
      </div>

      {/* Shipping Partners List */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Đối tác vận chuyển được hỗ trợ
            </h3>
            <p className="text-xs text-gray-500">
              Kích hoạt đơn vị bạn có tài khoản hoặc sử dụng hợp đồng sàn Shobbe
            </p>
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
          {carriers.map((carrier) => (
            <div
              key={carrier.code}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <span className="text-2xl p-2 rounded-xl bg-gray-100 dark:bg-gray-800">{carrier.logo}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                      {carrier.name}
                    </h4>
                    <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                      {carrier.code}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{carrier.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {carrier.services.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-medium"
                      >
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => setEditingCarrier(carrier)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center gap-1.5"
                >
                  <KeyIcon className="h-3.5 w-3.5 text-gray-500" />
                  <span>Cấu hình API</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleCarrier(carrier.code)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    carrier.enabled ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      carrier.enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* General Rules & Policies */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
          Tùy chọn thanh toán & Phí vận chuyển
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-900 dark:text-gray-100">Thanh toán khi nhận hàng (COD)</p>
              <p className="text-gray-500 text-[11px] mt-0.5">Cho phép người mua thanh toán tiền mặt cho shipper</p>
            </div>
            <input
              type="checkbox"
              checked={settings.enableCod}
              onChange={(e) => setSettings((p) => ({ ...p, enableCod: e.target.checked }))}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
          </div>

          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-900 dark:text-gray-100">Bảo hiểm hàng hóa giá trị cao</p>
              <p className="text-gray-500 text-[11px] mt-0.5">Tự động khai giá bảo hiểm cho đơn trên 1.000.000đ</p>
            </div>
            <input
              type="checkbox"
              checked={settings.enableInsurance}
              onChange={(e) => setSettings((p) => ({ ...p, enableInsurance: e.target.checked }))}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
          </div>
        </div>
      </div>

      {/* API Configuration Modal */}
      {editingCarrier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              Cấu hình tài khoản {editingCarrier.name}
            </h3>
            <p className="text-gray-500">
              Nhập API Token lấy từ trang đối tác của bạn để tự động tạo vận đơn & in mã vạch.
            </p>

            <form onSubmit={handleSaveCarrierConfig} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  API Token / Secret Key
                </label>
                <input
                  type="text"
                  placeholder="Nhập API Token..."
                  value={editingCarrier.token || ""}
                  onChange={(e) =>
                    setEditingCarrier((p) => ({ ...p, token: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Shop ID / Client ID đối tác
                </label>
                <input
                  type="text"
                  placeholder="Nhập mã Shop ID..."
                  value={editingCarrier.shopId || ""}
                  onChange={(e) =>
                    setEditingCarrier((p) => ({ ...p, shopId: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditingCarrier(null)}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700"
                >
                  Lưu cấu hình
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

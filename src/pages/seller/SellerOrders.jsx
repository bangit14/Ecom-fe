import { useState } from "react";
import toast from "react-hot-toast";
import {
  MagnifyingGlassIcon,
  PrinterIcon,
  CheckCircleIcon,
  TruckIcon,
  XMarkIcon,
  EyeIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

const INITIAL_ORDERS = [
  {
    id: "ORD-98214",
    trackingCode: "GHN-84729103",
    carrier: "Giao Hàng Nhanh (GHN)",
    customer: {
      name: "Trần Minh Quân",
      phone: "0912345678",
      address: "Số 15 Lê Văn Lương, Trung Hòa, Cầu Giấy, Hà Nội",
    },
    items: [
      { name: "Áo Thun Nam Cotton Compact 100%", variant: "Trắng / L", price: 150000, quantity: 2, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=150&q=80" },
      { name: "Túi Đeo Chéo Canvas Chống Nước", variant: "Đen", price: 200000, quantity: 1, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=150&q=80" },
    ],
    subtotal: 500000,
    shippingFee: 32000,
    voucherDiscount: 50000,
    totalAmount: 482000,
    platformFee: 24100, // 5% fee sàn
    netEarnings: 457900,
    paymentMethod: "COD (Thanh toán khi nhận hàng)",
    status: "PENDING", // PENDING, PROCESSING, SHIPPING, DELIVERED, CANCELLED, RETURNED
    createdAt: "13/09/2026 14:30",
  },
  {
    id: "ORD-98213",
    trackingCode: "GHTK-99120485",
    carrier: "Giao Hàng Tiết Kiệm (GHTK)",
    customer: {
      name: "Lê Thị Bích",
      phone: "0987654321",
      address: "Chung cư Vinhomes Central Park, Phường 22, Bình Thạnh, TP.HCM",
    },
    items: [
      { name: "Quần Jean Nam Slimfit Co Giãn Cao Cấp", variant: "Xanh Đậm / 30", price: 350000, quantity: 1, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=150&q=80" },
    ],
    subtotal: 350000,
    shippingFee: 28000,
    voucherDiscount: 0,
    totalAmount: 378000,
    platformFee: 17500,
    netEarnings: 332500,
    paymentMethod: "VNPay (Đã thanh toán online)",
    status: "PROCESSING",
    createdAt: "13/09/2026 11:15",
  },
  {
    id: "ORD-98210",
    trackingCode: "AHA-448201",
    carrier: "Ahamove Siêu Tốc",
    customer: {
      name: "Phạm Hoàng Long",
      phone: "0909123456",
      address: "128 Nguyễn Trãi, Phường 3, Quận 5, TP.HCM",
    },
    items: [
      { name: "Giày Sneaker Thể Thao Phối Màu Retro", variant: "Size 41", price: 550000, quantity: 1, image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=150&q=80" },
    ],
    subtotal: 550000,
    shippingFee: 45000,
    voucherDiscount: 30000,
    totalAmount: 565000,
    platformFee: 27500,
    netEarnings: 522500,
    paymentMethod: "COD",
    status: "SHIPPING",
    createdAt: "13/09/2026 09:20",
  },
  {
    id: "ORD-98205",
    trackingCode: "GHN-77382910",
    carrier: "Giao Hàng Nhanh (GHN)",
    customer: {
      name: "Nguyễn Thu Hà",
      phone: "0934112233",
      address: "Số 88 Trần Phú, Hà Đông, Hà Nội",
    },
    items: [
      { name: "Áo Thun Nam Cotton Compact 100%", variant: "Đen / L", price: 150000, quantity: 2, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=150&q=80" },
    ],
    subtotal: 300000,
    shippingFee: 25000,
    voucherDiscount: 0,
    totalAmount: 325000,
    platformFee: 15000,
    netEarnings: 285000,
    paymentMethod: "Ví ShobbePay (Đã thanh toán)",
    status: "DELIVERED",
    createdAt: "12/09/2026 16:45",
  },
];

export default function SellerOrders() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = orders.filter((order) => {
    const matchesQuery =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.phone.includes(searchQuery);

    if (!matchesQuery) return false;

    if (activeTab === "ALL") return true;
    return order.status === activeTab;
  });

  const handleConfirmOrder = (orderId) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: "PROCESSING" } : o,
      ),
    );
    toast.success(`Đã xác nhận đơn hàng ${orderId}! Vui lòng đóng gói hàng.`);
  };

  const handleHandoverShipping = (orderId) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: "SHIPPING" } : o,
      ),
    );
    toast.success(`Đơn hàng ${orderId} đã chuyển sang Đang giao hàng!`);
  };

  const handleCancelOrder = (orderId) => {
    if (globalThis.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: "CANCELLED" } : o,
        ),
      );
      toast.success(`Đã hủy đơn hàng ${orderId}`);
    }
  };

  const handleBulkConfirm = () => {
    setOrders((prev) =>
      prev.map((o) =>
        selectedIds.includes(o.id) && o.status === "PENDING"
          ? { ...o, status: "PROCESSING" }
          : o,
      ),
    );
    toast.success(`Đã xác nhận ${selectedIds.length} đơn hàng đã chọn!`);
    setSelectedIds([]);
  };

  const handlePrintWaybill = (order) => {
    toast.success(`Đang tạo và in phiếu gửi hàng mã vận đơn: ${order.trackingCode}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
            Quản Lý Đơn Hàng
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Xác nhận đơn, in vận đơn và chuẩn bị hàng cho đơn vị vận chuyển
          </p>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkConfirm}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm cursor-pointer"
            >
              Xác nhận {selectedIds.length} đơn đã chọn
            </button>
          </div>
        )}
      </div>

      {/* Order Status Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-2 flex flex-wrap gap-1 shadow-2xs">
        {[
          { key: "ALL", label: "Tất cả", count: orders.length },
          { key: "PENDING", label: "Chờ xác nhận", count: orders.filter((o) => o.status === "PENDING").length },
          { key: "PROCESSING", label: "Chờ lấy hàng", count: orders.filter((o) => o.status === "PROCESSING").length },
          { key: "SHIPPING", label: "Đang giao", count: orders.filter((o) => o.status === "SHIPPING").length },
          { key: "DELIVERED", label: "Đã giao", count: orders.filter((o) => o.status === "DELIVERED").length },
          { key: "CANCELLED", label: "Đã hủy", count: orders.filter((o) => o.status === "CANCELLED").length },
          { key: "RETURNED", label: "Trả hàng/Hoàn tiền", count: orders.filter((o) => o.status === "RETURNED").length },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
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
                activeTab === tab.key ? "bg-white/20 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-96">
        <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm theo Mã đơn, Mã vận đơn, Tên người nhận, SĐT..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
        />
      </div>

      {/* Orders List Cards */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center text-gray-500">
            Không có đơn hàng nào trong mục này.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isChecked = selectedIds.includes(order.id);
            return (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs overflow-hidden"
              >
                {/* Order Card Header */}
                <div className="px-5 py-3.5 bg-gray-50/70 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() =>
                        setSelectedIds((prev) =>
                          prev.includes(order.id)
                            ? prev.filter((id) => id !== order.id)
                            : [...prev, order.id],
                        )
                      }
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <span className="font-extrabold text-sm text-gray-900 dark:text-gray-100">
                      {order.id}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">{order.createdAt}</span>
                    <span className="text-gray-400">•</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {order.carrier}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md ${
                        order.status === "PENDING"
                          ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                          : order.status === "PROCESSING"
                            ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                            : order.status === "SHIPPING"
                              ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                              : order.status === "DELIVERED"
                                ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300"
                                : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                      }`}
                    >
                      {order.status === "PENDING" && "Chờ xác nhận"}
                      {order.status === "PROCESSING" && "Chờ lấy hàng"}
                      {order.status === "SHIPPING" && "Đang vận chuyển"}
                      {order.status === "DELIVERED" && "Đã giao thành công"}
                      {order.status === "CANCELLED" && "Đã hủy"}
                      {order.status === "RETURNED" && "Trả hàng/Hoàn tiền"}
                    </span>
                  </div>
                </div>

                {/* Order Card Body */}
                <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Left: Products in order */}
                  <div className="lg:col-span-6 space-y-3">
                    {order.items.map((item, iIdx) => (
                      <div key={iIdx} className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover border border-gray-100 dark:border-gray-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Phân loại: <span className="font-semibold text-gray-700 dark:text-gray-300">{item.variant}</span> x {item.quantity}
                          </p>
                          <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            {item.price.toLocaleString("vi-VN")} đ
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Middle: Customer & Shipping */}
                  <div className="lg:col-span-3 text-xs space-y-1 text-gray-600 dark:text-gray-400 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-800 pt-3 lg:pt-0 lg:pl-6">
                    <p className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                      <UserIcon className="h-3.5 w-3.5 text-gray-400" />
                      <span>{order.customer.name}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <PhoneIcon className="h-3.5 w-3.5 text-gray-400" />
                      <span>{order.customer.phone}</span>
                    </p>
                    <p className="text-[11px] text-gray-500 line-clamp-2">
                      {order.customer.address}
                    </p>
                    <p className="text-[10px] text-gray-400 pt-1 font-mono">
                      Mã vận đơn: {order.trackingCode}
                    </p>
                  </div>

                  {/* Right: Pricing & Actions */}
                  <div className="lg:col-span-3 text-right border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-800 pt-3 lg:pt-0 lg:pl-6 space-y-2">
                    <div>
                      <p className="text-[11px] text-gray-500">Tổng thu người mua:</p>
                      <p className="text-base font-extrabold text-gray-900 dark:text-gray-100">
                        {order.totalAmount.toLocaleString("vi-VN")} đ
                      </p>
                      <p className="text-[10px] text-green-600 font-semibold">
                        Thực nhận: {order.netEarnings.toLocaleString("vi-VN")} đ
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-1.5 pt-1">
                      {order.status === "PENDING" && (
                        <button
                          type="button"
                          onClick={() => handleConfirmOrder(order.id)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs cursor-pointer"
                        >
                          Xác nhận đơn
                        </button>
                      )}

                      {order.status === "PROCESSING" && (
                        <button
                          type="button"
                          onClick={() => handleHandoverShipping(order.id)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs cursor-pointer flex items-center gap-1"
                        >
                          <TruckIcon className="h-3.5 w-3.5" />
                          <span>Giao cho bưu tá</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handlePrintWaybill(order)}
                        title="In phiếu gửi hàng / Vận đơn"
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        <PrinterIcon className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        title="Xem chi tiết"
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>

                      {order.status === "PENDING" && (
                        <button
                          type="button"
                          onClick={() => handleCancelOrder(order.id)}
                          className="px-2 py-1 rounded-lg text-red-600 hover:bg-red-50 text-[11px] font-semibold cursor-pointer"
                        >
                          Hủy đơn
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Chi tiết đơn hàng {selectedOrder.id}
                </h3>
                <p className="text-[11px] text-gray-500">Mã vận đơn: {selectedOrder.trackingCode} • {selectedOrder.carrier}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Customer Info */}
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-1">
              <p className="font-bold text-gray-900 dark:text-gray-100">
                Người nhận: {selectedOrder.customer.name} - {selectedOrder.customer.phone}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Địa chỉ: {selectedOrder.customer.address}
              </p>
              <p className="text-blue-600 font-medium">Hình thức thanh toán: {selectedOrder.paymentMethod}</p>
            </div>

            {/* Items */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {selectedOrder.items.map((it, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={it.image} alt={it.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-gray-100">{it.name}</p>
                      <p className="text-gray-500 text-[11px]">{it.variant} x {it.quantity}</p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-gray-100">
                    {(it.price * it.quantity).toLocaleString("vi-VN")} đ
                  </p>
                </div>
              ))}
            </div>

            {/* Financial breakdown */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-1 text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Tiền hàng:</span>
                <span>{selectedOrder.subtotal.toLocaleString("vi-VN")} đ</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span>+{selectedOrder.shippingFee.toLocaleString("vi-VN")} đ</span>
              </div>
              {selectedOrder.voucherDiscount > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>Voucher giảm giá:</span>
                  <span>-{selectedOrder.voucherDiscount.toLocaleString("vi-VN")} đ</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-1 border-t border-gray-100 dark:border-gray-800">
                <span>Tổng thu người mua:</span>
                <span>{selectedOrder.totalAmount.toLocaleString("vi-VN")} đ</span>
              </div>
              <div className="flex justify-between text-red-500 text-[11px]">
                <span>Phí sàn bị trừ (5%):</span>
                <span>-{selectedOrder.platformFee.toLocaleString("vi-VN")} đ</span>
              </div>
              <div className="flex justify-between font-extrabold text-green-600 text-sm pt-1 border-t border-gray-100 dark:border-gray-800">
                <span>Thực nhận vào ví:</span>
                <span>{selectedOrder.netEarnings.toLocaleString("vi-VN")} đ</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => handlePrintWaybill(selectedOrder)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer"
              >
                <PrinterIcon className="h-4 w-4" />
                <span>In phiếu gửi hàng</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

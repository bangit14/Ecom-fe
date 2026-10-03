import { useEffect, useMemo, useState } from "react";
import { Package, Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge, Button, EmptyState, ErrorState, Input, Modal, Skeleton } from "../../components/ui";
import { orderService } from "../../services/orderService";

const tabs = ["Tất cả", "Chờ thanh toán", "Vận chuyển", "Chờ giao hàng", "Hoàn thành", "Đã hủy", "Trả hàng/Hoàn tiền"];
const statusConfigByCode = {
  PENDING: { tab: "Chờ thanh toán", label: "Chờ thanh toán", badge: "Chờ thanh toán", tone: "warning" },
  CONFIRMED: { tab: "Chờ giao hàng", label: "Đã xác nhận", badge: "Đã xác nhận", tone: "info" },
  PROCESSING: { tab: "Chờ giao hàng", label: "Chờ giao hàng", badge: "Chờ giao hàng", tone: "info" },
  SHIPPED: { tab: "Vận chuyển", label: "Đang vận chuyển", badge: "Vận chuyển", tone: "primary" },
  DELIVERED: { tab: "Hoàn thành", label: "Giao hàng thành công", badge: "Hoàn thành", tone: "success" },
  CANCELLED: { tab: "Đã hủy", label: "Đã hủy", badge: "Đã hủy", tone: "danger" },
  RETURNED: { tab: "Trả hàng/Hoàn tiền", label: "Trả hàng/Hoàn tiền", badge: "Hoàn tiền", tone: "warning" },
};
const ITEMS_PER_PAGE = 2;
const formatPrice = (value) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(Number(value || 0));
const formatDateTime = (value) => { if (!value) return ""; const date = new Date(value); return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("vi-VN"); };
const parseJsonSafe = (value) => { if (!value || typeof value !== "string") return null; try { return JSON.parse(value); } catch { return null; } };
const formatVariantAttributes = (value) => { const parsed = typeof value === "string" ? parseJsonSafe(value) : value; return parsed && typeof parsed === "object" ? Object.entries(parsed).map(([key, val]) => `${key}: ${val}`).join(" • ") : String(value || ""); };
const getOrderCreatedAt = (order) => order?.createdAt || [...(Array.isArray(order?.histories) ? order.histories : [])].sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")))[0]?.createdAt || null;
const formatAddressBlock = (value) => { const parsed = typeof value === "string" ? parseJsonSafe(value) || value : value; if (!parsed || typeof parsed !== "object") return { name: "", phone: "", line: String(parsed || "") }; return { name: parsed.fullName || parsed.full_name || "", phone: parsed.phone || "", line: [parsed.addressLine || parsed.street || parsed.detail, parsed.ward, parsed.district, parsed.province || parsed.city, parsed.country].filter(Boolean).join(", "), zip: parsed.zipCode || parsed.zip_code || "" }; };

export default function AccountOrdersPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retryNonce, setRetryNonce] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [itemPage, setItemPage] = useState(1);

  useEffect(() => {
    let isMounted = true;
    const loadOrders = async () => {
      setIsLoading(true); setLoadError("");
      try { const data = await orderService.getMyOrders({ page: 0, size: 20 }); if (isMounted) setOrders(Array.isArray(data?.content) ? data.content : []); }
      catch { if (isMounted) { setOrders([]); setLoadError("Không thể tải đơn hàng. Vui lòng thử lại."); } }
      finally { if (isMounted) setIsLoading(false); }
    };
    loadOrders();
    return () => { isMounted = false; };
  }, [retryNonce]);

  const mappedOrders = useMemo(() => orders.map((order) => {
    const statusConfig = statusConfigByCode[order.status] || statusConfigByCode.PROCESSING;
    const totalQuantity = (order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const discountPerItem = totalQuantity ? Number(order.discountAmount || 0) / totalQuantity : 0;
    const items = (order.items || []).map((item, index) => { const unitPrice = Number(item.unitPrice || 0); return { id: item.variantId || item.sku || index, name: item.productName || "Sản phẩm", variant: formatVariantAttributes(item.variantAttributes) || "Mặc định", quantity: item.quantity || 1, price: unitPrice, originalPrice: unitPrice + discountPerItem }; });
    return { id: order.orderCode ? `#${order.orderCode}` : `#DH${order.id}`, orderCode: order.orderCode || `DH${order.id}`, status: order.status, paymentStatus: order.paymentStatus, shopName: "Shobbe Store", statusLabel: statusConfig.label, statusTone: statusConfig.tone, statusBadge: statusConfig.badge, total: Number(order.finalAmount ?? order.totalAmount ?? 0), items, totalItems: totalQuantity, createdAt: getOrderCreatedAt(order), shippingAddress: order.shippingAddress || "", note: order.note || "", histories: order.histories || [], tab: statusConfig.tab };
  }), [orders]);
  const filteredOrders = useMemo(() => { const searchValue = keyword.trim().toLowerCase(); return mappedOrders.filter((order) => (activeTab === "Tất cả" || order.tab === activeTab) && (!searchValue || [order.id, order.shopName, order.items.map((item) => item.name).join(" ")].join(" ").toLowerCase().includes(searchValue))); }, [activeTab, keyword, mappedOrders]);
  const detailItems = selectedOrder?.items || [];
  const totalItemPages = Math.max(1, Math.ceil(detailItems.length / ITEMS_PER_PAGE));
  const currentItemPage = Math.min(itemPage, totalItemPages);
  const pagedDetailItems = detailItems.slice((currentItemPage - 1) * ITEMS_PER_PAGE, currentItemPage * ITEMS_PER_PAGE);
  const timeline = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
  const activeTimelineIndex = selectedOrder ? timeline.indexOf(selectedOrder.status) : -1;

  return <div className="space-y-5"><div><p className="text-sm font-semibold text-primary">Tài khoản / mua hàng</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">Đơn mua</h1><p className="mt-2 text-sm leading-6 text-muted">Theo dõi đơn hàng và trạng thái giao hàng của bạn.</p></div><div className="overflow-hidden rounded-ui border border-border bg-surface shadow-ui"><div className="overflow-x-auto border-b border-border"><div className="flex min-w-max gap-1 px-2 py-2">{tabs.map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} aria-selected={tab === activeTab} className={`rounded-ui px-3 py-2 text-sm font-medium ${tab === activeTab ? "bg-primary-soft text-primary" : "text-muted hover:bg-canvas hover:text-ink"}`}>{tab}</button>)}</div></div><div className="p-3 sm:p-4"><Input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm theo shop, mã đơn hoặc sản phẩm" aria-label="Tìm đơn hàng" className="bg-canvas" /></div></div><div className="space-y-3">{isLoading ? <div className="space-y-3">{[1, 2].map((item) => <div key={item} className="rounded-ui border border-border bg-surface p-4 shadow-ui"><Skeleton className="h-5 w-40" /><Skeleton className="mt-4 h-16 w-full" /><Skeleton className="mt-4 h-5 w-32" /></div>)}</div> : loadError ? <div className="rounded-ui border border-border bg-surface"><ErrorState description={loadError} onRetry={() => setRetryNonce((value) => value + 1)} /></div> : filteredOrders.length === 0 ? <div className="rounded-ui border border-dashed border-border bg-surface"><EmptyState title={t("account.noOrders")} description="Bạn chưa có đơn hàng phù hợp." actionLabel={t("home.shopNow")} onAction={() => { window.location.href = "/products"; }} /></div> : filteredOrders.map((order) => <article key={order.id} className="overflow-hidden rounded-ui border border-border bg-surface shadow-ui"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3"><div><p className="text-sm font-semibold text-ink">{t("account.orderCode")}: {order.id}</p><p className="mt-1 text-xs text-muted">{formatDateTime(order.createdAt)} · {order.shopName}</p></div><Badge variant={order.statusTone}>{order.statusBadge}</Badge></header><div className="divide-y divide-border">{order.items.slice(0, 3).map((item) => <div key={item.id} className="flex items-center gap-3 px-4 py-3"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-ui bg-canvas text-muted"><Package className="h-6 w-6" aria-hidden="true" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-ink">{item.name}</p><p className="mt-1 text-xs text-muted">{item.variant} · x{item.quantity}</p></div><p className="text-sm font-semibold text-ink">{formatPrice(item.price)}</p></div>)}</div><footer className="flex flex-col gap-3 border-t border-border bg-canvas px-4 py-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted">{order.totalItems} sản phẩm</p><div className="flex items-center justify-between gap-4 sm:justify-end"><p className="text-sm text-muted">{t("cart.finalTotal")} <strong className="ml-1 text-lg text-primary">{formatPrice(order.total)}</strong></p><Button size="sm" variant="secondary" onClick={() => { setSelectedOrder(order); setItemPage(1); }}>{t("account.viewOrderDetail")}</Button></div></footer></article>)}</div>
    {selectedOrder ? <Modal open={Boolean(selectedOrder)} onClose={() => setSelectedOrder(null)} title={`Chi tiết đơn hàng ${selectedOrder.id}`} description={`${selectedOrder.statusLabel} · ${formatDateTime(selectedOrder.createdAt)}`} density="compact"><div className="grid gap-5 lg:grid-cols-[0.9fr_1.3fr_1fr]"><section><h2 className="text-sm font-semibold text-ink">Theo dõi đơn hàng</h2><ol className="mt-4 space-y-4">{timeline.map((status, index) => { const config = statusConfigByCode[status]; const history = selectedOrder.histories.find((item) => item.status === status); const completed = activeTimelineIndex >= index && activeTimelineIndex >= 0; return <li key={status} className="relative flex gap-3"><span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${completed ? "bg-primary text-white" : "bg-canvas text-muted"}`}>{index + 1}</span><div className="min-w-0"><p className={`text-sm font-semibold ${completed ? "text-ink" : "text-muted"}`}>{config.label}</p><p className="mt-1 text-xs text-muted">{history ? formatDateTime(history.createdAt) : "Chưa cập nhật"}</p></div></li>; })}</ol></section><section><h2 className="text-sm font-semibold text-ink">Sản phẩm trong đơn</h2><div className="mt-3 space-y-2">{pagedDetailItems.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-ui border border-border p-3"><div className="flex h-10 w-10 items-center justify-center rounded-ui bg-canvas text-muted"><Package className="h-5 w-5" aria-hidden="true" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-ink">{item.name}</p><p className="text-xs text-muted">{item.variant} · x{item.quantity}</p></div><p className="text-sm font-semibold text-primary">{formatPrice(item.price * item.quantity)}</p></div>)}</div>{totalItemPages > 1 ? <div className="mt-3 flex items-center justify-between text-xs text-muted"><span>Trang {currentItemPage}/{totalItemPages}</span><div className="flex gap-2"><Button size="sm" density="compact" variant="secondary" disabled={currentItemPage === 1} onClick={() => setItemPage((value) => Math.max(1, value - 1))}>Trước</Button><Button size="sm" density="compact" variant="secondary" disabled={currentItemPage === totalItemPages} onClick={() => setItemPage((value) => Math.min(totalItemPages, value + 1))}>Sau</Button></div></div> : null}</section><section><h2 className="text-sm font-semibold text-ink">Thông tin nhận hàng</h2><div className="mt-3 rounded-ui bg-canvas p-3 text-sm leading-6 text-muted">{(() => { const address = formatAddressBlock(selectedOrder.shippingAddress); return <><p className="font-semibold text-ink">{address.name || "Chưa cập nhật"}</p><p>{address.phone}</p><p>{address.line}</p>{address.zip ? <p>Mã bưu chính: {address.zip}</p> : null}</>; })()}</div><div className="mt-4 rounded-ui border border-border p-3 text-sm leading-6 text-muted"><p>Tổng tiền: <strong className="text-ink">{formatPrice(selectedOrder.total)}</strong></p><p>Ghi chú: {selectedOrder.note || "Không có"}</p><p>Thanh toán: {selectedOrder.paymentStatus || "Chưa rõ"}</p></div></section></div></Modal> : null}
  </div>;
}

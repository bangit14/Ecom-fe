import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { Badge, Button, Card, StatCard } from "../../components/ui";

const statusMap = {
  PENDING: { label: "Chờ xác nhận", variant: "warning" },
  PROCESSING: { label: "Đang chuẩn bị", variant: "info" },
  SHIPPING: { label: "Đang giao hàng", variant: "primary" },
  DELIVERED: { label: "Đã giao", variant: "success" },
};

const formatMoney = (value) => `${value.toLocaleString("vi-VN")} đ`;

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [stats] = useState({
    todayRevenue: 3850000,
    todayOrders: 14,
    pendingOrders: 5,
    shippingOrders: 8,
    outOfStockCount: 2,
    unreadMessages: 3,
    shopRating: 4.9,
    totalProducts: 48,
  });

  const todoItems = [
    { label: "Chờ xác nhận", count: stats.pendingOrders, href: "/seller/orders?status=PENDING", variant: "warning", icon: ClipboardDocumentCheckIcon },
    { label: "Chờ lấy hàng", count: 4, href: "/seller/orders?status=PROCESSING", variant: "info", icon: ClipboardDocumentCheckIcon },
    { label: "Đang vận chuyển", count: stats.shippingOrders, href: "/seller/orders?status=SHIPPING", variant: "primary", icon: TruckIcon },
    { label: "Sản phẩm hết hàng", count: stats.outOfStockCount, href: "/seller/products?tab=outOfStock", variant: "danger", icon: ExclamationTriangleIcon },
  ];
  const recentOrders = [
    { id: "ORD-98214", customer: "Trần Minh Quân", total: 450000, itemsCount: 2, status: "PENDING", time: "10 phút trước" },
    { id: "ORD-98213", customer: "Lê Thị Bích", total: 1250000, itemsCount: 3, status: "PROCESSING", time: "35 phút trước" },
    { id: "ORD-98210", customer: "Phạm Hoàng Long", total: 320000, itemsCount: 1, status: "SHIPPING", time: "2 giờ trước" },
    { id: "ORD-98205", customer: "Nguyễn Thu Hà", total: 890000, itemsCount: 2, status: "DELIVERED", time: "Hôm nay" },
  ];
  const topSellingProducts = [
    { id: 1, name: "Áo Thun Cotton Compact 100% Thoáng Mát", sales: 142, revenue: 21300000, stock: 45 },
    { id: 2, name: "Quần Jean Nam Slimfit Co Giãn Cao Cấp", sales: 89, revenue: 31150000, stock: 18 },
    { id: 3, name: "Giày Sneaker Thể Thao Phối Màu Retro", sales: 64, revenue: 35200000, stock: 12 },
    { id: 4, name: "Túi Đeo Chéo Canvas Chống Nước Tiện Lợi", sales: 52, revenue: 10400000, stock: 3 },
  ];

  return <div className="space-y-5" data-density="compact">
    <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-sm font-semibold text-primary">Tổng quan hôm nay</p><h1 className="mt-1 text-ui-h1 font-semibold tracking-tight text-ink">Kênh người bán</h1><p className="mt-2 text-sm text-muted">Theo dõi doanh thu và xử lý việc cần làm trong ngày.</p></div>
      <div className="flex flex-wrap gap-2"><Button size="sm" density="compact" leftIcon={PlusIcon} onClick={() => navigate("/seller/products")}>Thêm sản phẩm</Button><Button size="sm" density="compact" variant="secondary" onClick={() => navigate("/seller/marketing")}>Tạo voucher</Button></div>
    </header>

    <section aria-labelledby="seller-kpi-heading"><h2 id="seller-kpi-heading" className="sr-only">Chỉ số chính</h2><div className="grid gap-px overflow-hidden rounded-ui border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
      <StatCard density="compact" className="rounded-none border-0 shadow-none" label="Doanh thu hôm nay" value={formatMoney(stats.todayRevenue)} trend="+18,4%" trendDirection="up" description="so với hôm qua" icon={BanknotesIcon} />
      <StatCard density="compact" className="rounded-none border-0 shadow-none" label="Đơn mới" value={`${stats.todayOrders} đơn`} description="tỷ lệ xác nhận 98%" icon={ClipboardDocumentCheckIcon} />
      <StatCard density="compact" className="rounded-none border-0 shadow-none" label="Đang giao" value={`${stats.shippingOrders} đơn`} description="GHN, GHTK đang phát" icon={TruckIcon} />
      <StatCard density="compact" className="rounded-none border-0 shadow-none" label="Tin chưa đọc" value={`${stats.unreadMessages} khách`} description={`Đánh giá shop ${stats.shopRating}/5`} icon={ChatBubbleLeftRightIcon} />
    </div></section>

    <section aria-labelledby="today-tasks-heading"><div className="flex items-end justify-between gap-3"><div><h2 id="today-tasks-heading" className="text-ui-h3 font-semibold text-ink">Việc cần làm hôm nay</h2><p className="mt-1 text-sm text-muted">Ưu tiên các mục đang chặn việc giao hàng.</p></div><Link to="/seller/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover">Mở đơn hàng <ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></Link></div><div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{todoItems.map((item) => { const Icon = item.icon; return <Link key={item.label} to={item.href} className="group flex items-center justify-between rounded-ui border border-border bg-surface p-4 transition-colors hover:bg-canvas focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"><div className="flex items-center gap-3"><span className={`flex h-9 w-9 items-center justify-center rounded-ui ${item.variant === "danger" ? "bg-danger-soft text-danger" : item.variant === "warning" ? "bg-warning-soft text-warning-ink" : item.variant === "info" ? "bg-info-soft text-info-ink" : "bg-primary-soft text-primary"}`}><Icon className="h-4 w-4" aria-hidden="true" /></span><span className="text-sm font-semibold text-ink">{item.label}</span></div><span className="text-ui-h3 font-semibold text-ink">{item.count}</span></Link>; })}</div></section>

    <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
      <Card density="compact" className="shadow-none"><div className="flex items-start justify-between gap-3"><div><h2 className="text-ui-h3 font-semibold text-ink">Đơn hàng mới nhất</h2><p className="mt-1 text-sm text-muted">Các đơn vừa phát sinh cần chuẩn bị.</p></div><Link to="/seller/orders" className="text-sm font-semibold text-primary hover:text-primary-hover">Xem tất cả</Link></div><div className="mt-4 divide-y divide-border">{recentOrders.map((order) => { const status = statusMap[order.status]; return <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><p className="truncate text-sm font-semibold text-ink">{order.id} <span className="font-normal text-muted">· {order.customer}</span></p><p className="mt-1 text-sm text-muted">{order.itemsCount} sản phẩm · {order.time}</p></div><div className="flex items-center gap-3"><span className="text-sm font-semibold text-ink">{formatMoney(order.total)}</span><Badge variant={status.variant}>{status.label}</Badge></div></div>; })}</div></Card>
      <Card density="compact" className="shadow-none"><div className="flex items-start justify-between gap-3"><div><h2 className="text-ui-h3 font-semibold text-ink">Hiệu suất sản phẩm</h2><p className="mt-1 text-sm text-muted">Top doanh số tuần này.</p></div><Link to="/seller/products" className="text-sm font-semibold text-primary hover:text-primary-hover">Quản lý kho</Link></div><div className="mt-4 space-y-3">{topSellingProducts.map((product, index) => <div key={product.id} className="flex items-center gap-3"><span className="w-5 text-sm font-semibold text-muted">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-ink">{product.name}</p><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-canvas"><span className="block h-full rounded-full bg-primary" style={{ width: `${Math.max(12, 100 - index * 19)}%` }} /></div></div><span className="text-sm font-semibold text-ink">{product.sales}</span></div>)}</div></Card>
    </div>

    <div className="grid gap-5 lg:grid-cols-[1fr_auto]"><Card density="compact" className="shadow-none"><div className="flex items-center justify-between"><div><h2 className="text-ui-h3 font-semibold text-ink">Tóm tắt hoạt động</h2><p className="mt-1 text-sm text-muted">Doanh thu theo mốc trong ngày.</p></div><ArrowTrendingUpIcon className="h-5 w-5 text-success" aria-hidden="true" /></div><div className="mt-5 grid h-28 grid-cols-6 items-end gap-2">{[35, 48, 42, 62, 76, 58].map((height, index) => <div key={index} className="flex h-full flex-col justify-end gap-2"><div className="rounded-t-sm bg-primary/70" style={{ height: `${height}%` }} /><span className="text-center text-xs text-muted">{index + 8}h</span></div>)}</div></Card><Card density="compact" className="shadow-none lg:w-64"><p className="text-sm font-semibold text-ink">Gợi ý vận hành</p><p className="mt-2 text-sm leading-6 text-muted">{stats.outOfStockCount} sản phẩm sắp cần bổ sung tồn kho.</p><Link to="/seller/products?tab=outOfStock" className="mt-4 inline-flex text-sm font-semibold text-primary hover:text-primary-hover">Xem tồn kho <ArrowRightIcon className="ml-1 h-4 w-4" aria-hidden="true" /></Link></Card></div>
  </div>;
}

import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Heart, Menu, Search, ShoppingCart, UserRound } from "lucide-react";
import { Badge, Drawer, Input } from "../components/ui";
import { useCartItemCount } from "../hooks/useCartItemCount";
import { getCurrentRole } from "../utils/authSession";

const CATEGORY_LINKS = [
  { label: "Tất cả sản phẩm", href: "/products" },
  { label: "Điện tử", href: "/products?category=electronics" },
  { label: "Thời trang", href: "/products?category=fashion" },
  { label: "Nhà cửa", href: "/products?category=home" },
  { label: "Sức khỏe", href: "/products?category=health" },
  { label: "Khuyến mãi", href: "/products?promotion=true" },
];

function CategoryNav({ onNavigate }) {
  return <nav aria-label="Danh mục sản phẩm" className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-1">{CATEGORY_LINKS.map((item) => <NavLink key={item.href} to={item.href} onClick={onNavigate} className={({ isActive }) => `rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-[rgb(var(--ui-primary-soft))] text-[rgb(var(--ui-primary))]" : "text-[rgb(var(--ui-muted))] hover:bg-[rgb(var(--ui-canvas))] hover:text-[rgb(var(--ui-ink))]"}`}>{item.label}</NavLink>)}</nav>;
}

export default function BuyerLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartItemCount } = useCartItemCount();
  const role = getCurrentRole();
  const accountHref = role ? "/account/profile" : "/login";
  return <div className="flex min-h-[100dvh] flex-col bg-[rgb(var(--ui-canvas))] text-[rgb(var(--ui-ink))]">
    <header className="sticky top-0 z-30 border-b border-[rgb(var(--ui-border))] bg-[rgb(var(--ui-surface))]"><div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 sm:px-5"><button type="button" onClick={() => setMobileOpen(true)} aria-label="Mở danh mục" className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[rgb(var(--ui-muted))] hover:bg-[rgb(var(--ui-canvas))] lg:hidden"><Menu className="h-5 w-5" /></button><Link to="/" className="shrink-0 text-lg font-semibold tracking-tight text-[rgb(var(--ui-ink))]">Shobbe</Link><div className="relative min-w-0 flex-1"><Input aria-label="Tìm kiếm sản phẩm" placeholder="Tìm kiếm sản phẩm" density="comfortable" className="pr-11" /><Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--ui-muted))]" aria-hidden="true" /></div><div className="flex items-center gap-1"><Link to="/account/wishlist" aria-label="Sản phẩm yêu thích" className="hidden h-9 w-9 items-center justify-center rounded-md text-[rgb(var(--ui-muted))] hover:bg-[rgb(var(--ui-canvas))] sm:inline-flex"><Heart className="h-4 w-4" /></Link><Link to="/cart" aria-label={`Giỏ hàng, ${cartItemCount} sản phẩm`} className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-[rgb(var(--ui-muted))] hover:bg-[rgb(var(--ui-canvas))]"><ShoppingCart className="h-4 w-4" />{cartItemCount > 0 ? <span className="absolute -right-1 -top-1"><Badge variant="danger">{cartItemCount > 99 ? "99+" : cartItemCount}</Badge></span> : null}</Link><Link to={accountHref} aria-label="Tài khoản" className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[rgb(var(--ui-muted))] hover:bg-[rgb(var(--ui-canvas))]"><UserRound className="h-4 w-4" /></Link></div></div><div className="hidden border-t border-[rgb(var(--ui-border))] lg:block"><div className="mx-auto max-w-7xl px-3 sm:px-5"><CategoryNav /></div></div></header>
    <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} side="left" title="Danh mục" description="Khám phá sản phẩm" className="max-w-[18rem]" density="comfortable"><CategoryNav onNavigate={() => setMobileOpen(false)} /></Drawer>
    <main className="w-full flex-1"><Outlet /></main>
    <footer className="border-t border-[rgb(var(--ui-border))] bg-[rgb(var(--ui-surface))]"><div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm sm:grid-cols-2 sm:px-5 lg:grid-cols-4"><div><p className="text-base font-semibold">Shobbe</p><p className="mt-2 leading-6 text-[rgb(var(--ui-muted))]">Mua sắm rõ ràng, giao dịch tin cậy.</p></div><div><p className="font-semibold">Mua sắm</p><div className="mt-2 grid gap-2 text-[rgb(var(--ui-muted))]"><Link to="/products">Sản phẩm</Link><Link to="/cart">Giỏ hàng</Link><Link to="/account/orders">Đơn hàng</Link></div></div><div><p className="font-semibold">Tài khoản</p><div className="mt-2 grid gap-2 text-[rgb(var(--ui-muted))]"><Link to="/account/profile">Hồ sơ</Link><Link to="/account/address">Địa chỉ</Link><Link to="/account/wishlist">Yêu thích</Link></div></div><div><p className="font-semibold">Hỗ trợ</p><div className="mt-2 grid gap-2 text-[rgb(var(--ui-muted))]"><Link to="/seller">Kênh người bán</Link><Link to="/admin/login">Quản trị viên</Link></div></div></div></footer>
  </div>;
}

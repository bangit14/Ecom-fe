import { useMemo } from "react";
import { Bell, Banknote, BriefcaseBusiness, FolderTree, LayoutDashboard, PackageSearch, Scale, ShieldCheck, ShieldEllipsis, ShoppingBag, Store, Ticket, Truck, UserCog, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ShellLayout from "./ShellLayout";
import { Badge } from "../components/ui";
import LanguageSwitcher from "../components/common/LanguageSwitcher";
import { getCurrentPermissions, getCurrentRole } from "../utils/authSession";

const ADMIN_NAV_GROUPS = [
  { title: "Nền tảng", items: [{ label: "Tổng quan", href: "/admin", icon: LayoutDashboard, exact: true }, { label: "Người dùng", href: "/admin/users", icon: Users, roles: ["ADMIN", "SUPER_ADMIN"] }, { label: "Gian hàng", href: "/admin/shops", icon: Store, roles: ["ADMIN", "SUPER_ADMIN"], badge: "Duyệt" }, { label: "Danh mục", href: "/admin/categories", icon: FolderTree, roles: ["ADMIN", "SUPER_ADMIN"] }] },
  { title: "Vận hành", items: [{ label: "Sản phẩm", href: "/admin/products", icon: PackageSearch, roles: ["ADMIN", "SUPER_ADMIN"] }, { label: "Đơn hàng", href: "/admin/orders", icon: ShoppingBag, roles: ["ADMIN", "SUPER_ADMIN", "STAFF_FINANCE"] }, { label: "Kiểm duyệt", href: "/admin/moderation", icon: ShieldEllipsis, roles: ["ADMIN", "SUPER_ADMIN", "STAFF_MODERATOR"], badge: "Mới" }, { label: "Chiến dịch", href: "/admin/campaigns", icon: BriefcaseBusiness, roles: ["ADMIN", "SUPER_ADMIN"] }, { label: "Khiếu nại", href: "/admin/disputes", icon: Scale, roles: ["ADMIN", "SUPER_ADMIN", "STAFF_MODERATOR"] }, { label: "Hỗ trợ", href: "/admin/tickets", icon: Ticket, roles: ["ADMIN", "SUPER_ADMIN", "STAFF_MODERATOR"] }] },
  { title: "Tài chính", items: [{ label: "Đối soát", href: "/admin/finance", icon: Banknote, roles: ["ADMIN", "SUPER_ADMIN", "STAFF_FINANCE"] }, { label: "Vận chuyển", href: "/admin/shipping", icon: Truck, roles: ["ADMIN", "SUPER_ADMIN", "STAFF_FINANCE"] }] },
  { title: "Thiết lập", items: [{ label: "Phân quyền", href: "/admin/roles", icon: UserCog, roles: ["SUPER_ADMIN"] }, { label: "Bảo mật tài khoản", href: "/admin/change-password", icon: ShieldCheck }] },
];

const canAccess = (item, role, permissions) => (!item.roles || item.roles.includes(role)) && (!item.permission || permissions.includes(item.permission));

export default function AdminLayout() {
  const navigate = useNavigate();
  const role = (getCurrentRole() || "ADMIN").toUpperCase();
  const permissions = getCurrentPermissions();
  const menuGroups = useMemo(() => ADMIN_NAV_GROUPS.map((group) => ({ ...group, items: group.items.filter((item) => canAccess(item, role, permissions)) })).filter((group) => group.items.length > 0), [permissions, role]);
  const headerActions = <div className="flex items-center gap-1.5"><button type="button" aria-label="Mở thông báo quản trị" onClick={() => navigate("/admin/tickets")} className="relative inline-flex h-9 w-9 items-center justify-center rounded-ui text-muted hover:bg-canvas hover:text-ink focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"><Bell className="h-4 w-4" aria-hidden="true" /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-danger" /></button><LanguageSwitcher variant="topbar" /><Badge variant="neutral">{role}</Badge></div>;
  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("userId"); localStorage.removeItem("role"); localStorage.removeItem("permissions"); toast.success("Đã đăng xuất khỏi hệ thống quản trị"); navigate("/admin/login", { replace: true }); };
  return <ShellLayout brand={{ label: "Shobbe Admin", href: "/admin", mark: "S" }} menuGroups={menuGroups} profile={{ name: "Quản trị viên", description: role, href: "/admin/profile" }} roleLabel="Quản trị" onLogout={handleLogout} headerActions={headerActions} density="compact" />;
}

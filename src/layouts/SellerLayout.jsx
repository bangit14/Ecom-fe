import { useEffect, useMemo, useState } from "react";
import { Bell, BarChart3, Banknote, ClipboardList, Headphones, LayoutDashboard, Package, Settings, Tag, Truck, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ShellLayout from "./ShellLayout";
import { Badge } from "../components/ui";
import LanguageSwitcher from "../components/common/LanguageSwitcher";
import { userService } from "../services/userService";

const SELLER_NAV_GROUPS = [
  { title: "Tổng quan", items: [{ label: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard }] },
  { title: "Bán hàng", items: [{ label: "Đơn hàng", href: "/seller/orders", icon: ClipboardList, badge: "3" }, { label: "Sản phẩm", href: "/seller/products", icon: Package }] },
  { title: "Vận hành", items: [{ label: "Vận chuyển", href: "/seller/shipping", icon: Truck }, { label: "Marketing", href: "/seller/marketing", icon: Tag }, { label: "Tài chính", href: "/seller/finance", icon: Banknote }, { label: "Chăm sóc khách hàng", href: "/seller/customer-care", icon: Headphones }] },
  { title: "Thiết lập", items: [{ label: "Phân tích", href: "/seller/analytics", icon: BarChart3 }, { label: "Nhân viên", href: "/seller/staff", icon: Users }, { label: "Cài đặt shop", href: "/seller/settings", icon: Settings }] },
];

export default function SellerLayout() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let active = true;
    userService.getUserProfile().then((user) => { if (active) setProfile(user || null); }).catch(() => { if (active) setProfile(null); });
    return () => { active = false; };
  }, []);

  const shopName = profile?.username ? `Shop ${profile.username}` : "Gian hàng của tôi";
  const shellProfile = useMemo(() => ({ name: shopName, email: profile?.email, description: "Kênh người bán", href: "/seller/settings" }), [profile?.email, shopName]);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("permissions");
    toast.success("Đã đăng xuất khỏi kênh người bán");
    navigate("/seller/login", { replace: true });
  };

  const headerActions = <div className="flex items-center gap-1.5"><button type="button" aria-label="Mở đơn hàng mới" onClick={() => navigate("/seller/orders")} className="relative inline-flex h-9 items-center gap-1.5 rounded-ui px-2 text-sm font-medium text-muted hover:bg-canvas hover:text-ink"><Bell className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">Đơn mới</span><Badge variant="warning">3</Badge></button><LanguageSwitcher variant="topbar" /></div>;

  return <ShellLayout brand={{ label: "Shobbe Seller", href: "/seller/dashboard", mark: "S" }} menuGroups={SELLER_NAV_GROUPS} profile={shellProfile} roleLabel="Kênh người bán" onLogout={handleLogout} headerActions={headerActions} density="compact" />;
}

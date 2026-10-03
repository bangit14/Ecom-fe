import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BellIcon, ClipboardDocumentListIcon, GiftIcon, HeartIcon, MapPinIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import CustomerAccountHeader from "../../components/customer/CustomerAccountHeader";
import CustomerAccountFooter from "../../components/customer/CustomerAccountFooter";
import { Skeleton } from "../../components/ui";
import { userService } from "../../services/userService";

const navItems = [
  { href: "/account/notifications", labelKey: "account.notifications", icon: BellIcon },
  { href: "/account/profile", labelKey: "account.profile", icon: UserCircleIcon },
  { href: "/account/address", labelKey: "account.address", icon: MapPinIcon },
  { href: "/account/change-password", labelKey: "account.changePassword", icon: UserCircleIcon },
  { href: "/account/orders", labelKey: "account.orders", icon: ClipboardDocumentListIcon },
  { href: "/account/wishlist", labelKey: "account.wishlist", icon: HeartIcon },
  { href: "/account/vouchers", labelKey: "account.vouchers", icon: GiftIcon },
];

function navClass({ isActive }) {
  return `inline-flex shrink-0 items-center gap-2 rounded-ui px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-primary-soft text-primary" : "text-muted hover:bg-canvas hover:text-ink"}`;
}

export default function AccountLayout() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try { const data = await userService.getUserProfile(); if (isMounted) setProfile(data || null); }
      catch { if (isMounted) setProfile(null); }
      finally { if (isMounted) setProfileLoading(false); }
    };
    loadProfile();
    return () => { isMounted = false; };
  }, []);

  const displayName = profile?.fullName || profile?.username || t("account.myAccount");
  return <div className="flex min-h-[100dvh] flex-col bg-canvas text-ink"><CustomerAccountHeader maxWidthClass="max-w-7xl" /><div className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 pb-8 sm:px-6 lg:px-8"><nav className="-mx-4 mb-5 flex gap-1 overflow-x-auto border-b border-border bg-surface px-4 pb-2 sm:-mx-6 sm:px-6 lg:hidden" aria-label="Điều hướng tài khoản">{navItems.map((item) => { const Icon = item.icon; return <NavLink key={item.href} to={item.href} className={navClass}><Icon className="h-4 w-4" aria-hidden="true" /><span>{t(item.labelKey)}</span></NavLink>; })}</nav><div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[240px_minmax(0,1fr)]"><aside className="hidden rounded-ui border border-border bg-surface p-4 shadow-ui lg:block"><div className="flex items-center gap-3 border-b border-border pb-4">{profileLoading ? <><Skeleton className="h-11 w-11 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-20" /></div></> : <><span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary"><UserCircleIcon className="h-7 w-7" aria-hidden="true" /></span><div className="min-w-0"><p className="truncate text-sm font-semibold text-ink">{displayName}</p><Link to="/account/profile" className="text-xs text-muted hover:text-primary">{t("account.editProfile")}</Link></div></>}</div><nav className="mt-4 grid gap-1" aria-label="Điều hướng tài khoản">{navItems.map((item) => { const Icon = item.icon; return <NavLink key={item.href} to={item.href} className={navClass}><Icon className="h-4 w-4" aria-hidden="true" /><span>{t(item.labelKey)}</span></NavLink>; })}</nav></aside><main className="min-w-0 rounded-ui border border-border bg-surface p-4 shadow-ui sm:p-6"><Outlet /></main></div></div><CustomerAccountFooter variant="compact" /></div>;
}

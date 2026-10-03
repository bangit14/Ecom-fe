import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BellIcon,
  ChevronDownIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { Drawer } from "../ui";
import { getCurrentRole } from "../../utils/authSession";
import { useCartItemCount } from "../../hooks/useCartItemCount";
import { userService } from "../../services/userService";
import LanguageSwitcher from "../common/LanguageSwitcher";

const POSITION_CLASS = { sticky: "sticky top-0", fixed: "fixed inset-x-0 top-0" };

export default function CustomerAccountHeader({ position = "sticky", maxWidthClass = "max-w-7xl", showSearch = true, searchPlaceholder, cartCount, notifications }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  const defaultNotifications = [
    { id: 1, title: t("header.orderConfirmed"), time: t("header.twoMinAgo") },
    { id: 2, title: t("header.newDiscount"), time: t("header.oneHourAgo") },
    { id: 3, title: t("header.wishlistDiscount"), time: t("header.yesterday") },
  ];
  const resolvedNotifications = notifications || defaultNotifications;
  const resolvedSearchPlaceholder = searchPlaceholder || t("header.searchPlaceholder");
  const token = localStorage.getItem("token");
  const role = getCurrentRole();
  const isCustomerLoggedIn = Boolean(token) && (role === "CUSTOMER" || role === "USER");
  const { cartItemCount } = useCartItemCount();
  const resolvedCartCount = Number.isFinite(cartCount) ? cartCount : cartItemCount;

  useEffect(() => {
    let isMounted = true;
    if (!isCustomerLoggedIn) {
      return undefined;
    }
    const fetchProfile = async () => {
      try {
        const data = await userService.getUserProfile();
        if (isMounted && data) {
          setUserProfile(data);
          if (data.username) localStorage.setItem("username", data.username);
        }
      } catch {
        // Header remains usable when the profile endpoint is unavailable.
      }
    };
    fetchProfile();
    return () => { isMounted = false; };
  }, [isCustomerLoggedIn]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setUserMenuOpen(false);
      if (notificationRef.current && !notificationRef.current.contains(event.target)) setNotificationOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = () => {
    ["token", "userId", "username", "role", "permissions"].forEach((key) => localStorage.removeItem(key));
    navigate("/login", { replace: true });
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    navigate(searchQuery.trim() ? `/products?keyword=${encodeURIComponent(searchQuery.trim())}` : "/products");
    setMobileMenuOpen(false);
  };

  const displayUsername = isCustomerLoggedIn ? (userProfile?.username || userProfile?.fullName || localStorage.getItem("username") || t("header.account")) : t("header.account");
  const menuLinks = [
    { href: "/account/profile", label: t("header.myAccount") },
    { href: "/account/orders", label: t("header.myOrders") },
    { href: "/account/wishlist", label: t("header.wishlist") },
  ];

  return <header className={`${POSITION_CLASS[position] || POSITION_CLASS.sticky} z-50 border-b border-border bg-surface shadow-ui`}>
    <div className="hidden border-b border-border bg-canvas sm:block">
      <div className={`${maxWidthClass} mx-auto flex min-h-9 items-center justify-between gap-4 px-4 text-xs text-muted sm:px-6 lg:px-8`}>
        <Link to="/seller" className="font-semibold hover:text-primary">{t("header.sellerChannel")}</Link>
        <div className="flex items-center gap-4">
          <div className="relative" ref={notificationRef}>
            <button type="button" onClick={() => setNotificationOpen((prev) => !prev)} aria-label={t("header.notifications")} aria-expanded={notificationOpen} className="inline-flex items-center gap-1.5 font-medium hover:text-primary"><span className="relative"><BellIcon className="h-4 w-4" aria-hidden="true" />{resolvedNotifications.length > 0 ? <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">{resolvedNotifications.length}</span> : null}</span>{t("header.notifications")}</button>
            {notificationOpen ? <div role="menu" className="absolute right-0 mt-2 w-80 rounded-ui border border-border bg-surface p-3 shadow-ui-lg"><div className="mb-2 border-b border-border pb-2 text-sm font-semibold text-ink">{t("header.notifications")}</div><ul className="max-h-72 space-y-1 overflow-auto">{resolvedNotifications.map((item) => <li key={item.id} className="rounded-ui p-2 hover:bg-canvas"><p className="text-sm font-medium text-ink">{item.title}</p><p className="mt-0.5 text-xs text-muted">{item.time}</p></li>)}</ul></div> : null}
          </div>
          <Link to="/support" className="inline-flex items-center gap-1.5 font-medium hover:text-primary"><QuestionMarkCircleIcon className="h-4 w-4" aria-hidden="true" />{t("header.help")}</Link>
          <LanguageSwitcher variant="topbar" />
          {isCustomerLoggedIn ? <div className="relative" ref={userMenuRef}><button type="button" onClick={() => setUserMenuOpen((prev) => !prev)} aria-label={t("header.account")} aria-expanded={userMenuOpen} className="inline-flex items-center gap-1.5 font-semibold text-ink hover:text-primary"><UserCircleIcon className="h-4 w-4 text-muted" aria-hidden="true" />{displayUsername}<ChevronDownIcon className={`h-3.5 w-3.5 text-muted transition-transform ${userMenuOpen ? "rotate-180" : ""}`} aria-hidden="true" /></button>{userMenuOpen ? <div role="menu" className="absolute right-0 mt-2 w-56 rounded-ui border border-border bg-surface p-2 shadow-ui-lg"><div className="border-b border-border px-3 pb-2"><p className="text-xs text-muted">{t("header.account")}</p><p className="truncate text-sm font-semibold text-ink">{displayUsername}</p></div>{menuLinks.map((item) => <Link key={item.href} to={item.href} onClick={() => setUserMenuOpen(false)} className="block rounded-ui px-3 py-2 text-sm text-ink hover:bg-canvas">{item.label}</Link>)}<button type="button" onClick={handleLogout} className="w-full rounded-ui px-3 py-2 text-left text-sm font-medium text-danger hover:bg-danger-soft">{t("header.logout")}</button></div> : null}</div> : <div className="flex items-center gap-2 font-semibold"><Link to="/register" className="hover:text-primary">{t("header.register")}</Link><span aria-hidden="true">/</span><Link to="/login" className="text-primary hover:text-primary-hover">{t("header.login")}</Link></div>}
        </div>
      </div>
    </div>

    <nav className={`${maxWidthClass} mx-auto px-4 sm:px-6 lg:px-8`} aria-label="Điều hướng chính">
      <div className="flex min-h-16 items-center gap-3 sm:min-h-[4.5rem] sm:gap-6">
        <button type="button" onClick={() => setMobileMenuOpen(true)} aria-label="Mở menu" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-ui text-muted hover:bg-canvas hover:text-ink sm:hidden"><span className="text-lg" aria-hidden="true">☰</span></button>
        <Link to="/" className="group flex shrink-0 items-center gap-2" aria-label={t("header.viewHome")}><span className="flex h-9 w-9 items-center justify-center rounded-ui bg-primary-soft text-primary transition-transform group-hover:scale-105"><ShoppingBagIcon className="h-5 w-5" aria-hidden="true" /></span><span className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">Shobbe</span></Link>
        {showSearch ? <form onSubmit={handleSearchSubmit} className="order-3 w-full sm:order-none sm:flex-1"><div className="relative"><input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={resolvedSearchPlaceholder} aria-label={resolvedSearchPlaceholder} className="h-11 w-full rounded-ui border border-border bg-canvas pl-4 pr-12 text-sm text-ink shadow-inner placeholder:text-muted focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/15 sm:h-12 sm:text-base" /><button type="submit" aria-label={t("common.search")} className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-ui bg-primary text-white hover:bg-primary-hover sm:h-9 sm:w-9"><MagnifyingGlassIcon className="h-4 w-4" aria-hidden="true" /></button></div></form> : null}
        <div className="ml-auto flex shrink-0 items-center gap-1"><Link to="/account/wishlist" aria-label={t("header.wishlist")} className="hidden h-10 w-10 items-center justify-center rounded-ui text-muted hover:bg-canvas hover:text-ink sm:inline-flex"><HeartIcon className="h-5 w-5" aria-hidden="true" /></Link><Link to="/cart" aria-label={`${t("header.cart")}, ${resolvedCartCount}`} className="relative inline-flex h-10 w-10 items-center justify-center rounded-ui text-muted hover:bg-canvas hover:text-ink"><ShoppingCartIcon className="h-5 w-5" aria-hidden="true" />{resolvedCartCount > 0 ? <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-xs font-bold text-white ring-2 ring-surface">{resolvedCartCount}</span> : null}</Link></div>
      </div>
    </nav>

    <Drawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} side="left" title="Shobbe" description={isCustomerLoggedIn ? displayUsername : t("header.account")} className="max-w-[19rem]" density="comfortable">
      <div className="space-y-5"><form onSubmit={handleSearchSubmit}><label htmlFor="mobile-site-search" className="mb-2 block text-sm font-semibold text-ink">{t("common.search")}</label><div className="relative"><input id="mobile-site-search" type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={resolvedSearchPlaceholder} className="h-11 w-full rounded-ui border border-border bg-canvas px-3 pr-11 text-sm text-ink focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15" /><button type="submit" aria-label={t("common.search")} className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-ui bg-primary text-white"><MagnifyingGlassIcon className="h-4 w-4" aria-hidden="true" /></button></div></form><nav className="grid gap-1" aria-label="Menu tài khoản"><Link to="/products" onClick={() => setMobileMenuOpen(false)} className="rounded-ui px-3 py-2.5 text-sm font-medium text-ink hover:bg-canvas">{t("products")}</Link><Link to="/seller" onClick={() => setMobileMenuOpen(false)} className="rounded-ui px-3 py-2.5 text-sm font-medium text-ink hover:bg-canvas">{t("header.sellerChannel")}</Link><Link to="/support" onClick={() => setMobileMenuOpen(false)} className="rounded-ui px-3 py-2.5 text-sm font-medium text-ink hover:bg-canvas">{t("header.help")}</Link>{isCustomerLoggedIn ? menuLinks.map((item) => <Link key={item.href} to={item.href} onClick={() => setMobileMenuOpen(false)} className="rounded-ui px-3 py-2.5 text-sm font-medium text-ink hover:bg-canvas">{item.label}</Link>) : <><Link to="/register" onClick={() => setMobileMenuOpen(false)} className="rounded-ui px-3 py-2.5 text-sm font-medium text-ink hover:bg-canvas">{t("header.register")}</Link><Link to="/login" onClick={() => setMobileMenuOpen(false)} className="rounded-ui bg-primary px-3 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">{t("header.login")}</Link></>}</nav><div className="border-t border-border pt-4"><LanguageSwitcher variant="topbar" />{isCustomerLoggedIn ? <button type="button" onClick={handleLogout} className="mt-4 w-full rounded-ui px-3 py-2.5 text-left text-sm font-semibold text-danger hover:bg-danger-soft">{t("header.logout")}</button> : null}</div></div>
    </Drawer>
  </header>;
}

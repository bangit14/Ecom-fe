import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, LogOut, Menu, UserRound } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Badge, Drawer } from "../components/ui";
import { cn } from "../components/ui/cn";

function getActiveItem(groups, pathname) {
  return groups.flatMap((group) => group.items || []).find((item) => {
    if (item.hidden || !item.href) return false;
    if (typeof item.isActive === "function") return item.isActive(pathname);
    return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
  });
}

function Navigation({ groups, pathname, collapsed, onNavigate }) {
  return <nav aria-label="Điều hướng chính" className="space-y-5 px-2 py-4">
    {groups.map((group) => <section key={group.title}>
      {!collapsed && group.title ? <h2 className="mb-1 px-2 text-xs font-semibold text-muted">{group.title}</h2> : null}
      <div className="space-y-1">
        {(group.items || []).filter((item) => !item.hidden).map((item) => {
          const Icon = item.icon;
          const active = item.isActive ? item.isActive(pathname) : item.exact ? pathname === item.href : item.href && (pathname === item.href || pathname.startsWith(`${item.href}/`));
          const commonClass = cn("group flex min-h-9 items-center rounded-ui px-2 text-sm font-medium transition-colors", active ? "bg-primary text-white" : "text-muted hover:bg-canvas hover:text-ink", collapsed ? "justify-center" : "gap-2.5");
          const content = <>{Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}{!collapsed ? <span className="min-w-0 flex-1 truncate">{item.label}</span> : null}{!collapsed && item.badge !== undefined ? <Badge variant={active ? "neutral" : item.badgeVariant || "warning"}>{item.badge}</Badge> : null}</>;
          if (item.onClick && !item.href) return <button key={item.label} type="button" onClick={() => { item.onClick(); onNavigate?.(); }} title={collapsed ? item.label : undefined} className={cn(commonClass, "w-full text-left")} aria-current={active ? "page" : undefined}>{content}</button>;
          return <Link key={item.href || item.label} to={item.href || "#"} onClick={onNavigate} title={collapsed ? item.label : undefined} className={commonClass} aria-current={active ? "page" : undefined}>{content}</Link>;
        })}
      </div>
    </section>)}
  </nav>;
}

function ProfileBlock({ profile, collapsed }) {
  if (!profile) return null;
  const initials = profile.initials || profile.name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "U";
  const content = <><span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-xs font-semibold text-primary">{profile.avatar ? <img src={profile.avatar} alt="" className="h-full w-full object-cover" /> : initials}</span>{!collapsed ? <span className="min-w-0"><span className="block truncate text-sm font-semibold text-ink">{profile.name || "Tài khoản"}</span>{profile.description || profile.email ? <span className="block truncate text-xs text-muted">{profile.description || profile.email}</span> : null}</span> : null}</>;
  return profile.href && !collapsed ? <Link to={profile.href} className="flex min-w-0 items-center gap-2 rounded-ui p-2 hover:bg-canvas focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/15">{content}</Link> : <div className="flex min-w-0 items-center gap-2 rounded-ui p-2" title={collapsed ? profile.name : undefined}>{content}</div>;
}

export default function ShellLayout({ brand = { label: "Shobbe", href: "/", mark: "S" }, menuGroups = [], profile, roleLabel, onLogout, logoutLabel = "Đăng xuất", headerActions, children, pathname: pathnameProp, density = "compact", className, contentClassName }) {
  const location = useLocation();
  const pathname = pathnameProp || location.pathname;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const activeItem = useMemo(() => getActiveItem(menuGroups, pathname), [menuGroups, pathname]);
  const currentTitle = activeItem?.label || brand.label;
  const logo = typeof brand.mark === "string" || !brand.mark ? <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-ui bg-primary text-sm font-bold text-white">{brand.mark || brand.label?.[0] || "S"}</span> : brand.mark;
  const navigation = <Navigation groups={menuGroups} pathname={pathname} collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />;

  return <div data-density={density} className={cn("min-h-[100dvh] bg-canvas text-ink", className)}>
    <aside className={cn("fixed inset-y-0 left-0 z-40 hidden border-r border-border bg-surface lg:flex lg:flex-col", collapsed ? "w-[72px]" : "w-64")}>
      <div className={cn("flex h-16 items-center border-b border-border", collapsed ? "justify-center" : "justify-between px-4")}>
        <Link to={brand.href || "/"} aria-label={brand.label} className="flex min-w-0 items-center gap-2 overflow-hidden">{logo}{!collapsed ? <span className="truncate text-sm font-semibold">{brand.label}</span> : null}</Link>
        {!collapsed ? <button type="button" onClick={() => setCollapsed(true)} aria-label="Thu gọn thanh bên" aria-expanded={!collapsed} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-ui text-muted hover:bg-canvas hover:text-ink"><ChevronLeft className="h-4 w-4" aria-hidden="true" /></button> : null}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{navigation}</div>
      <div className="border-t border-border p-2"><ProfileBlock profile={profile} collapsed={collapsed} />{onLogout ? <button type="button" onClick={onLogout} title={collapsed ? logoutLabel : undefined} aria-label={logoutLabel} className={cn("mt-1 flex min-h-9 w-full items-center rounded-ui text-sm font-medium text-muted hover:bg-danger-soft hover:text-danger", collapsed ? "justify-center" : "gap-2 px-2")}><LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />{!collapsed ? <span>{logoutLabel}</span> : null}</button> : null}<button type="button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"} aria-expanded={!collapsed} className="mt-1 flex h-9 w-full items-center justify-center rounded-ui text-muted hover:bg-canvas hover:text-ink"><ChevronRight className={cn("h-4 w-4 transition-transform", collapsed ? "" : "rotate-180")} aria-hidden="true" /></button></div>
    </aside>
    <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} side="left" title={brand.label} description={roleLabel || profile?.name} className="max-w-[18rem]"><div className="flex min-h-full flex-col"><div className="flex-1">{navigation}</div>{profile ? <div className="border-t border-border pt-3"><ProfileBlock profile={profile} />{onLogout ? <button type="button" onClick={() => { setMobileOpen(false); onLogout(); }} className="mt-2 flex min-h-9 w-full items-center gap-2 rounded-ui px-2 text-sm font-medium text-muted hover:bg-danger-soft hover:text-danger"><LogOut className="h-4 w-4" aria-hidden="true" />{logoutLabel}</button> : null}</div> : null}</div></Drawer>
    <div className={cn("flex min-h-[100dvh] flex-col transition-[padding] duration-150", collapsed ? "lg:pl-[72px]" : "lg:pl-64")}>
      <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-border bg-surface px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3"><button type="button" onClick={() => setMobileOpen(true)} aria-label="Mở menu" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-ui text-muted hover:bg-canvas hover:text-ink lg:hidden"><Menu className="h-5 w-5" aria-hidden="true" /></button><div className="min-w-0"><p className="truncate text-sm font-semibold">{currentTitle}</p><p className="hidden truncate text-xs text-muted sm:block">{brand.label}{roleLabel ? ` / ${roleLabel}` : ""}{currentTitle !== brand.label ? ` / ${currentTitle}` : ""}</p></div></div>
        <div className="flex shrink-0 items-center gap-2">{headerActions}{profile?.href ? <Link to={profile.href} aria-label="Mở hồ sơ" className="inline-flex h-9 w-9 items-center justify-center rounded-ui text-muted hover:bg-canvas hover:text-ink"><UserRound className="h-4 w-4" aria-hidden="true" /></Link> : null}</div>
      </header>
      <main className={cn("w-full flex-1 px-3 py-4 sm:px-5 sm:py-5 lg:px-6", contentClassName)}>{children || <Outlet />}</main>
    </div>
  </div>;
}

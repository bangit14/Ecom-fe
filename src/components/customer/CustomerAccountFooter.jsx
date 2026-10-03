import { Link } from "react-router-dom";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

export default function CustomerAccountFooter({ variant = "full", fixed = false, sections }) {
  const { t } = useTranslation();
  const defaultSections = [
    { id: "about", title: t("footer.about"), links: [{ label: t("footer.aboutUs"), href: "/" }, { label: t("footer.careers"), href: "/" }, { label: t("footer.blog"), href: "/" }] },
    { id: "support", title: t("footer.support"), links: [{ label: t("footer.helpCenter"), href: "/support" }, { label: t("footer.contactUs"), href: "/support" }, { label: t("footer.complaints"), href: "/support" }] },
    { id: "policy", title: t("footer.policy"), links: [{ label: t("footer.terms"), href: "/" }, { label: t("footer.privacy"), href: "/" }, { label: t("footer.shipping"), href: "/" }] },
  ];
  const resolvedSections = sections || defaultSections;

  if (variant === "compact") return <footer className={`${fixed ? "fixed inset-x-0 bottom-0 z-40" : ""} border-t border-border bg-surface`}><div className="mx-auto flex min-h-14 w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs text-muted sm:px-6"><p>© 2026 Shobbe. {t("footer.allRightsReserved")}</p><div className="flex items-center gap-3"><Link to="/products" className="hover:text-primary">{t("footer.shopping")}</Link><span aria-hidden="true">/</span><Link to="/account/vouchers" className="hover:text-primary">{t("footer.voucher")}</Link><span aria-hidden="true">/</span><Link to="/account/profile" className="hover:text-primary">{t("footer.account")}</Link></div></div></footer>;

  return <footer className="mt-auto border-t border-border bg-canvas"><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]"><div><Link to="/" className="inline-flex items-center gap-2 text-lg font-semibold text-ink"><span className="flex h-8 w-8 items-center justify-center rounded-ui bg-primary-soft text-primary"><ShoppingBagIcon className="h-4 w-4" aria-hidden="true" /></span>Shobbe</Link><p className="mt-3 max-w-xs text-sm leading-6 text-muted">{t("footer.brandTagline")}</p></div>{resolvedSections.map((section) => <div key={section.id}><h2 className="text-sm font-semibold text-ink">{section.title}</h2><ul className="mt-3 space-y-2">{section.links.map((link) => <li key={`${section.id}-${link.label}`}><Link to={link.href} className="text-sm text-muted hover:text-primary">{link.label}</Link></li>)}</ul></div>)}</div><div className="mt-8 border-t border-border pt-5 text-xs text-muted"><p>© 2026 Shobbe. {t("footer.allRightsReserved")}</p></div></div></footer>;
}

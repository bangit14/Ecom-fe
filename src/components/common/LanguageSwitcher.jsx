import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckIcon, ChevronDownIcon, GlobeAltIcon } from "@heroicons/react/24/outline";

const LANGUAGES = [{ code: "vi", name: "Tiếng Việt", shortName: "VI", subtext: "Vietnamese" }, { code: "en", name: "English", shortName: "EN", subtext: "English (US)" }];

export default function LanguageSwitcher({ className = "", compact = false, variant = "default" }) {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const currentLang = i18n.resolvedLanguage || i18n.language || "vi";
  const activeLang = LANGUAGES.find((lang) => currentLang.startsWith(lang.code)) || LANGUAGES[0];
  useEffect(() => { const handleClickOutside = (event) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false); }; document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, []);
  const triggerClass = variant === "topbar" ? "inline-flex h-9 items-center gap-1.5 rounded-ui px-2 text-sm font-medium text-muted hover:bg-canvas hover:text-ink focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/15" : "inline-flex h-9 items-center gap-1.5 rounded-ui border border-border bg-surface px-3 text-sm font-medium text-ink hover:bg-canvas focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/15";
  return <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}><button type="button" onClick={() => setIsOpen((previous) => !previous)} aria-expanded={isOpen} aria-haspopup="menu" aria-label={t("lang.select")} className={triggerClass}><GlobeAltIcon className="h-4 w-4 text-muted" aria-hidden="true" /><span>{compact ? activeLang.shortName : activeLang.name}</span><ChevronDownIcon className={`h-4 w-4 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" /></button>{isOpen ? <div role="menu" aria-label={t("lang.select")} className="absolute right-0 z-50 mt-2 w-52 rounded-ui border border-border bg-surface p-2 shadow-ui-lg"><p className="border-b border-border px-2 pb-2 text-sm font-semibold text-muted">{t("lang.select")}</p><div className="mt-1 space-y-1">{LANGUAGES.map((lang) => { const selected = activeLang.code === lang.code; return <button key={lang.code} type="button" role="menuitemradio" aria-checked={selected} onClick={() => { i18n.changeLanguage(lang.code); setIsOpen(false); }} className={`flex min-h-10 w-full items-center justify-between rounded-ui px-2 text-left text-sm focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 ${selected ? "bg-primary-soft text-primary" : "text-ink hover:bg-canvas"}`}><span><span className="block font-medium">{lang.name}</span><span className="block text-sm text-muted">{lang.subtext}</span></span>{selected ? <CheckIcon className="h-4 w-4" aria-hidden="true" /> : null}</button>; })}</div></div> : null}</div>;
}

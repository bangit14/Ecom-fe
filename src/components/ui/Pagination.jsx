import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "./cn";

export default function Pagination({ page = 1, pageCount = 1, onPageChange, density = "comfortable", className }) {
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1).filter((item) => item === 1 || item === pageCount || Math.abs(item - page) <= 1);
  const height = density === "compact" ? "h-8 min-w-8 text-xs" : "h-9 min-w-9 text-sm";
  const buttonClass = "inline-flex items-center justify-center rounded-ui border border-border bg-surface text-muted transition-colors hover:bg-canvas hover:text-ink disabled:pointer-events-none disabled:opacity-45";
  return <nav aria-label="Phân trang" className={cn("flex flex-wrap items-center gap-1", className)}>
    <button type="button" aria-label="Trang trước" disabled={page <= 1} onClick={() => onPageChange?.(page - 1)} className={cn(height, buttonClass)}><ChevronLeft className="h-4 w-4" aria-hidden="true" /></button>
    {pages.map((item, index) => <span key={item} className="contents">{index > 0 && item - pages[index - 1] > 1 ? <span className={cn(height, "inline-flex items-center justify-center text-muted")} aria-hidden="true">...</span> : null}<button type="button" aria-current={item === page ? "page" : undefined} onClick={() => onPageChange?.(item)} className={cn(height, "rounded-ui px-2 font-medium", item === page ? "bg-primary text-white" : "text-muted hover:bg-primary-soft hover:text-primary")}>{item}</button></span>)}
    <button type="button" aria-label="Trang sau" disabled={page >= pageCount} onClick={() => onPageChange?.(page + 1)} className={cn(height, buttonClass)}><ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
  </nav>;
}

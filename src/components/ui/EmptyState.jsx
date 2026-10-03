import { PackageOpen } from "lucide-react";
import Button from "./Button";

export default function EmptyState({ icon, title = "Chưa có dữ liệu", description = "Nội dung sẽ xuất hiện tại đây khi có dữ liệu.", actionLabel, onAction, compact = false }) {
  const IconComponent = icon || PackageOpen;
  return <div className={`flex flex-col items-center justify-center text-center ${compact ? "py-6" : "px-4 py-12"}`}>
    <div className="flex h-11 w-11 items-center justify-center rounded-ui bg-primary-soft text-primary"><IconComponent className="h-5 w-5" aria-hidden="true" /></div>
    <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
    <p className="mt-1 max-w-sm text-sm leading-6 text-muted">{description}</p>
    {actionLabel && onAction ? <Button className="mt-5" size="sm" onClick={onAction}>{actionLabel}</Button> : null}
  </div>;
}

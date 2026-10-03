import { AlertCircle } from "lucide-react";
import Button from "./Button";

export default function ErrorState({ title = "Không thể tải dữ liệu", description = "Đã xảy ra lỗi. Vui lòng thử lại.", actionLabel = "Thử lại", onRetry, className }) {
  return <div role="alert" className={`flex flex-col items-center justify-center px-4 py-10 text-center ${className || ""}`}>
    <div className="flex h-11 w-11 items-center justify-center rounded-ui bg-danger-soft text-danger"><AlertCircle className="h-5 w-5" aria-hidden="true" /></div>
    <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
    <p className="mt-1 max-w-sm text-sm leading-6 text-muted">{description}</p>
    {onRetry ? <Button className="mt-5" size="sm" variant="secondary" onClick={onRetry}>{actionLabel}</Button> : null}
  </div>;
}

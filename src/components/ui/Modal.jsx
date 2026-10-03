import { Dialog, DialogDescription, DialogPanel, DialogTitle } from "@headlessui/react";
import { X } from "lucide-react";
import { cn } from "./cn";

export default function Modal({ open, onClose, title, description, children, footer, className, density = "comfortable" }) {
  const heading = title || "Hộp thoại";
  return <Dialog open={open} onClose={onClose} className="relative z-[70]" aria-label={heading}>
    <div className="fixed inset-0 bg-ink/40 transition-opacity" aria-hidden="true" />
    <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6">
      <div className="flex min-h-full items-center justify-center">
        <DialogPanel role="dialog" aria-modal="true" className={cn("w-full max-w-lg rounded-ui bg-surface shadow-ui-lg", className)}>
          <div className={cn("flex items-start justify-between border-b border-border", density === "compact" ? "px-4 py-3" : "px-5 py-4")}>
            <div className="min-w-0 pr-4">
              <DialogTitle className="text-base font-semibold text-ink">{heading}</DialogTitle>
              {description ? <DialogDescription className="mt-1 text-sm text-muted">{description}</DialogDescription> : null}
            </div>
            <button type="button" onClick={onClose} aria-label="Đóng hộp thoại" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-ui text-muted hover:bg-canvas hover:text-ink">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className={density === "compact" ? "p-4" : "p-5"}>{children}</div>
          {footer ? <div className={cn("border-t border-border", density === "compact" ? "px-4 py-3" : "px-5 py-4")}>{footer}</div> : null}
        </DialogPanel>
      </div>
    </div>
  </Dialog>;
}

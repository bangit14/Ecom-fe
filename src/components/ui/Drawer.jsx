import { Dialog, DialogDescription, DialogPanel, DialogTitle } from "@headlessui/react";
import { X } from "lucide-react";
import { cn } from "./cn";

export default function Drawer({ open, onClose, title, description, children, footer, side = "right", className, density = "compact" }) {
  const position = side === "left" ? "left-0" : "right-0";
  const heading = title || "Bảng điều khiển";
  return <Dialog open={open} onClose={onClose} className="relative z-[70]" aria-label={heading}>
    <div className="fixed inset-0 bg-ink/40" aria-hidden="true" />
    <div className={`fixed inset-y-0 ${position} flex max-w-full`}>
      <DialogPanel role="dialog" aria-modal="true" className={cn("flex h-full w-screen max-w-md flex-col bg-surface shadow-ui-lg", className)}>
        <div className={cn("flex items-start justify-between border-b border-border", density === "compact" ? "px-4 py-3" : "px-5 py-4")}>
          <div className="min-w-0 pr-4">
            <DialogTitle className="text-base font-semibold text-ink">{heading}</DialogTitle>
            {description ? <DialogDescription className="mt-1 text-sm text-muted">{description}</DialogDescription> : null}
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng bảng điều khiển" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-ui text-muted hover:bg-canvas hover:text-ink">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className={cn("min-h-0 flex-1 overflow-y-auto", density === "compact" ? "p-4" : "p-5")}>{children}</div>
        {footer ? <div className={cn("border-t border-border", density === "compact" ? "p-4" : "p-5")}>{footer}</div> : null}
      </DialogPanel>
    </div>
  </Dialog>;
}

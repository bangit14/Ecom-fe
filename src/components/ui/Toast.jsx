import { useCallback, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "./cn";
import { ToastContext } from "./toastContext";

const styles = {
  success: { Icon: CheckCircle2, className: "border-success/30 bg-success-soft text-success-ink" },
  error: { Icon: XCircle, className: "border-danger/30 bg-danger-soft text-danger-ink" },
  warning: { Icon: AlertCircle, className: "border-warning/30 bg-warning-soft text-warning-ink" },
  info: { Icon: Info, className: "border-primary/25 bg-primary-soft text-primary" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const dismiss = useCallback((id) => setToasts((items) => items.filter((item) => item.id !== id)), []);
  const show = useCallback(({ title, description, variant = "info", duration = 5000 }) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((items) => [...items, { id, title, description, variant }]);
    if (duration > 0) window.setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);
  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);
  return <ToastContext.Provider value={value}>{children}<div aria-live="polite" aria-relevant="additions" className="fixed right-4 top-4 z-[80] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">{toasts.map((toast) => { const { Icon, className } = styles[toast.variant] || styles.info; return <div key={toast.id} role="status" aria-atomic="true" className={cn("flex gap-3 rounded-ui border p-3 shadow-ui-md", className)}><Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{toast.title}</p>{toast.description ? <p className="mt-0.5 text-sm opacity-90">{toast.description}</p> : null}</div><button type="button" onClick={() => dismiss(toast.id)} aria-label="Đóng thông báo" className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-ui hover:bg-black/5"><X className="h-4 w-4" aria-hidden="true" /></button></div>; })}</div></ToastContext.Provider>;
}

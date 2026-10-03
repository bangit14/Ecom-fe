import { forwardRef, useId } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";
import { cn } from "./cn";

const Select = forwardRef(function Select({ label, hint, error, density = "comfortable", className, id: providedId, children, ...props }, ref) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const descriptionId = error || hint ? `${id}-description` : undefined;
  return <div className="space-y-1.5">
    {label ? <label htmlFor={id} className="block text-sm font-medium text-ink">{label}</label> : null}
    <div className="relative"><select ref={ref} id={id} aria-invalid={Boolean(error)} aria-describedby={descriptionId} className={cn("w-full appearance-none rounded-ui border bg-surface px-3 pr-10 text-sm text-ink shadow-ui transition-colors hover:border-border-strong focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-canvas", density === "compact" ? "h-9" : "h-11", error ? "border-danger focus:border-danger focus:ring-danger/15" : "border-border", className)} {...props}>{children}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" /></div>
    {error ? <p id={descriptionId} className="flex items-center gap-1.5 text-sm text-danger"><AlertCircle className="h-4 w-4" aria-hidden="true" />{error}</p> : hint ? <p id={descriptionId} className="text-sm text-muted">{hint}</p> : null}
  </div>;
});
export default Select;

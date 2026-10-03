import { forwardRef, useId } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "./cn";

const Input = forwardRef(function Input({ label, hint, error, density = "comfortable", className, id: providedId, ...props }, ref) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const descriptionId = error || hint ? `${id}-description` : undefined;
  return <div className="space-y-1.5">
    {label ? <label htmlFor={id} className="block text-sm font-medium text-ink">{label}</label> : null}
    <input ref={ref} id={id} aria-invalid={Boolean(error)} aria-describedby={descriptionId} className={cn("w-full rounded-ui border bg-surface px-3 text-sm text-ink shadow-ui transition-colors placeholder:text-muted hover:border-border-strong focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-canvas disabled:text-muted", density === "compact" ? "h-9" : "h-11", error ? "border-danger focus:border-danger focus:ring-danger/15" : "border-border", className)} {...props} />
    {error ? <p id={descriptionId} className="flex items-center gap-1.5 text-sm text-danger"><AlertCircle className="h-4 w-4" aria-hidden="true" />{error}</p> : hint ? <p id={descriptionId} className="text-sm text-muted">{hint}</p> : null}
  </div>;
});
export default Input;

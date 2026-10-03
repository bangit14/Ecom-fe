import { forwardRef, useId } from "react";
import { cn } from "./cn";

const Checkbox = forwardRef(function Checkbox({ label, description, error, className, id: providedId, ...props }, ref) {
  const generatedId = useId();
  const id = providedId || generatedId;
  return <div className="space-y-1"><div className="flex items-start gap-2.5"><input ref={ref} id={id} type="checkbox" aria-invalid={Boolean(error)} className={cn("mt-0.5 h-4 w-4 rounded border-border text-primary accent-primary focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} /><div><label htmlFor={id} className="cursor-pointer text-sm font-medium text-ink">{label}</label>{description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}</div></div>{error ? <p className="pl-7 text-sm text-danger">{error}</p> : null}</div>;
});
export default Checkbox;

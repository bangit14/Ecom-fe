import { cn } from "./cn";

export default function FilterBar({ children, actions, className, density = "compact", ...props }) {
  return <section data-density={density} className={cn("flex flex-col gap-3 rounded-ui border border-border bg-surface p-3 shadow-ui sm:flex-row sm:flex-wrap sm:items-end sm:justify-between", className)} {...props}>
    <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
  </section>;
}

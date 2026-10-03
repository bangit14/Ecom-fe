import { cn } from "./cn";

const variants = { neutral: "bg-canvas text-muted-strong", primary: "bg-primary-soft text-primary", success: "bg-success-soft text-success-ink", warning: "bg-warning-soft text-warning-ink", danger: "bg-danger-soft text-danger-ink", info: "bg-info-soft text-info-ink" };
export default function Badge({ children, variant = "neutral", className, ...props }) { return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold leading-5", variants[variant] || variants.neutral, className)} {...props}>{children}</span>; }

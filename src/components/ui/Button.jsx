import { LoaderCircle } from "lucide-react";
import { cn } from "./cn";

const variants = {
  primary: "bg-primary text-white shadow-ui hover:bg-primary-hover active:bg-primary-active",
  secondary: "border border-border bg-surface text-ink hover:bg-canvas",
  ghost: "text-ink hover:bg-primary-soft hover:text-primary",
  danger: "bg-danger text-white hover:bg-danger-ink active:bg-danger-ink",
};
const sizes = { sm: "h-9 px-3 text-xs", md: "h-11 px-4 text-sm", lg: "h-12 px-5 text-base" };

export default function Button({ className, variant = "primary", size = "md", density = "comfortable", loading = false, disabled = false, leftIcon: LeftIcon, rightIcon: RightIcon, type = "button", children, ...props }) {
  const compactSize = density === "compact" && size === "md" ? "h-9 px-3 text-sm" : sizes[size];
  return <button type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={cn("inline-flex min-w-0 shrink-0 items-center justify-center gap-2 rounded-ui font-semibold transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:translate-y-px disabled:pointer-events-none disabled:opacity-50", variants[variant] || variants.primary, compactSize, className)} {...props}>
    {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : LeftIcon ? <LeftIcon className="h-4 w-4" aria-hidden="true" /> : null}
    <span>{children}</span>
    {!loading && RightIcon ? <RightIcon className="h-4 w-4" aria-hidden="true" /> : null}
  </button>;
}

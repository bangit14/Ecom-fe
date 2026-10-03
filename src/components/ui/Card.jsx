import { cn } from "./cn";

export default function Card({ children, className, padding = "md", density = "comfortable", interactive = false, ...props }) {
  const paddingClass = padding === "none" ? "" : padding === "sm" ? "p-3" : density === "compact" ? "p-4" : "p-5";
  return <section data-density={density} className={cn("rounded-ui border border-border bg-surface shadow-ui", paddingClass, interactive && "transition-shadow hover:shadow-ui-md", className)} {...props}>{children}</section>;
}

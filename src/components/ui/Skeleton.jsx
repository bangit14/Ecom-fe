import { cn } from "./cn";

export default function Skeleton({ className, label = "Đang tải" }) {
  return <div role="status" aria-label={label} className={cn("animate-pulse rounded-ui bg-border/65", className)} />;
}

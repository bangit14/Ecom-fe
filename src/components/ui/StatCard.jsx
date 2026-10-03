import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import Skeleton from "./Skeleton";
import { cn } from "./cn";

const trendStyles = {
  up: { Icon: ArrowUpRight, className: "text-success" },
  down: { Icon: ArrowDownRight, className: "text-danger" },
  neutral: { Icon: Minus, className: "text-muted" },
};

export default function StatCard({ label, value, description, trend, trendDirection = "neutral", icon: Icon, loading = false, className, density = "comfortable" }) {
  const trendStyle = trendStyles[trendDirection] || trendStyles.neutral;
  const TrendIcon = trendStyle.Icon;
  return <section data-density={density} className={cn("rounded-ui border border-border bg-surface p-4 shadow-ui", className)} aria-busy={loading || undefined}>
    {loading ? <div className="space-y-3"><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-40" /></div> : <>
      <div className="flex items-start justify-between gap-3"><p className="text-sm font-medium text-muted">{label}</p>{Icon ? <span className="flex h-8 w-8 items-center justify-center rounded-ui bg-primary-soft text-primary"><Icon className="h-4 w-4" aria-hidden="true" /></span> : null}</div>
      <p className="mt-3 text-ui-h2 font-semibold tracking-tight text-ink">{value}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">{trend !== undefined ? <span className={cn("inline-flex items-center gap-0.5 font-semibold", trendStyle.className)}><TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />{trend}</span> : null}{description ? <span>{description}</span> : null}</div>
    </>}
  </section>;
}

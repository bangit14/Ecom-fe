import { useId, useState } from "react";
import { cn } from "./cn";

export default function Tabs({ items = [], value, defaultValue, onValueChange, density = "comfortable", className, ariaLabel = "Tabs" }) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? items[0]?.value);
  const currentValue = value ?? internalValue;
  const baseId = useId().replace(/:/g, "");
  const select = (nextValue) => { if (value === undefined) setInternalValue(nextValue); onValueChange?.(nextValue); };
  const move = (currentIndex, direction) => { const enabled = items.filter((item) => !item.disabled); const current = enabled.findIndex((item) => item.value === items[currentIndex]?.value); const next = enabled[(current + direction + enabled.length) % enabled.length]; if (next) select(next.value); };
  return <div className={className}>
    <div role="tablist" aria-label={ariaLabel} className="inline-flex max-w-full gap-1 overflow-x-auto rounded-ui bg-canvas p-1">
      {items.map((item, index) => <button key={item.value} id={`${baseId}-${item.value}-tab`} type="button" role="tab" tabIndex={currentValue === item.value ? 0 : -1} aria-selected={currentValue === item.value} aria-controls={`${baseId}-${item.value}-panel`} disabled={item.disabled} onClick={() => select(item.value)} onKeyDown={(event) => { if (event.key === "ArrowRight") { event.preventDefault(); move(index, 1); } if (event.key === "ArrowLeft") { event.preventDefault(); move(index, -1); } }} className={cn("shrink-0 rounded-ui px-3 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50", density === "compact" ? "h-8 text-xs" : "h-9 text-sm", currentValue === item.value ? "bg-surface text-ink shadow-ui" : "text-muted hover:text-ink")}>{item.label}</button>)}
    </div>
    {items.map((item) => currentValue === item.value ? <div key={item.value} id={`${baseId}-${item.value}-panel`} role="tabpanel" tabIndex={0} aria-labelledby={`${baseId}-${item.value}-tab`} className="pt-4">{item.content}</div> : null)}
  </div>;
}

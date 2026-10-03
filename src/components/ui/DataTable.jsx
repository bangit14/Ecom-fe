import Skeleton from "./Skeleton";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import { cn } from "./cn";

function CellValue({ column, row, rowIndex }) {
  return column.render ? column.render(row, rowIndex) : row[column.key];
}

function LoadingRows({ columns, cellPadding }) {
  return Array.from({ length: 4 }, (_, row) => <tr key={row}>{columns.map((column) => <td key={column.key} className={cellPadding}><Skeleton className="h-4 w-full min-w-20" /></td>)}</tr>);
}

export default function DataTable({ columns = [], data = [], getRowKey = (_, index) => index, loading = false, error, onRetry, emptyTitle, emptyDescription, density = "compact", caption = "Bảng dữ liệu", className, mobileCard, responsive = true }) {
  const rows = Array.isArray(data) ? data : [];
  const cellPadding = density === "compact" ? "px-4 py-2.5" : "px-5 py-4";
  const mobileColumns = columns.filter((column) => column.mobile !== false);
  const state = loading ? "loading" : error ? "error" : rows.length === 0 ? "empty" : "ready";
  const table = <div className={cn("overflow-x-auto rounded-ui border border-border bg-surface", className)}>
    <table className="min-w-full text-left text-sm">
      <caption className="sr-only">{caption}</caption>
      <thead className="bg-canvas text-xs font-semibold uppercase tracking-wide text-muted"><tr>{columns.map((column) => <th key={column.key} scope="col" className={cn(cellPadding, "whitespace-nowrap", column.className)}>{column.header}</th>)}</tr></thead>
      <tbody className="divide-y divide-border">
        {state === "loading" ? <LoadingRows columns={columns} cellPadding={cellPadding} /> : null}
        {state === "error" ? <tr><td colSpan={Math.max(columns.length, 1)}><ErrorState description={typeof error === "string" ? error : undefined} onRetry={onRetry} /></td></tr> : null}
        {state === "empty" ? <tr><td colSpan={Math.max(columns.length, 1)}><EmptyState compact title={emptyTitle} description={emptyDescription} /></td></tr> : null}
        {state === "ready" ? rows.map((row, rowIndex) => <tr key={getRowKey(row, rowIndex)} className="text-ink transition-colors hover:bg-canvas">{columns.map((column) => <td key={column.key} className={cn(cellPadding, column.className)}><CellValue column={column} row={row} rowIndex={rowIndex} /></td>)}</tr>) : null}
      </tbody>
    </table>
  </div>;
  if (!responsive) return table;
  return <div className={className}>
    <div className="hidden md:block">{table}</div>
    <div className="grid gap-3 md:hidden">
      {state === "loading" ? Array.from({ length: 3 }, (_, index) => <div key={index} className="rounded-ui border border-border bg-surface p-4 shadow-ui"><div className="space-y-3"><Skeleton className="h-4 w-2/5" /><Skeleton className="h-4 w-4/5" /><Skeleton className="h-4 w-3/5" /></div></div>) : null}
      {state === "error" ? <div className="rounded-ui border border-border bg-surface"><ErrorState description={typeof error === "string" ? error : undefined} onRetry={onRetry} /></div> : null}
      {state === "empty" ? <div className="rounded-ui border border-border bg-surface"><EmptyState title={emptyTitle} description={emptyDescription} /></div> : null}
      {state === "ready" ? rows.map((row, rowIndex) => <article key={getRowKey(row, rowIndex)} className="rounded-ui border border-border bg-surface p-4 shadow-ui">{mobileCard ? mobileCard(row, rowIndex) : <dl className="grid gap-3">{mobileColumns.map((column) => <div key={column.key} className="grid grid-cols-[minmax(6rem,0.7fr)_minmax(0,1.3fr)] gap-3"><dt className="text-xs font-semibold uppercase tracking-wide text-muted">{column.header}</dt><dd className="min-w-0 text-sm text-ink"><CellValue column={column} row={row} rowIndex={rowIndex} /></dd></div>)}</dl>}</article>) : null}
    </div>
  </div>;
}

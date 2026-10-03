import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const tabs = [
  { key: "ALL", label: "Tất cả" },
  { key: "ACTIVE", label: "Đang bán" },
  { key: "OUT_OF_STOCK", label: "Hết hàng" },
  { key: "PENDING", label: "Chờ duyệt" },
  { key: "INACTIVE", label: "Đã ẩn" },
];

export default function SellerProductFilters({ products, activeTab, searchQuery, selectedIds, onTabChange, onSearchChange, onDeleteSelected }) {
  return <div className="space-y-3"><div className="flex gap-1 overflow-x-auto border-b border-border" role="tablist" aria-label="Lọc sản phẩm">{tabs.map((tab) => { const count = tab.key === "ALL" ? products.length : tab.key === "OUT_OF_STOCK" ? products.filter((product) => product.stock === 0 || product.status === "OUT_OF_STOCK").length : products.filter((product) => product.status === tab.key).length; return <button key={tab.key} type="button" role="tab" aria-selected={activeTab === tab.key} onClick={() => onTabChange(tab.key)} className={`shrink-0 border-b-2 px-3 py-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted hover:border-border hover:text-ink"}`}>{tab.label} <span className="ml-1 text-xs text-muted">{count}</span></button>; })}</div><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><label className="relative block w-full sm:max-w-sm"><span className="sr-only">Tìm sản phẩm</span><MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" /><input type="search" value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} placeholder="Tìm theo tên hoặc SKU" className="h-10 w-full rounded-ui border border-border bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15" /></label>{selectedIds.length ? <button type="button" onClick={onDeleteSelected} className="h-10 rounded-ui bg-danger-soft px-3 text-sm font-semibold text-danger hover:bg-danger hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-danger/15">Xóa {selectedIds.length} sản phẩm</button> : null}</div></div>;
}

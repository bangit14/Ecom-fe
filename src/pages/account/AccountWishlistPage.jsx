import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { EmptyState, ErrorState, ProductCard, Skeleton, Button } from "../../components/ui";
import { wishlistService } from "../../services/wishlistService";
import { getErrorMessage } from "../../utils/errorHandler";

const PAGE_SIZE = 12;

export default function AccountWishlistPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasItems = items.length > 0;
  const canGoPrev = page > 0;
  const canGoNext = page + 1 < totalPages;

  const fetchWishlist = async (pageNumber) => {
    setLoading(true); setError("");
    try {
      const data = await wishlistService.getMyWishlist({ page: pageNumber, size: PAGE_SIZE });
      setItems(Array.isArray(data?.content) ? data.content : []);
      setPage(Number.isFinite(data?.number) ? data.number : pageNumber);
      setTotalPages(Math.max(1, Number.isFinite(data?.totalPages) ? data.totalPages : 1));
    } catch (err) { setItems([]); setTotalPages(1); setError(getErrorMessage(err, "Không thể tải wishlist.")); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchWishlist(0); }, []);
  const handleToggleWishlist = async (productId) => {
    if (!productId) return;
    try {
      await wishlistService.toggleWishlistItem(productId);
      toast.success("Đã cập nhật danh sách yêu thích.");
      setItems((prev) => { const filtered = prev.filter((item) => String(item?.id) !== String(productId)); if (filtered.length === 0 && page > 0) fetchWishlist(page - 1); return filtered; });
    } catch (err) { toast.error(getErrorMessage(err, "Không thể cập nhật yêu thích.")); }
  };
  const pageLabel = useMemo(() => totalPages > 1 ? `Trang ${page + 1} / ${totalPages}` : null, [page, totalPages]);

  return <div className="space-y-5"><div><p className="text-sm font-semibold text-primary">Tài khoản / lựa chọn đã lưu</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">{t("account.wishlist")}</h1><p className="mt-2 text-sm leading-6 text-muted">Lưu lại những sản phẩm bạn muốn xem hoặc mua sau.</p></div>{loading ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="rounded-ui border border-border bg-surface p-3 shadow-ui"><Skeleton className="aspect-square w-full" /><Skeleton className="mt-4 h-4 w-4/5" /><Skeleton className="mt-3 h-5 w-2/5" /></div>)}</div> : error ? <div className="rounded-ui border border-border bg-surface"><ErrorState description={error} onRetry={() => fetchWishlist(page)} /></div> : !hasItems ? <div className="rounded-ui border border-dashed border-border bg-surface"><EmptyState title={t("account.emptyWishlist")} description={t("cart.emptySubtitle")} actionLabel={t("home.shopNow")} onAction={() => navigate("/products")} /></div> : <><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{items.map((item) => <ProductCard key={item?.id} product={item} href={`/products/${item?.id}`} wishlisted onToggleWishlist={(product) => handleToggleWishlist(product?.id)} density="comfortable" />)}</div>{pageLabel ? <div className="flex flex-wrap items-center justify-between gap-3"><span className="text-sm text-muted">{pageLabel}</span><div className="flex items-center gap-2"><Button variant="secondary" size="sm" density="compact" onClick={() => fetchWishlist(page - 1)} disabled={!canGoPrev}>Trước</Button><Button variant="secondary" size="sm" density="compact" onClick={() => fetchWishlist(page + 1)} disabled={!canGoNext}>Sau</Button></div></div> : null}</>}</div>;
}

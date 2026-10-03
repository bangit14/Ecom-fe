import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { AdjustmentsHorizontalIcon, ArrowPathIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import CustomerAccountHeader from "../../components/customer/CustomerAccountHeader";
import CustomerAccountFooter from "../../components/customer/CustomerAccountFooter";
import { Badge, Button, Drawer, EmptyState, ErrorState, Input, ProductCard, Select, Skeleton } from "../../components/ui";
import { useTranslation } from "react-i18next";
import { categoryService } from "../../services/categoryService";
import { productService } from "../../services/productService";
import { getErrorMessage } from "../../utils/errorHandler";

const PAGE_SIZE = 20;
const SORT_OPTIONS = [
  { value: "popular", label: "Bán chạy" },
  { value: "priceAsc", label: "Giá thấp đến cao" },
  { value: "priceDesc", label: "Giá cao đến thấp" },
];

const toSafeNumber = (value) => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : null; };
const flattenCategoryTree = (tree) => {
  const categoryMap = new Map();
  const walk = (node, parentId = null) => {
    if (!node?.id) return;
    const normalizedNode = { ...node, parentId: node.parentId ?? parentId, children: Array.isArray(node.children) ? node.children : [] };
    categoryMap.set(String(node.id), normalizedNode);
    normalizedNode.children.forEach((child) => walk(child, node.id));
  };
  (Array.isArray(tree) ? tree : []).forEach((rootNode) => walk(rootNode, null));
  return categoryMap;
};
const getProductImage = (product, detail) => {
  const detailImages = Array.isArray(detail?.images) ? detail.images : [];
  const mainDetailImage = detailImages.find((image) => image?.isMain || image?.main) || detailImages[0];
  return mainDetailImage?.imageUrl || product?.mainImage?.imageUrl || "";
};
const getProductVariants = (product, detail) => Array.isArray(detail?.variants) ? detail.variants : Array.isArray(product?.variants) ? product.variants : [];
const getProductPriceData = (product, detail) => {
  const variants = getProductVariants(product, detail);
  const prices = variants.map((variant) => toSafeNumber(variant?.price)).filter((value) => value !== null);
  const comparePrices = variants.map((variant) => toSafeNumber(variant?.compareAtPrice)).filter((value) => value !== null);
  const minPrice = prices.length > 0 ? prices.reduce((min, value) => Math.min(min, value)) : null;
  const maxCompareAt = comparePrices.length > 0 ? comparePrices.reduce((max, value) => Math.max(max, value)) : null;
  return { displayPrice: minPrice, comparePrice: maxCompareAt !== null && minPrice !== null && maxCompareAt > minPrice ? maxCompareAt : null, sortPrice: minPrice };
};
const getSoldScore = (product, detail) => {
  const candidates = [detail?.soldCount, detail?.totalSold, detail?.salesCount, product?.soldCount, product?.totalSold, product?.salesCount];
  for (const candidate of candidates) { const parsed = Number(candidate); if (Number.isFinite(parsed) && parsed >= 0) return parsed; }
  return 0;
};
const getStockQuantity = (detail) => (Array.isArray(detail?.variants) ? detail.variants : []).reduce((sum, variant) => { const quantity = Number(variant?.stockQuantity); return Number.isFinite(quantity) ? sum + quantity : sum; }, 0);
const parseCategoryFilterIds = (selectedCategoryId, selectedSubcategoryId) => {
  const value = selectedSubcategoryId || selectedCategoryId;
  const parsed = Number.parseInt(value || "", 10);
  return Number.isInteger(parsed) ? [parsed] : [];
};
const buildProductsFilter = ({ appliedFilter, selectedCategoryId, selectedSubcategoryId }) => {
  const categoryFilterIds = parseCategoryFilterIds(selectedCategoryId, selectedSubcategoryId);
  return { ...(appliedFilter.keyword ? { name: appliedFilter.keyword.trim() } : {}), ...(appliedFilter.brand ? { brand: appliedFilter.brand.trim() } : {}), ...(appliedFilter.minPrice ? { minPrice: appliedFilter.minPrice } : {}), ...(appliedFilter.maxPrice ? { maxPrice: appliedFilter.maxPrice } : {}), ...(categoryFilterIds.length > 0 ? { categoryId: categoryFilterIds } : {}) };
};

export default function ProductsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");
  const [productsRetry, setProductsRetry] = useState(0);
  const initialSubcategoryId = searchParams.get("subcategoryId") || "";
  const initialSort = searchParams.get("sort") || "popular";
  const initialKeyword = searchParams.get("keyword") || "";
  const initialBrand = searchParams.get("brand") || "";
  const initialMinPrice = searchParams.get("minPrice") || "";
  const initialMaxPrice = searchParams.get("maxPrice") || "";
  const selectedCategoryId = searchParams.get("categoryId") || "";
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(initialSubcategoryId);
  const [sortOption, setSortOption] = useState(SORT_OPTIONS.some((option) => option.value === initialSort) ? initialSort : "popular");
  const [pendingFilter, setPendingFilter] = useState({ keyword: initialKeyword, brand: initialBrand, minPrice: initialMinPrice, maxPrice: initialMaxPrice });
  const [appliedFilter, setAppliedFilter] = useState({ keyword: initialKeyword, brand: initialBrand, minPrice: initialMinPrice, maxPrice: initialMaxPrice });
  const [productsPage, setProductsPage] = useState({ content: [], totalElements: 0, totalPages: 0, pageNumber: 0, pageSize: PAGE_SIZE });
  const [currentPage, setCurrentPage] = useState(() => { const rawPage = Number.parseInt(searchParams.get("page") || "1", 10); return !Number.isFinite(rawPage) || rawPage < 1 ? 0 : rawPage - 1; });
  const [productDetailsMap, setProductDetailsMap] = useState({});
  const categoryMap = useMemo(() => flattenCategoryTree(categories), [categories]);
  const activeCategory = selectedCategoryId ? categoryMap.get(String(selectedCategoryId)) : null;
  const subcategories = useMemo(() => { if (!activeCategory) return []; if (activeCategory.children.length > 0) return activeCategory.children; const parentCategory = activeCategory.parentId ? categoryMap.get(String(activeCategory.parentId)) : null; return parentCategory?.children || []; }, [activeCategory, categoryMap]);
  const availableBrands = useMemo(() => Array.from(new Set((productsPage.content || []).map((product) => (product?.brand || "").trim()).filter(Boolean))).sort((left, right) => left.localeCompare(right, "vi")), [productsPage.content]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategoryId) params.set("categoryId", String(selectedCategoryId));
    if (selectedSubcategoryId) params.set("subcategoryId", String(selectedSubcategoryId));
    if (sortOption && sortOption !== "popular") params.set("sort", sortOption);
    if (appliedFilter.keyword) params.set("keyword", appliedFilter.keyword);
    if (appliedFilter.brand) params.set("brand", appliedFilter.brand);
    if (appliedFilter.minPrice) params.set("minPrice", appliedFilter.minPrice);
    if (appliedFilter.maxPrice) params.set("maxPrice", appliedFilter.maxPrice);
    if (currentPage > 0) params.set("page", String(currentPage + 1));
    setSearchParams(params, { replace: true });
  }, [appliedFilter, currentPage, selectedCategoryId, selectedSubcategoryId, setSearchParams, sortOption]);

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try { const data = await categoryService.getCategoryTree(); if (isMounted) setCategories(Array.isArray(data) ? data : []); } catch (error) { if (isMounted) { setCategories([]); toast.error(getErrorMessage(error, "Không thể tải danh mục.")); } } finally { if (isMounted) setCategoriesLoading(false); }
    };
    fetchCategories();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      setProductsLoading(true);
      setProductsError("");
      try {
        const data = await productService.getProducts({ filter: buildProductsFilter({ appliedFilter, selectedCategoryId, selectedSubcategoryId }), page: currentPage, size: PAGE_SIZE, sortBy: "createdAt", sortDir: "desc" });
        if (isMounted) setProductsPage(data || { content: [], totalElements: 0, totalPages: 0, pageNumber: currentPage, pageSize: PAGE_SIZE });
      } catch (error) {
        if (isMounted) { setProductsError(getErrorMessage(error, "Không thể tải sản phẩm.")); setProductsPage({ content: [], totalElements: 0, totalPages: 0, pageNumber: currentPage, pageSize: PAGE_SIZE }); }
      } finally { if (isMounted) setProductsLoading(false); }
    };
    fetchProducts();
    return () => { isMounted = false; };
  }, [appliedFilter, currentPage, selectedCategoryId, selectedSubcategoryId, productsRetry]);

  useEffect(() => {
    let isMounted = true;
    const fetchProductDetails = async () => {
      const products = Array.isArray(productsPage.content) ? productsPage.content : [];
      if (products.length === 0) { setProductDetailsMap({}); return; }
      setDetailsLoading(true);
      try {
        const detailResults = await Promise.allSettled(products.map((product) => productService.getProductById(product.id)));
        if (!isMounted) return;
        const nextDetailsMap = {};
        detailResults.forEach((result, index) => { if (result.status === "fulfilled" && products[index]?.id) nextDetailsMap[products[index].id] = result.value; });
        setProductDetailsMap(nextDetailsMap);
      } finally { if (isMounted) setDetailsLoading(false); }
    };
    fetchProductDetails();
    return () => { isMounted = false; };
  }, [productsPage.content]);

  const productCards = useMemo(() => {
    const products = Array.isArray(productsPage.content) ? productsPage.content : [];
    const mapped = products.map((product) => { const detail = productDetailsMap[product.id]; const { displayPrice, comparePrice, sortPrice } = getProductPriceData(product, detail); return { ...product, displayPrice, comparePrice, sortPrice, imageUrl: getProductImage(product, detail), soldScore: getSoldScore(product, detail), stockQuantity: getStockQuantity(detail) }; });
    if (sortOption === "priceAsc") return [...mapped].sort((left, right) => (left.sortPrice ?? Number.POSITIVE_INFINITY) - (right.sortPrice ?? Number.POSITIVE_INFINITY));
    if (sortOption === "priceDesc") return [...mapped].sort((left, right) => (right.sortPrice ?? Number.NEGATIVE_INFINITY) - (left.sortPrice ?? Number.NEGATIVE_INFINITY));
    return [...mapped].sort((left, right) => (right.soldScore - left.soldScore) || (new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()));
  }, [productDetailsMap, productsPage.content, sortOption]);

  const handleApplyFilter = () => { setAppliedFilter({ keyword: pendingFilter.keyword.trim(), brand: pendingFilter.brand.trim(), minPrice: pendingFilter.minPrice.trim(), maxPrice: pendingFilter.maxPrice.trim() }); setCurrentPage(0); setIsFilterPanelOpen(false); };
  const handleResetFilter = () => { const next = { keyword: "", brand: "", minPrice: "", maxPrice: "" }; setPendingFilter(next); setAppliedFilter(next); setCurrentPage(0); setIsFilterPanelOpen(false); };
  const handleSubcategoryChange = (subcategoryId) => { setSelectedSubcategoryId(String(subcategoryId)); setCurrentPage(0); };
  const handleClearSubcategory = () => { setSelectedSubcategoryId(""); setCurrentPage(0); };
  const totalPages = Math.max(1, productsPage.totalPages || 1);
  const currentPageLabel = (productsPage.pageNumber || 0) + 1;
  const hasAppliedFilter = Boolean(appliedFilter.keyword || appliedFilter.brand || appliedFilter.minPrice || appliedFilter.maxPrice || selectedSubcategoryId);
  const selectedCategoryLabel = activeCategory?.name || "Danh mục đã chọn";
  const productListSearch = searchParams.toString();
  const subcategoryFilterContent = !selectedCategoryId ? <p className="text-sm leading-6 text-muted">Vui lòng chọn danh mục từ trang chủ để xem danh mục con.</p> : categoriesLoading ? <Skeleton className="h-24 w-full" /> : subcategories.length === 0 ? <p className="text-sm leading-6 text-muted">Danh mục này chưa có danh mục con.</p> : <div className="space-y-1"><button type="button" onClick={handleClearSubcategory} className={`w-full rounded-ui px-3 py-2 text-left text-sm ${selectedSubcategoryId === "" ? "bg-primary-soft font-semibold text-primary" : "text-muted hover:bg-canvas hover:text-ink"}`}>Tất cả danh mục con</button>{subcategories.map((subcategory) => <button key={subcategory.id} type="button" onClick={() => handleSubcategoryChange(subcategory.id)} className={`w-full rounded-ui px-3 py-2 text-left text-sm ${String(subcategory.id) === String(selectedSubcategoryId) ? "bg-primary-soft font-semibold text-primary" : "text-muted hover:bg-canvas hover:text-ink"}`}>{subcategory.name}</button>)}</div>;

  let productsSectionContent;
  if (productsLoading) productsSectionContent = <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="rounded-ui border border-border bg-surface p-3 shadow-ui"><Skeleton className="aspect-square w-full" /><Skeleton className="mt-4 h-4 w-4/5" /><Skeleton className="mt-3 h-5 w-2/5" /></div>)}</div>;
  else if (productsError) productsSectionContent = <div className="rounded-ui border border-border bg-surface"><ErrorState description={productsError} onRetry={() => setProductsRetry((value) => value + 1)} /></div>;
  else if (productCards.length === 0) productsSectionContent = <div className="rounded-ui border border-dashed border-border bg-surface"><EmptyState title={t("products.noProductsFound")} description={t("products.tryOtherFilters")} actionLabel={t("products.clearFilter")} onAction={handleResetFilter} /></div>;
  else productsSectionContent = <><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">{productCards.map((product) => <ProductCard key={product.id} product={{ ...product, image: product.imageUrl, price: product.displayPrice, originalPrice: product.comparePrice }} href={productListSearch ? `/products/${product.id}?${productListSearch}` : `/products/${product.id}`} density="comfortable" />)}</div><div className="flex flex-wrap items-center justify-between gap-3 rounded-ui border border-border bg-surface px-4 py-3"><p className="text-sm text-muted">Trang {currentPageLabel} / {totalPages}</p><div className="flex items-center gap-2"><Button variant="secondary" size="sm" density="compact" leftIcon={ChevronLeftIcon} onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))} disabled={currentPage <= 0 || productsLoading}>Trước</Button><Button variant="secondary" size="sm" density="compact" rightIcon={ChevronRightIcon} onClick={() => setCurrentPage((prev) => Math.min(Math.max(0, totalPages - 1), prev + 1))} disabled={productsLoading || currentPage + 1 >= totalPages}>Tiếp</Button></div></div>{detailsLoading ? <p className="text-right text-xs text-muted">Đang cập nhật giá, ảnh và tồn kho...</p> : null}</>;

  return <div className="flex min-h-[100dvh] flex-col bg-canvas text-ink"><CustomerAccountHeader /><main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8"><div className="space-y-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-primary">Shobbe / khám phá</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">{t("products.title")}</h1><p className="mt-2 text-sm text-muted">{productsPage.totalElements || 0} {t("products.totalCount")}</p></div><Button variant="secondary" size="sm" density="compact" leftIcon={ArrowPathIcon} onClick={() => { setCurrentPage(0); setProductsRetry((value) => value + 1); }}>{t("common.refresh")}</Button></div><div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[240px_minmax(0,1fr)]"><aside className="sticky top-24 hidden rounded-ui border border-border bg-surface p-4 shadow-ui xl:block"><div className="flex items-start justify-between gap-3"><div><h2 className="text-sm font-semibold text-ink">Danh mục con</h2><p className="mt-1 text-xs leading-5 text-muted">{selectedCategoryLabel}</p></div>{hasAppliedFilter ? <Badge variant="primary">1</Badge> : null}</div><div className="mt-4 rounded-ui bg-canvas p-2">{subcategoryFilterContent}</div></aside><section className="min-w-0 space-y-4"><div className="flex flex-col gap-3 rounded-ui border border-border bg-surface p-3 shadow-ui sm:flex-row sm:items-center sm:justify-between"><Button variant="secondary" size="sm" density="compact" leftIcon={AdjustmentsHorizontalIcon} onClick={() => setIsFilterPanelOpen(true)}>{t("common.filter")}{hasAppliedFilter ? <Badge variant="primary">1</Badge> : null}</Button><div className="flex items-center gap-3"><span className="hidden text-sm text-muted sm:inline">Sắp xếp:</span><Select id="products-sort" aria-label={t("products.sortBy")} value={sortOption} onChange={(event) => { setSortOption(event.target.value); setCurrentPage(0); }} density="compact" className="min-w-44"><option value="popular">Bán chạy</option><option value="priceAsc">Giá thấp đến cao</option><option value="priceDesc">Giá cao đến thấp</option></Select></div></div>{productsSectionContent}</section></div></div></main><CustomerAccountFooter /><Drawer open={isFilterPanelOpen} onClose={() => setIsFilterPanelOpen(false)} title="Bộ lọc sản phẩm" description="Thu hẹp kết quả theo nhu cầu" footer={<div className="grid grid-cols-2 gap-2"><Button onClick={handleApplyFilter}>Áp dụng</Button><Button variant="secondary" onClick={handleResetFilter}>Xóa lọc</Button></div>}><div className="space-y-5"><div className="space-y-4"><Input label="Tìm kiếm sản phẩm" value={pendingFilter.keyword} onChange={(event) => setPendingFilter((prev) => ({ ...prev, keyword: event.target.value }))} placeholder="Nhập tên sản phẩm" /><div><Input label="Thương hiệu" value={pendingFilter.brand} onChange={(event) => setPendingFilter((prev) => ({ ...prev, brand: event.target.value }))} placeholder="Ví dụ: Nike, Adidas" />{availableBrands.length > 0 ? <div className="mt-2 flex flex-wrap gap-2">{availableBrands.map((brand) => <button key={brand} type="button" onClick={() => setPendingFilter((prev) => ({ ...prev, brand }))} className={`rounded-ui border px-3 py-1.5 text-xs font-semibold ${pendingFilter.brand.trim().toLowerCase() === brand.trim().toLowerCase() ? "border-primary bg-primary-soft text-primary" : "border-border text-muted hover:border-primary hover:text-primary"}`}>{brand}</button>)}</div> : null}</div><div className="grid grid-cols-2 gap-3"><Input label="Giá từ" type="number" min="0" value={pendingFilter.minPrice} onChange={(event) => setPendingFilter((prev) => ({ ...prev, minPrice: event.target.value }))} placeholder="0" /><Input label="Giá đến" type="number" min="0" value={pendingFilter.maxPrice} onChange={(event) => setPendingFilter((prev) => ({ ...prev, maxPrice: event.target.value }))} placeholder="999999" /></div></div><div className="rounded-ui bg-canvas p-3 text-sm leading-6 text-muted">Danh mục con đang hiển thị ở bộ lọc bên trái trên màn hình lớn. Trên điện thoại, hãy chọn từ danh mục ở trang chủ.</div></div></Drawer></div>;
}

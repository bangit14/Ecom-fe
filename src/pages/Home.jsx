import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { StarIcon, TruckIcon, ShieldCheckIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { BookOpen, ChevronLeft, ChevronRight, Dumbbell, House, Package, Shirt, Smartphone, Sparkles } from "lucide-react";
import CustomerAccountHeader from "../components/customer/CustomerAccountHeader";
import CustomerAccountFooter from "../components/customer/CustomerAccountFooter";
import { EmptyState, ErrorState, ProductCard, Skeleton } from "../components/ui";
import { categoryService } from "../services/categoryService";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [categoryRetry, setCategoryRetry] = useState(0);
  const [brokenCategoryIconIds, setBrokenCategoryIconIds] = useState(() => new Set());
  const [canScrollCategoriesLeft, setCanScrollCategoriesLeft] = useState(false);
  const [canScrollCategoriesRight, setCanScrollCategoriesRight] = useState(false);
  const categoryScrollerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCategoryTree = async () => {
      setCategoriesLoading(true);
      setCategoriesError("");
      try {
        const data = await categoryService.getCategoryTree();
        if (isMounted) setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load category tree", error);
        if (isMounted) {
          setCategories([]);
          setCategoriesError("Không thể tải danh mục. Vui lòng thử lại.");
        }
      } finally {
        if (isMounted) setCategoriesLoading(false);
      }
    };
    fetchCategoryTree();
    return () => { isMounted = false; };
  }, [categoryRetry]);

  const updateCategoryScrollState = () => {
    const scroller = categoryScrollerRef.current;
    if (!scroller) {
      setCanScrollCategoriesLeft(false);
      setCanScrollCategoriesRight(false);
      return;
    }
    setCanScrollCategoriesLeft(scroller.scrollLeft > 6);
    setCanScrollCategoriesRight(scroller.scrollWidth - scroller.clientWidth - scroller.scrollLeft > 6);
  };

  useEffect(() => { updateCategoryScrollState(); }, [categoriesLoading, categories]);
  useEffect(() => {
    const scroller = categoryScrollerRef.current;
    if (!scroller) return undefined;
    const handleScroll = () => updateCategoryScrollState();
    scroller.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();
    return () => { scroller.removeEventListener("scroll", handleScroll); window.removeEventListener("resize", handleScroll); };
  }, [categoriesLoading, categories]);

  const featuredProducts = [
    { id: 1, name: "Sản phẩm Premium 1", price: "499.000₫", originalPrice: "799.000₫", rating: 4.8, reviews: 128, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop", badge: "Hot" },
    { id: 2, name: "Sản phẩm Premium 2", price: "699.000₫", originalPrice: "999.000₫", rating: 4.9, reviews: 256, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop", badge: "New" },
    { id: 3, name: "Sản phẩm Premium 3", price: "399.000₫", originalPrice: "599.000₫", rating: 4.7, reviews: 89, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop", badge: "Sale" },
    { id: 4, name: "Sản phẩm Premium 4", price: "899.000₫", originalPrice: "1.299.000₫", rating: 5, reviews: 342, image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99e?w=500&h=500&fit=crop", badge: "Best" },
  ];
  const benefits = [
    { id: "shipping", icon: TruckIcon, title: t("home.benefits.shipping.title"), description: t("home.benefits.shipping.desc") },
    { id: "secure", icon: ShieldCheckIcon, title: t("home.benefits.secure.title"), description: t("home.benefits.secure.desc") },
    { id: "quality", icon: StarIcon, title: t("home.benefits.quality.title"), description: t("home.benefits.quality.desc") },
  ];

  const getCategoryIcon = (name = "", slug = "") => {
    const normalized = `${name} ${slug}`.toLowerCase();
    if (normalized.includes("điện") || normalized.includes("electronics") || normalized.includes("phone")) return Smartphone;
    if (normalized.includes("nhà") || normalized.includes("home") || normalized.includes("nội thất")) return House;
    if (normalized.includes("sách") || normalized.includes("book")) return BookOpen;
    if (normalized.includes("làm đẹp") || normalized.includes("mỹ phẩm") || normalized.includes("beauty")) return Sparkles;
    if (normalized.includes("thể thao") || normalized.includes("sport") || normalized.includes("fitness")) return Dumbbell;
    if (normalized.includes("thời trang") || normalized.includes("fashion") || normalized.includes("quần áo")) return Shirt;
    return Package;
  };
  const handleCategoryIconError = (categoryId) => setBrokenCategoryIconIds((prev) => new Set(prev).add(categoryId));
  const scrollCategories = (direction) => {
    const scroller = categoryScrollerRef.current;
    if (!scroller) return;
    const behavior = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    scroller.scrollBy({ left: direction * Math.max(280, Math.floor(scroller.clientWidth * 0.82)), behavior });
  };

  let categorySectionContent;
  if (categoriesLoading) {
    categorySectionContent = <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{["a", "b", "c", "d", "e", "f"].map((key) => <div key={key} className="rounded-ui border border-border bg-surface p-4"><Skeleton className="mx-auto h-14 w-14 rounded-full" /><Skeleton className="mx-auto mt-4 h-4 w-20" /></div>)}</div>;
  } else if (categoriesError) {
    categorySectionContent = <div className="rounded-ui border border-border bg-surface"><ErrorState description={categoriesError} onRetry={() => setCategoryRetry((value) => value + 1)} /></div>;
  } else if (categories.length > 0) {
    categorySectionContent = <div className="relative"><div ref={categoryScrollerRef} className="overflow-x-auto pb-2 scrollbar-none"><div className="grid min-w-max grid-flow-col grid-rows-2 auto-cols-[132px] overflow-hidden rounded-ui border border-border bg-surface sm:auto-cols-[154px]">{categories.map((category) => { const CategoryIcon = getCategoryIcon(category.name, category.slug); const showRemoteIcon = Boolean(category.iconUrl) && !brokenCategoryIconIds.has(category.id); return <Link key={category.id} to={`/products?categoryId=${category.id}`} className="flex h-40 flex-col items-center justify-center border-b border-r border-border px-3 text-center transition-colors hover:bg-primary-soft focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"><span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-canvas text-primary">{showRemoteIcon ? <img src={category.iconUrl} alt={category.name} className="h-9 w-9 object-contain" loading="lazy" referrerPolicy="no-referrer" onError={() => handleCategoryIconError(category.id)} /> : <CategoryIcon className="h-8 w-8" strokeWidth={2} aria-hidden="true" />}</span><h3 className="max-w-[125px] break-words text-sm font-semibold leading-5 text-ink">{category.name}</h3></Link>; })}</div></div>{canScrollCategoriesLeft ? <button type="button" onClick={() => scrollCategories(-1)} aria-label="Xem danh mục trước" className="absolute left-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-ink shadow-ui-md hover:bg-canvas"><ChevronLeft className="h-5 w-5" aria-hidden="true" /></button> : null}{canScrollCategoriesRight ? <button type="button" onClick={() => scrollCategories(1)} aria-label="Xem thêm danh mục" className="absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-ink shadow-ui-md hover:bg-canvas"><ChevronRight className="h-5 w-5" aria-hidden="true" /></button> : null}</div>;
  } else {
    categorySectionContent = <div className="rounded-ui border border-dashed border-border bg-surface"><EmptyState title={t("home.categories")} description={t("home.noCategories")} /></div>;
  }

  return <div className="flex min-h-[100dvh] flex-col bg-canvas text-ink"><CustomerAccountHeader /><main className="flex-1">
    <section className="border-b border-border bg-primary text-white"><div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16"><div><p className="mb-3 text-sm font-semibold text-primary-soft">Shobbe / mua sắm có chọn lọc</p><h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{t("home.heroTitle")}</h1><p className="mt-4 max-w-lg text-base leading-7 text-white/80 sm:text-lg">{t("home.heroSubtitle")}</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link to="/products" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-ui bg-white px-5 text-sm font-semibold text-primary hover:bg-primary-soft">{t("home.shopNow")}<ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></Link><Link to="/register" className="inline-flex min-h-11 items-center justify-center rounded-ui border border-white/60 px-5 text-sm font-semibold text-white hover:bg-white/10">{t("home.registerAccount")}</Link></div></div><div className="relative overflow-hidden rounded-ui border border-white/15 bg-primary-hover"><img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=900&h=620&fit=crop" alt="Shopping" className="h-64 w-full object-cover sm:h-80 lg:h-[22rem]" /></div></div></section>
    <section className="border-b border-border bg-surface"><div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:grid-cols-3 sm:px-6 lg:px-8">{benefits.map((benefit) => { const Icon = benefit.icon; return <article key={benefit.id} className="flex gap-3 rounded-ui bg-canvas p-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-ui bg-primary-soft text-primary"><Icon className="h-5 w-5" aria-hidden="true" /></span><div><h2 className="text-sm font-semibold text-ink">{benefit.title}</h2><p className="mt-1 text-sm leading-5 text-muted">{benefit.description}</p></div></article>; })}</div></section>
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-sm font-semibold text-primary">Khám phá nhanh</p><h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{t("home.categories")}</h2></div><Link to="/products" className="hidden items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover sm:inline-flex">{t("home.viewAll")}<ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></Link></div>{categorySectionContent}</section>
    <section className="border-y border-border bg-surface"><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-sm font-semibold text-primary">Được chọn nhiều</p><h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{t("home.featuredProducts")}</h2></div><Link to="/products" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover">{t("home.viewAll")}<ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></Link></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">{featuredProducts.map((product) => <ProductCard key={product.id} product={product} href={`/products/${product.id}`} density="comfortable" />)}</div></div></section>
    <section className="mx-auto max-w-3xl px-4 py-10 text-center sm:px-6 lg:px-8"><h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{t("home.newsletterTitle")}</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted sm:text-base">{t("home.newsletterSubtitle")}</p><form className="mx-auto mt-6 flex max-w-xl flex-col gap-3 sm:flex-row"><input type="email" placeholder={t("home.newsletterPlaceholder")} aria-label={t("home.newsletterPlaceholder")} className="h-11 min-w-0 flex-1 rounded-ui border border-border bg-surface px-4 text-sm text-ink shadow-ui placeholder:text-muted focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15" /><button type="submit" className="h-11 rounded-ui bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-hover">{t("home.subscribe")}</button></form></section>
  </main><CustomerAccountFooter /></div>;
}

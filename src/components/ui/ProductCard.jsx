import { Heart, PackageOpen, ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Badge from "./Badge";
import Button from "./Button";
import Skeleton from "./Skeleton";
import { cn } from "./cn";

function getImage(product) {
  const image = product?.image || product?.imageUrl || product?.thumbnail || product?.images?.[0];
  return typeof image === "string" ? image : image?.url;
}

function formatPrice(value, currency, locale) {
  if (value === undefined || value === null || value === "") return "Chưa cập nhật";
  try { return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(value)); } catch { return String(value); }
}

export default function ProductCard({ product = {}, href, onAddToCart, onToggleWishlist, wishlisted = false, adding = false, currency = "VND", locale = "vi-VN", formatPrice: formatPriceProp, density = "comfortable", className, loading = false }) {
  if (loading) return <article className={cn("rounded-ui border border-border bg-surface p-3 shadow-ui", className)} aria-busy="true"><Skeleton className="aspect-square w-full" /><div className="space-y-3 p-1 pt-4"><Skeleton className="h-4 w-4/5" /><Skeleton className="h-5 w-2/5" /><Skeleton className="h-9 w-full" /></div></article>;
  const image = getImage(product);
  const productName = product.name || product.title || "Sản phẩm";
  const price = formatPriceProp ? formatPriceProp(product.price, product) : formatPrice(product.price, currency, locale);
  const oldPrice = product.originalPrice || product.compareAtPrice;
  const media = <div className="relative aspect-square overflow-hidden rounded-ui bg-canvas">{image ? <img src={image} alt={product.imageAlt || productName} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center text-muted"><PackageOpen className="h-8 w-8" aria-hidden="true" /></div>}{product.badge ? <Badge variant="danger" className="absolute left-2 top-2">{product.badge}</Badge> : null}</div>;
  return <article data-density={density} className={cn("rounded-ui border border-border bg-surface p-3 shadow-ui transition-shadow hover:shadow-ui-md", className)}>
    {href ? <Link to={href} aria-label={`Xem ${productName}`} className="block rounded-ui focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/15">{media}</Link> : media}
    <div className="flex min-h-32 flex-col p-1 pt-3">
      <div className="flex items-start justify-between gap-2"><h3 className="line-clamp-2 text-sm font-semibold leading-5 text-ink">{href ? <Link to={href} className="rounded-ui hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/15">{productName}</Link> : productName}</h3>{onToggleWishlist ? <button type="button" onClick={() => onToggleWishlist(product)} aria-label={wishlisted ? `Bỏ khỏi yêu thích: ${productName}` : `Thêm vào yêu thích: ${productName}`} aria-pressed={wishlisted} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-ui text-muted hover:bg-primary-soft hover:text-primary"><Heart className={cn("h-4 w-4", wishlisted && "fill-current text-danger")} aria-hidden="true" /></button> : null}</div>
      <div className="mt-auto pt-3"><p className="text-base font-semibold text-primary">{price}</p>{oldPrice ? <p className="mt-0.5 text-xs text-muted line-through">{formatPriceProp ? formatPriceProp(oldPrice, product) : formatPrice(oldPrice, currency, locale)}</p> : null}{product.rating ? <p className="mt-2 flex items-center gap-1 text-xs text-muted"><Star className="h-3.5 w-3.5 fill-warning text-warning" aria-hidden="true" />{product.rating}</p> : null}</div>
      {onAddToCart ? <Button type="button" size="sm" density={density} className="mt-3 w-full" loading={adding} leftIcon={ShoppingCart} onClick={() => onAddToCart(product)}>Thêm vào giỏ</Button> : null}
    </div>
  </article>;
}

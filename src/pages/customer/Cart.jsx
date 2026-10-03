import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import {
  BellIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { getCurrentRole } from "../../utils/authSession";
import { useTranslation } from "react-i18next";
import CustomerAccountHeader from "../../components/customer/CustomerAccountHeader";
import CustomerAccountFooter from "../../components/customer/CustomerAccountFooter";
import { cartService } from "../../services/cartService";
import { getErrorMessage } from "../../utils/errorHandler";
import { useCartItemCount } from "../../hooks/useCartItemCount";

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return "";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDateTime = (value) => {
  if (!value) return "--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
};

const formatVariantAttributes = (attributes) => {
  if (!attributes) {
    return "Mặc định";
  }

  const buildLabel = (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      const fallback = String(value || "").trim();
      return fallback || "Mặc định";
    }

    const entries = Object.entries(value)
      .map(([key, val]) => {
        const safeKey = String(key || "").trim();
        const safeValue =
          val === null || val === undefined ? "" : String(val).trim();
        if (!safeKey || !safeValue) {
          return null;
        }
        return `${safeKey}: ${safeValue}`;
      })
      .filter(Boolean);

    return entries.length > 0 ? entries.join(", ") : "Mặc định";
  };

  if (typeof attributes === "string") {
    try {
      const parsed = JSON.parse(attributes);
      return buildLabel(parsed);
    } catch {
      return buildLabel(attributes);
    }
  }

  return buildLabel(attributes);
};

const FOOTER_SECTIONS = [
  {
    id: "about",
    title: "Giới thiệu",
    links: [
      { label: "Giới thiệu", href: "/" },
      { label: "Tuyển dụng", href: "/" },
      { label: "Blog", href: "/" },
    ],
  },
  {
    id: "support",
    title: "Hỗ trợ",
    links: [
      { label: "Trung tâm trợ giúp", href: "/" },
      { label: "Liên hệ", href: "/" },
      { label: "Khiếu nại", href: "/" },
    ],
  },
  {
    id: "policy",
    title: "Chính sách",
    links: [
      { label: "Điều khoản", href: "/" },
      { label: "Bảo mật", href: "/" },
      { label: "Vận chuyển", href: "/" },
    ],
  },
];

export default function CartPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);
  const [cartItems, setCartItems] = useState([]);
  const [cartResponse, setCartResponse] = useState(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState("");
  const [quantityDrafts, setQuantityDrafts] = useState({});
  const [selectedVariantIds, setSelectedVariantIds] = useState(new Set());
  const isMountedRef = useRef(true);
  const { cartItemCount, setCartItemCount } = useCartItemCount();

  const token = localStorage.getItem("token");
  const role = getCurrentRole();
  const isCustomerLoggedIn =
    Boolean(token) && (role === "CUSTOMER" || role === "USER");

  const notifications = [
    {
      id: 1,
      title: "Đơn hàng #A1023 đã được xác nhận",
      time: "2 phút trước",
    },
    {
      id: 2,
      title: "Bạn có mã giảm giá mới 15%",
      time: "1 giờ trước",
    },
    {
      id: 3,
      title: "Sản phẩm trong wishlist đang giảm giá",
      time: "Hôm qua",
    },
  ];

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const applyCartResponse = (response) => {
    const items = Array.isArray(response?.items) ? response.items : [];
    setCartResponse(response || null);
    setCartItems(items);
    if (items.length === 0) {
      setSelectedVariantIds(new Set());
    }
    setCartItemCount(Number(response?.itemCount) || 0);
  };

  const fetchCartItems = async ({ silent = false } = {}) => {
    const authToken = localStorage.getItem("token");
    if (!authToken) {
      if (isMountedRef.current) {
        setCartItems([]);
        setCartResponse(null);
        setCartItemCount(0);
        if (!silent) {
          setCartLoading(false);
        }
      }
      return null;
    }

    if (!silent) {
      setCartLoading(true);
      setCartError("");
    }

    try {
      const response = await cartService.getCartItems();
      if (!isMountedRef.current) {
        return null;
      }
      applyCartResponse(response);
      return response;
    } catch (error) {
      if (!isMountedRef.current) {
        return null;
      }

      setCartItems([]);
      setCartResponse(null);
      setCartItemCount(0);
      setCartError(getErrorMessage(error, "Không thể tải giỏ hàng."));
      return null;
    } finally {
      if (isMountedRef.current && !silent) {
        setCartLoading(false);
      }
    }
  };

  const getStockLimit = (item) => {
    const limit = Number(
      item?.quantityStock ??
        item?.stockQuantity ??
        item?.variantStock ??
        item?.stock ??
        0,
    );
    return Number.isFinite(limit) && limit > 0 ? limit : null;
  };

  const handleUpdateQuantity = async (item, nextQuantity) => {
    const authToken = localStorage.getItem("token");
    if (!authToken) {
      setCartError("Vui lòng đăng nhập để cập nhật giỏ hàng.");
      return false;
    }

    if (!item?.variantId) {
      setCartError("Không tìm thấy biến thể để cập nhật.");
      return false;
    }

    setCartError("");

    const latestCart = await fetchCartItems({ silent: true });
    if (!latestCart) {
      setCartError("Không thể cập nhật tồn kho mới nhất.");
      return false;
    }

    const latestItems = Array.isArray(latestCart?.items)
      ? latestCart.items
      : [];
    const latestItem =
      latestItems.find(
        (entry) => String(entry?.variantId) === String(item?.variantId),
      ) || item;

    const stockLimit = getStockLimit(latestItem);
    const requestedQuantity = Number(nextQuantity);
    let resolvedQuantity = requestedQuantity;

    if (!Number.isFinite(resolvedQuantity)) {
      setCartError("Số lượng không hợp lệ.");
      return false;
    }

    if (stockLimit && requestedQuantity > stockLimit) {
      const message = `Số lượng tối đa trong kho là ${stockLimit}.`;
      toast.error(message);
      setCartError(message);
      resolvedQuantity = stockLimit;
    }

    try {
      if (resolvedQuantity <= 0) {
        await cartService.removeCartItem({
          variantId: item.variantId,
        });
      } else {
        await cartService.updateCartItem({
          variantId: item.variantId,
          quantity: resolvedQuantity,
        });
      }

      await fetchCartItems();
      return true;
    } catch (error) {
      await fetchCartItems({ silent: true });
      setCartError(
        getErrorMessage(error, "Số lượng sản phẩm không đủ trong kho."),
      );
      return false;
    }
  };

  const handleRemoveItem = async (item) => {
    const authToken = localStorage.getItem("token");
    if (!authToken) {
      setCartError("Vui lòng đăng nhập để cập nhật giỏ hàng.");
      return;
    }

    if (!item?.variantId) {
      setCartError("Không tìm thấy biến thể để xóa.");
      return;
    }

    setCartError("");

    try {
      await cartService.removeCartItem({
        variantId: item.variantId,
      });
      await fetchCartItems();
    } catch (error) {
      setCartError(getErrorMessage(error, "Không thể xóa sản phẩm."));
    }
  };

  const getDraftValue = (item) => {
    const key = item?.variantId || item?.productId;
    const draft = quantityDrafts[key];
    if (draft === undefined) {
      return String(item?.quantity ?? 0);
    }
    return draft;
  };

  const handleDraftChange = (item, value) => {
    const key = item?.variantId || item?.productId;
    setQuantityDrafts((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const commitDraftQuantity = async (item) => {
    const key = item?.variantId || item?.productId;
    const raw = quantityDrafts[key];

    if (raw === undefined) {
      return;
    }

    if (raw === "") {
      setQuantityDrafts((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return;
    }

    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
      setCartError("Số lượng không hợp lệ.");
      setQuantityDrafts((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return;
    }

    const nextQuantity = Math.floor(parsed);
    if (nextQuantity === Number(item?.quantity || 0)) {
      setQuantityDrafts((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return;
    }

    await handleUpdateQuantity(item, nextQuantity);
    setQuantityDrafts((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleToggleItem = (variantId) => {
    setSelectedVariantIds((prev) => {
      const next = new Set(prev);
      if (next.has(variantId)) {
        next.delete(variantId);
      } else {
        next.add(variantId);
      }
      return next;
    });
  };

  const handleToggleAll = () => {
    if (selectedVariantIds.size === cartItems.length && cartItems.length > 0) {
      setSelectedVariantIds(new Set());
    } else {
      setSelectedVariantIds(new Set(cartItems.map((item) => item.variantId)));
    }
  };

  const cartTotals = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => {
        if (!selectedVariantIds.has(item.variantId)) return acc;
        const quantity = Number(item?.quantity) || 0;
        const price = Number(item?.price) || 0;
        const compareAt = Number(item?.compareAtPrice);

        acc.items += quantity;
        acc.subtotal += price * quantity;

        if (Number.isFinite(compareAt) && compareAt > price) {
          acc.compareAt += compareAt * quantity;
        }

        return acc;
      },
      { items: 0, subtotal: 0, compareAt: 0 },
    );
  }, [cartItems, selectedVariantIds]);

  const selectedItems = useMemo(
    () =>
      cartItems.filter((item) => selectedVariantIds.has(item?.variantId ?? "")),
    [cartItems, selectedVariantIds],
  );

  const cartSummary = useMemo(() => {
    const derived = cartItems.reduce(
      (acc, item) => {
        const quantity = Number(item?.quantity) || 0;
        const price = Number(item?.price) || 0;
        acc.itemCount += 1;
        acc.totalQuantity += quantity;
        acc.totalAmount += price * quantity;
        return acc;
      },
      { itemCount: 0, totalQuantity: 0, totalAmount: 0 },
    );

    const itemCount = Number(cartResponse?.itemCount);
    const totalQuantity = Number(cartResponse?.totalQuantity);
    const totalAmount = Number(cartResponse?.totalAmount);

    return {
      itemCount: Number.isFinite(itemCount) ? itemCount : derived.itemCount,
      totalQuantity: Number.isFinite(totalQuantity)
        ? totalQuantity
        : derived.totalQuantity,
      totalAmount: Number.isFinite(totalAmount)
        ? totalAmount
        : derived.totalAmount,
      lastUpdated: cartResponse?.lastUpdated || null,
    };
  }, [cartItems, cartResponse]);

  const isAllSelected =
    cartItems.length > 0 && selectedVariantIds.size === cartItems.length;

  const totalDiscount = Math.max(0, cartTotals.compareAt - cartTotals.subtotal);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const handleCheckout = () => {
    if (cartTotals.items === 0) {
      toast.error("Vui lòng chọn sản phẩm để mua.");
      return;
    }

    navigate("/checkout", {
      state: {
        items: selectedItems,
        voucher: null,
      },
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("permissions");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <CustomerAccountHeader />

      <main className="flex-1 w-full bg-gray-100 dark:bg-gray-900 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {cartLoading ? (
            <div className="bg-white p-6 rounded shadow flex items-center justify-center text-gray-500">
              Đang tải giỏ hàng...
            </div>
          ) : cartError ? (
            <div className="bg-white p-6 rounded shadow text-red-500 text-center">
              {cartError}
            </div>
          ) : cartItems.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
              <div className="max-w-3xl mx-auto text-center">
                <div className="mx-auto mb-5 h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center">
                  <ShoppingCartIcon className="h-10 w-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {t("cart.emptyTitle")}
                </h2>
                <p className="mt-2 text-gray-500">
                  {t("cart.emptySubtitle")}
                </p>
                <Link
                  to="/"
                  className="mt-6 inline-flex items-center rounded-lg bg-red-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
                >
                  {t("cart.continueShopping")}
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Số dòng sản phẩm
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-800">
                    {cartSummary.itemCount}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Tổng số lượng
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-800">
                    {cartSummary.totalQuantity}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Tổng tiền
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-800">
                    {formatCurrency(cartSummary.totalAmount)}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Cập nhật lần cuối
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-800">
                    {formatDateTime(cartSummary.lastUpdated)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="hidden md:grid grid-cols-12 gap-4 bg-white p-4 rounded shadow shadow-gray-200 text-sm text-gray-500 items-center">
                <div className="col-span-5 flex items-center gap-4">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-red-500 rounded cursor-pointer border-gray-300 focus:ring-red-500"
                    checked={isAllSelected}
                    onChange={handleToggleAll}
                  />
                  <span>{t("cart.product")}</span>
                </div>
                <div className="col-span-2 text-center">{t("cart.unitPrice")}</div>
                <div className="col-span-2 text-center">{t("cart.quantity")}</div>
                <div className="col-span-2 text-center">{t("cart.total")}</div>
                <div className="col-span-1 text-center">{t("cart.action")}</div>
              </div>

              {cartItems.map((item) => (
                <div
                  key={item?.variantId || item?.productId}
                  className="bg-white p-4 rounded shadow shadow-gray-200 border border-transparent hover:border-red-100 transition-colors"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="col-span-1 md:col-span-5 flex flex-wrap sm:flex-nowrap items-start sm:items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-red-500 cursor-pointer rounded border-gray-300 focus:ring-red-500 mt-1 sm:mt-0"
                        checked={selectedVariantIds.has(item.variantId)}
                        onChange={() => handleToggleItem(item.variantId)}
                      />
                      <div className="w-20 h-20 flex-shrink-0 bg-gray-50 border border-gray-100 rounded overflow-hidden">
                        {item?.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${item?.productId}`}
                          className="text-sm text-gray-800 hover:text-red-500 line-clamp-2 leading-tight mb-1"
                        >
                          {item?.productName || "Sản phẩm"}
                        </Link>
                        <div className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded inline-flex gap-1 items-center cursor-pointer">
                          Phân loại hàng:{" "}
                          {formatVariantAttributes(item?.variantAttributes)}
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            ></path>
                          </svg>
                        </div>
                        {getStockLimit(item) && (
                          <p className="mt-1 text-xs text-gray-500">
                            Tồn kho: {getStockLimit(item)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="col-span-1 md:col-span-2 text-left md:text-center text-sm font-medium text-gray-600 mt-2 md:mt-0 flex md:block items-center justify-between">
                      <span className="md:hidden">Đơn giá: </span>
                      {item?.compareAtPrice > item.price && (
                        <span className="line-through text-gray-400 mr-2 text-xs">
                          {formatCurrency(item.compareAtPrice)}
                        </span>
                      )}
                      {formatCurrency(item?.price)}
                    </div>
                    <div className="col-span-1 md:col-span-2 flex items-center justify-start md:justify-center mt-2 md:mt-0">
                      <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateQuantity(
                              item,
                              (Number(item?.quantity) || 0) - 1,
                            )
                          }
                          disabled={cartLoading}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 border-r border-gray-300 disabled:opacity-50"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={0}
                          className="w-14 h-8 text-center text-sm font-medium border-0 focus:ring-0 appearance-none p-0 outline-none"
                          value={getDraftValue(item)}
                          onChange={(event) =>
                            handleDraftChange(item, event.target.value)
                          }
                          onBlur={() => commitDraftQuantity(item)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.currentTarget.blur();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateQuantity(
                              item,
                              (Number(item?.quantity) || 0) + 1,
                            )
                          }
                          disabled={cartLoading}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 border-l border-gray-300 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="col-span-1 md:col-span-2 text-left md:text-center text-sm font-bold text-red-500 mt-2 md:mt-0 flex items-center justify-between md:block">
                      <span className="md:hidden text-gray-500 font-normal">
                        Số tiền:{" "}
                      </span>
                      {formatCurrency(
                        (item?.price || 0) * (item?.quantity || 0),
                      )}
                    </div>
                    <div className="col-span-1 text-left md:text-center mt-2 md:mt-0">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item)}
                        disabled={cartLoading}
                        className="text-sm font-medium text-gray-600 hover:text-red-500 px-2 py-1"
                      >
                        Xóa
                      </button>
                      <div className="text-red-500 text-xs font-semibold mt-1 hidden md:block cursor-pointer hover:underline">
                        Tìm sản phẩm <br />
                        tương tự
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-white rounded shadow shadow-gray-200 mt-2 p-4 border border-dashed border-red-200">
                <div className="flex justify-between items-center w-full">
                  <span className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                    <svg
                      className="w-5 h-5 fill-current text-red-500"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path d="M21 11.2V5a1 1 0 00-1-1H4a1 1 0 00-1 1v6.2A1.8 1.8 0 014.8 13 1.8 1.8 0 013 14.8V21a1 1 0 001 1h16a1 1 0 001-1v-6.2A1.8 1.8 0 0119.2 13 1.8 1.8 0 0121 11.2z"></path>
                    </svg>
                    Shobbe Voucher
                  </span>
                  <span className="text-sm font-medium text-blue-600 cursor-pointer hover:underline">
                    Chọn hoặc nhập mã
                  </span>
                </div>
              </div>

              <div className="sticky bottom-0 z-40 bg-white rounded shadow-lg flex flex-col md:flex-row items-center justify-between p-4 border-t-2 border-red-500 mt-4 gap-4">
                <div className="flex items-center justify-between md:justify-start gap-4 md:gap-6 w-full md:w-auto text-sm text-gray-700 font-medium">
                  <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-red-500 rounded cursor-pointer border-gray-300 focus:ring-red-500"
                      checked={isAllSelected}
                      onChange={handleToggleAll}
                    />
                    <span>
                      Chọn tất cả ({cartResponse?.itemCount ?? cartItems.length}
                      )
                    </span>
                  </label>
                  <button
                    type="button"
                    className="hover:text-red-500 hidden sm:block whitespace-nowrap"
                    onClick={() => {}}
                  >
                    Xóa
                  </button>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-700 flex items-center justify-end">
                      Tổng thanh toán ({cartTotals.items} sản phẩm):
                      <span className="text-2xl font-bold text-red-500 ml-3">
                        {formatCurrency(cartTotals.subtotal)}
                      </span>
                    </div>
                    {totalDiscount > 0 && (
                      <div className="text-xs text-gray-500">
                        Tiết kiệm {formatCurrency(totalDiscount)}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={cartLoading || cartTotals.items === 0}
                    onClick={handleCheckout}
                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    {t("cart.proceedToCheckout")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <CustomerAccountFooter />
    </div>
  );
}

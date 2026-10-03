import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ClockIcon,
  PencilSquareIcon,
  XMarkIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { orderService } from "../../services/orderService";

const statusOptions = [
  "Chờ xác nhận",
  "Đã xác nhận",
  "Đang xử lý",
  "Đã giao cho vận chuyển",
  "Đã giao hàng thành công",
  "Đã hủy",
  "Trả hàng/hoàn tiền",
];

const statusStyles = {
  "Chờ xác nhận": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Đã xác nhận": "bg-blue-50 text-blue-700 border-blue-200",
  "Đang xử lý": "bg-orange-50 text-orange-700 border-orange-200",
  "Đã giao cho vận chuyển": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Đã giao hàng thành công": "bg-green-50 text-green-700 border-green-200",
  "Đã hủy": "bg-red-50 text-red-700 border-red-200",
  "Trả hàng/hoàn tiền": "bg-purple-50 text-purple-700 border-purple-200",
};

const statusTextStyles = {
  "Chờ xác nhận": "text-yellow-600",
  "Đã xác nhận": "text-blue-600",
  "Đang xử lý": "text-orange-600",
  "Đã giao cho vận chuyển": "text-indigo-600",
  "Đã giao hàng thành công": "text-green-600",
  "Đã hủy": "text-red-600",
  "Trả hàng/hoàn tiền": "text-purple-600",
};

const paymentMethodByStatus = {
  PENDING: "COD",
  PAID: "VNPAY",
  FAILED: "Thanh toán lỗi",
  REFUNDED: "Hoàn tiền",
};

const statusLabelByCode = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đã giao cho vận chuyển",
  DELIVERED: "Đã giao hàng thành công",
  CANCELLED: "Đã hủy",
  RETURNED: "Trả hàng/hoàn tiền",
};

const statusCodeByLabel = {
  "Chờ xác nhận": "PENDING",
  "Đã xác nhận": "CONFIRMED",
  "Đang xử lý": "PROCESSING",
  "Đã giao cho vận chuyển": "SHIPPED",
  "Đã giao hàng thành công": "DELIVERED",
  "Đã hủy": "CANCELLED",
  "Trả hàng/hoàn tiền": "RETURNED",
};

const formatDateTime = (value) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleString("vi-VN");
};

const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const normalizeShippingAddress = (value) => {
  let parsed = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      parsed = value;
    }
  }

  if (!parsed || typeof parsed !== "object") {
    return {
      name: "",
      phone: "",
      line: String(parsed || ""),
    };
  }

  const parts = [
    parsed.addressLine || parsed.street || parsed.detail,
    parsed.ward,
    parsed.district,
    parsed.province || parsed.city,
    parsed.country,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    name: parsed.fullName || parsed.full_name || "",
    phone: parsed.phone || "",
    line: parts || "",
  };
};

const createHistoryId = (orderId) =>
  `${orderId}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const mapOrderToRow = (order) => {
  const orderCode = order.orderCode || `DH${order.id}`;
  const history = (order.histories || []).map((entry, index) => ({
    id: `${orderCode}-H${index + 1}`,
    time: formatDateTime(entry.createdAt || order.createdAt),
    by: entry.createdBy ? "Admin" : "System",
    action: `Cập nhật trạng thái -> ${
      statusLabelByCode[entry.status] || "Đang xử lý"
    }`,
    note: entry.note || "",
  }));

  if (history.length === 0) {
    history.push({
      id: `${orderCode}-H0`,
      time: formatDateTime(order.createdAt),
      by: "System",
      action: "Tạo đơn hàng",
      note: "",
    });
  }

  const updatedAt = history[history.length - 1]?.time || "";

  const shipping = normalizeShippingAddress(order.shippingAddress);

  return {
    orderId: order.id,
    id: orderCode,
    customerName: order.customerName || shipping.name || "Khách hàng",
    phone: shipping.phone || "Chưa cập nhật",
    address: shipping.line || "Chưa cập nhật",
    paymentMethod: paymentMethodByStatus[order.paymentStatus] || "COD",
    status: statusLabelByCode[order.status] || "Đang xử lý",
    total: Number(order.finalAmount ?? order.totalAmount ?? 0),
    discountAmount: order.discountAmount || 0,
    shippingFee: order.shippingFee || 0,
    updatedAt,
    note: order.note || "",
    items: (order.items || []).map((item, index) => ({
      id: item.sku || item.variantId || item.productId || index,
      name: item.productName || "Sản phẩm",
      quantity: item.quantity || 1,
      price: item.unitPrice || 0,
      variantAttributes: item.variantAttributes,
      subtotal: item.subTotal || 0,
    })),
    history,
  };
};

export default function OrderManagement() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [statusDrafts, setStatusDrafts] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [historyTarget, setHistoryTarget] = useState(null);
  const [noteTarget, setNoteTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      try {
        const data = await orderService.getAllOrders({ page, size });
        if (!isMounted) {
          return;
        }
        const content = Array.isArray(data?.content) ? data.content : [];
        setOrders(content.map(mapOrderToRow));
        setTotalPages(data?.totalPages || 0);
        setTotalElements(data?.totalElements || 0);
      } catch (error) {
        if (isMounted) {
          setOrders([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, [page, size]);

  useEffect(() => {
    setStatusDrafts((prev) => {
      const next = { ...prev };
      orders.forEach((order) => {
        if (!next[order.id]) {
          next[order.id] = order.status;
        }
      });
      return next;
    });
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "Tất cả" || order.status === statusFilter;
      if (!matchesStatus) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      const searchable = [
        order.id,
        order.customerName,
        order.phone,
        order.items.map((item) => item.name).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return searchable.includes(keyword);
    });
  }, [orders, search, statusFilter]);

  const totalSummary = useMemo(() => {
    return statusOptions.reduce((acc, status) => {
      acc[status] = orders.filter((order) => order.status === status).length;
      return acc;
    }, {});
  }, [orders]);

  const handleUpdateStatus = async (order) => {
    const nextStatus = statusDrafts[order.id];
    if (!nextStatus || order.status === nextStatus) {
      return;
    }

    try {
      await orderService.updateOrderStatus(
        order.orderId,
        statusCodeByLabel[nextStatus] || "PROCESSING",
        "",
      );
    } catch (error) {
      return;
    }

    const time = new Date().toLocaleString("vi-VN");
    setOrders((prev) =>
      prev.map((item) => {
        if (item.id !== order.id) {
          return item;
        }

        return {
          ...item,
          status: nextStatus,
          updatedAt: time,
          history: [
            ...item.history,
            {
              id: createHistoryId(item.id),
              time,
              by: "Admin",
              action: `Cập nhật trạng thái -> ${nextStatus}`,
              note: "",
            },
          ],
        };
      }),
    );
  };

  const openNoteEditor = (order) => {
    setNoteTarget(order);
    setNoteDraft(order.note || "");
  };

  const saveNote = async () => {
    if (!noteTarget) {
      return;
    }

    try {
      await orderService.updateOrderStatus(
        noteTarget.orderId,
        statusCodeByLabel[noteTarget.status] || "PROCESSING",
        noteDraft.trim(),
      );
    } catch (error) {
      return;
    }

    const time = new Date().toLocaleString("vi-VN");
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== noteTarget.id) {
          return order;
        }

        return {
          ...order,
          note: noteDraft.trim(),
          updatedAt: time,
          history: [
            ...order.history,
            {
              id: createHistoryId(order.id),
              time,
              by: "Admin",
              action: "Cập nhật ghi chú",
              note: noteDraft.trim(),
            },
          ],
        };
      }),
    );

    setNoteTarget(null);
    setNoteDraft("");
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("admin.manageOrders")}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {t("admin.orderTracking")}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statusOptions.map((status) => (
          <div
            key={status}
            className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md ${
              statusStyles[status] || ""
            }`}
          >
            <p className="text-sm font-medium">{status}</p>
            <p className="mt-2 text-3xl font-bold">
              {totalSummary[status] || 0}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("admin.searchOrderPlaceholder")}
              className="w-full bg-transparent text-sm text-gray-700 outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="Tất cả">{t("admin.allStatus")}</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">{t("admin.orderCode")}</th>
                <th className="px-4 py-3 text-left font-semibold">
                  {t("admin.customer")}
                </th>
                <th className="px-4 py-3 text-left font-semibold">{t("admin.totalAmount")}</th>
                <th className="px-4 py-3 text-left font-semibold">
                  {t("admin.status")}
                </th>
                <th className="px-4 py-3 text-left font-semibold">
                  {t("admin.updatedAt")}
                </th>
                <th className="px-4 py-3 text-left font-semibold">{t("admin.notes")}</th>
                <th className="px-4 py-3 text-left font-semibold">{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="text-gray-700">
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {order.id}
                    <p className="mt-1 text-xs text-gray-500">
                      {order.items.length} {t("cart.items")}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-gray-500">{order.phone}</p>
                    <p className="text-xs text-gray-500">{order.address}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">
                      {formatPrice(order.total)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.paymentMethod}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${
                        statusStyles[order.status] ||
                        "bg-gray-50 text-gray-600 border-gray-200"
                      }`}
                    >
                      {order.status}
                    </span>
                    <div className="mt-2">
                      <select
                        value={statusDrafts[order.id] || order.status}
                        onChange={(event) =>
                          setStatusDrafts((prev) => ({
                            ...prev,
                            [order.id]: event.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-200 px-2 py-1 text-xs"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {order.updatedAt}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {order.note ? order.note : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(order)}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                        {t("admin.save")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDetailTarget(order)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700"
                      >
                        <EyeIcon className="h-4 w-4" />
                        {t("admin.viewDetails")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setHistoryTarget(order)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700"
                      >
                        <ClockIcon className="h-4 w-4" />
                        Lịch sử
                      </button>
                      <button
                        type="button"
                        onClick={() => openNoteEditor(order)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700"
                      >
                        {t("admin.notes")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-gray-500"
                  >
                    {t("admin.noData")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-gray-200 p-4">
          <p className="text-sm text-gray-500">
            {t("admin.page")} <span className="font-medium">{page + 1}</span> / <span className="font-medium">{totalPages || 1}</span> ({totalElements} {t("admin.items")})
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              &larr;
            </button>
            <span className="text-sm text-gray-600">{t("admin.page")} {page + 1} / {totalPages || 1}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              &rarr;
            </button>
          </div>
        </div>
      </div>

      {historyTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-5">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <h3 className="text-lg font-semibold">
                  Lịch sử đơn {historyTarget.id}
                </h3>
                <p className="text-xs text-gray-500">
                  {historyTarget.customerName} ·{" "}
                  {formatPrice(historyTarget.total)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryTarget(null)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {historyTarget.history.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-lg border border-gray-200 p-3 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900">
                      {entry.action}
                    </p>
                    <span className="text-xs text-gray-500">{entry.time}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Xử lý bởi: {entry.by}
                  </p>
                  {entry.note ? (
                    <p className="mt-2 text-xs text-gray-600">{entry.note}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {noteTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="text-lg font-semibold">{t("admin.notes")}</h3>
              <button
                type="button"
                onClick={() => setNoteTarget(null)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              {noteTarget.id} · {noteTarget.customerName}
            </p>
            <textarea
              rows={4}
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              placeholder={t("admin.notes")}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setNoteTarget(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700"
              >
                {t("admin.cancel")}
              </button>
              <button
                type="button"
                onClick={saveNote}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white"
              >
                {t("admin.save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {detailTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-xl bg-white p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <h3 className="text-lg font-semibold">
                  {t("admin.viewDetails")} · {detailTarget.id}
                </h3>
                <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold mt-1 ${statusStyles[detailTarget.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                  {detailTarget.status}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDetailTarget(null)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-4">
                 <h4 className="font-semibold text-gray-900 mb-2">{t("admin.customer")}</h4>
                 <p className="text-sm text-gray-600"><span className="font-medium text-gray-900">{t("account.fullName")}:</span> {detailTarget.customerName}</p>
                 <p className="text-sm text-gray-600"><span className="font-medium text-gray-900">{t("account.phone")}:</span> {detailTarget.phone}</p>
                 <p className="text-sm text-gray-600"><span className="font-medium text-gray-900">{t("account.address")}:</span> {detailTarget.address}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                 <h4 className="font-semibold text-gray-900 mb-2">{t("checkout.orderSummary")}</h4>
                 <p className="text-sm text-gray-600"><span className="font-medium text-gray-900">{t("checkout.paymentMethod")}:</span> {detailTarget.paymentMethod}</p>
                 <p className="text-sm text-gray-600"><span className="font-medium text-gray-900">{t("cart.subtotal")}:</span> {formatPrice(detailTarget.total - (detailTarget.shippingFee||0) + (detailTarget.discountAmount||0))}</p>
                 <p className="text-sm text-gray-600"><span className="font-medium text-gray-900">{t("checkout.shippingFee")}:</span> {formatPrice(detailTarget.shippingFee)}</p>
                 <p className="text-sm text-gray-600"><span className="font-medium text-gray-900">{t("cart.discount")}:</span> -{formatPrice(detailTarget.discountAmount)}</p>
                 <p className="text-sm text-gray-600 mt-1 pt-1 border-t"><span className="font-bold text-gray-900">{t("cart.finalTotal")}:</span> <span className="font-bold text-orange-600">{formatPrice(detailTarget.total)}</span></p>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold text-gray-900 mb-2">{t("checkout.selectedItems")} ({detailTarget.items.length})</h4>
              <div className="space-y-3">
                {detailTarget.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center rounded-lg border border-gray-200 p-3 bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.variantAttributes && Object.keys(item.variantAttributes).length > 0 ? Object.values(item.variantAttributes).join(" - ") : "-"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatPrice(item.price || (item.subtotal / item.quantity))}</p>
                      <p className="text-xs text-gray-500">x{item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

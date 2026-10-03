import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CustomerAccountHeader from "../../components/customer/CustomerAccountHeader";
import CustomerAccountFooter from "../../components/customer/CustomerAccountFooter";
import { useTranslation } from "react-i18next";
import { orderService } from "../../services/orderService";
import { userService } from "../../services/userService";
import { getErrorMessage } from "../../utils/errorHandler";

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") {
    return "--";
  }

  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return "--";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
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

const normalizeAddress = (item, index) => {
  const rawServerId = item?.id ?? item?.addressId ?? item?.address_id;
  const parsedServerId = Number.parseInt(rawServerId, 10);
  const serverId = Number.isInteger(parsedServerId) ? parsedServerId : null;

  return {
    id: serverId || `address-${index}-${item?.phone || "unknown"}`,
    serverId,
    fullName: item?.fullName || "",
    phone: item?.phone || "",
    addressLine: item?.addressLine || item?.detail || "",
    ward: item?.ward || "",
    district: item?.district || "",
    province: item?.province || "",
    country: item?.country || "Việt Nam",
    isDefault: Boolean(item?.isDefault ?? item?.default),
  };
};

const EMPTY_ADDRESS_FORM = {
  fullName: "",
  phone: "",
  addressLine: "",
  ward: "",
  district: "",
  province: "",
  country: "Việt Nam",
  isDefault: false,
};

export default function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS_FORM);
  const [savingAddress, setSavingAddress] = useState(false);
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [placingOrder, setPlacingOrder] = useState(false);

  const state = location.state || {};
  const items = Array.isArray(state?.items) ? state.items : [];
  const voucher = state?.voucher || null;

  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const quantity = Number(item?.quantity) || 0;
        const price = Number(item?.price) || 0;
        acc.quantity += quantity;
        acc.subtotal += quantity * price;
        return acc;
      },
      { quantity: 0, subtotal: 0 },
    );
  }, [items]);

  const loadAddresses = async ({ silent = false } = {}) => {
    if (!silent) {
      setLoadingAddresses(true);
    }

    try {
      const response = await userService.getAddresses();
      const normalized = response.map((item, index) =>
        normalizeAddress(item, index),
      );
      setAddresses(normalized);
      setSelectedAddressId((prev) => {
        if (prev && normalized.some((item) => item.id === prev)) {
          return prev;
        }
        const defaultAddress = normalized.find((item) => item.isDefault);
        return defaultAddress?.id || normalized[0]?.id || null;
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể tải danh sách địa chỉ."));
      setAddresses([]);
    } finally {
      if (!silent) {
        setLoadingAddresses(false);
      }
    }
  };

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    loadAddresses();
  }, [items.length]);

  const handleAddressFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetAddressForm = () => {
    setAddressForm(EMPTY_ADDRESS_FORM);
    setIsAddressFormOpen(false);
  };

  const openAddressForm = () => {
    setAddressForm({
      ...EMPTY_ADDRESS_FORM,
      isDefault: addresses.length === 0,
    });
    setIsAddressFormOpen(true);
  };

  const validateAddressForm = () => {
    if (!addressForm.fullName.trim()) {
      toast.error("Vui lòng nhập họ và tên người nhận.");
      return false;
    }

    if (!addressForm.phone.trim()) {
      toast.error("Vui lòng nhập số điện thoại.");
      return false;
    }

    if (!addressForm.addressLine.trim()) {
      toast.error("Vui lòng nhập địa chỉ cụ thể.");
      return false;
    }

    if (
      !addressForm.ward.trim() ||
      !addressForm.district.trim() ||
      !addressForm.province.trim()
    ) {
      toast.error(
        "Vui lòng nhập đầy đủ Phường/Xã, Quận/Huyện và Tỉnh/Thành phố.",
      );
      return false;
    }

    return true;
  };

  const handleAddAddress = async (event) => {
    event.preventDefault();
    if (!validateAddressForm()) {
      return;
    }

    setSavingAddress(true);
    const payload = {
      fullName: addressForm.fullName.trim(),
      phone: addressForm.phone.trim(),
      addressLine: addressForm.addressLine.trim(),
      ward: addressForm.ward.trim(),
      district: addressForm.district.trim(),
      province: addressForm.province.trim(),
      country: addressForm.country.trim() || "Việt Nam",
      default: Boolean(addressForm.isDefault),
    };

    try {
      await userService.addAddress(payload);
      toast.success("Thêm địa chỉ mới thành công.");
      await loadAddresses({ silent: true });
      resetAddressForm();
    } catch (error) {
      toast.error(getErrorMessage(error, "Lưu địa chỉ thất bại."));
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (placingOrder) {
      return;
    }

    if (items.length === 0) {
      toast.error("Vui lòng chọn sản phẩm để thanh toán.");
      return;
    }

    const selectedAddress = addresses.find(
      (address) => address.id === selectedAddressId,
    );

    if (!selectedAddress?.serverId) {
      toast.error("Vui lòng chọn địa chỉ hợp lệ.");
      return;
    }

    const selectedItems = items
      .map((item) => ({
        variantId: item?.variantId,
        quantity: Number(item?.quantity) || 0,
      }))
      .filter((item) => item.variantId && item.quantity > 0);

    if (selectedItems.length === 0) {
      toast.error("Không có sản phẩm hợp lệ để đặt hàng.");
      return;
    }

    const payload = {
      selectedItems,
      addressId: selectedAddress.serverId,
      note: note.trim() || null,
      couponCode: voucher?.code || null,
      paymentMethod,
    };

    try {
      setPlacingOrder(true);
      await orderService.createOrder(payload);
      toast.success("Đặt hàng thành công.");
      navigate("/account/orders", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể tạo đơn hàng."));
    } finally {
      setPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerAccountHeader position="sticky" maxWidthClass="max-w-7xl" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {t("checkout.noItemsTitle")}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {t("checkout.noItemsSubtitle")}
            </p>
            <Link
              to="/cart"
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
            >
              {t("checkout.backToCart")}
            </Link>
          </div>
        </div>
        <CustomerAccountFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerAccountHeader position="sticky" maxWidthClass="max-w-7xl" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-gray-900">{t("checkout.title")}</h1>
          <Link
            to="/cart"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            {t("checkout.backToCart")}
          </Link>
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <section className="flex-1 space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-gray-900">
                {t("checkout.selectedItems")}
              </h2>
              <div className="mt-4 space-y-3">
                {items.map((item) => (
                  <div
                    key={item?.variantId || item?.productId}
                    className="flex flex-col sm:flex-row gap-3 border border-gray-100 rounded-xl p-3"
                  >
                    <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                      {item?.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item?.productName || "san-pham"}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {item?.productName || "Sản phẩm"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Phân loại:{" "}
                        {formatVariantAttributes(item?.variantAttributes)}
                      </p>
                      <p className="mt-2 text-sm text-gray-700">
                        {formatCurrency(item?.price)} x {item?.quantity || 0}
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-red-500">
                      {formatCurrency(
                        (Number(item?.price) || 0) *
                          (Number(item?.quantity) || 0),
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Ghi chú cho người bán
              </h2>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={4}
                className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="Nhập ghi chú (nếu có)"
              />
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Địa chỉ nhận hàng
                </h2>
                <button
                  type="button"
                  onClick={openAddressForm}
                  className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                >
                  + Thêm địa chỉ
                </button>
              </div>

              {isAddressFormOpen && (
                <form
                  onSubmit={handleAddAddress}
                  className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <input
                      name="fullName"
                      value={addressForm.fullName}
                      onChange={handleAddressFormChange}
                      placeholder="Họ và tên người nhận"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                    />
                    <input
                      name="phone"
                      value={addressForm.phone}
                      onChange={handleAddressFormChange}
                      placeholder="Số điện thoại"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                    />
                    <input
                      name="province"
                      value={addressForm.province}
                      onChange={handleAddressFormChange}
                      placeholder="Tỉnh/Thành phố"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                    />
                    <input
                      name="district"
                      value={addressForm.district}
                      onChange={handleAddressFormChange}
                      placeholder="Quận/Huyện"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                    />
                    <input
                      name="ward"
                      value={addressForm.ward}
                      onChange={handleAddressFormChange}
                      placeholder="Phường/Xã"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                    />
                    <input
                      name="country"
                      value={addressForm.country}
                      onChange={handleAddressFormChange}
                      placeholder="Quốc gia"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                    />
                  </div>

                  <input
                    name="addressLine"
                    value={addressForm.addressLine}
                    onChange={handleAddressFormChange}
                    placeholder="Số nhà, tên đường"
                    className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                  />

                  <label className="mt-3 inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={addressForm.isDefault}
                      onChange={handleAddressFormChange}
                      className="h-4 w-4 rounded border-gray-300 text-red-600"
                    />
                    <span>Đặt làm địa chỉ mặc định</span>
                  </label>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="inline-flex items-center justify-center rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingAddress ? "Đang lưu..." : "Lưu địa chỉ"}
                    </button>
                    <button
                      type="button"
                      onClick={resetAddressForm}
                      className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              )}
              {loadingAddresses ? (
                <p className="mt-3 text-sm text-gray-500">
                  Đang tải danh sách địa chỉ...
                </p>
              ) : addresses.length === 0 ? (
                <div className="mt-3 rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-600">
                  Bạn chưa có địa chỉ. Vui lòng thêm địa chỉ trong hồ sơ.
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${
                        selectedAddressId === address.id
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="checkout-address"
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                        className="mt-1 h-4 w-4 text-red-600"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {address.fullName} - {address.phone}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          {address.addressLine}, {address.ward},{" "}
                          {address.district}, {address.province},{" "}
                          {address.country}
                        </p>
                        {address.isDefault && (
                          <span className="mt-2 inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                            Mặc định
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="w-full lg:w-[360px] space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Tóm tắt đơn hàng
              </h2>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Số lượng sản phẩm</span>
                  <span className="font-semibold text-gray-900">
                    {totals.quantity}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(totals.subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Voucher đã áp dụng</span>
                  <span className="font-semibold text-gray-900">
                    {voucher?.code || "Chưa áp dụng"}
                  </span>
                </div>
              </div>
              <div className="mt-4 border-t border-gray-200 pt-4 flex items-center justify-between">
                <span className="text-base font-semibold text-gray-900">
                  {t("cart.finalTotal")}
                </span>
                <span className="text-lg font-bold text-red-500">
                  {formatCurrency(totals.subtotal)}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-gray-900">
                {t("checkout.paymentMethod")}
              </h2>
              <div className="mt-4 space-y-3">
                <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 cursor-pointer">
                  <input
                    type="radio"
                    name="payment-method"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="h-4 w-4 text-red-600"
                  />
                  <span className="text-sm text-gray-700">
                    {t("checkout.cod")}
                  </span>
                </label>
                <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 cursor-pointer">
                  <input
                    type="radio"
                    name="payment-method"
                    value="BANK"
                    checked={paymentMethod === "BANK"}
                    onChange={() => setPaymentMethod("BANK")}
                    className="h-4 w-4 text-red-600"
                  />
                  <span className="text-sm text-gray-700">
                    {t("checkout.bankTransfer")}
                  </span>
                </label>
              </div>
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={placingOrder || loadingAddresses}
                className="mt-5 w-full rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
              >
                {placingOrder ? t("checkout.placingOrder") : t("checkout.placeOrder")}
              </button>
            </div>
          </aside>
        </div>
      </main>
      <CustomerAccountFooter />
    </div>
  );
}

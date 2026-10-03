import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  CheckCircleIcon,
  MapPinIcon,
  PlusIcon,
  ShoppingBagIcon,
  TruckIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { userService } from "../../services/userService";
import { getErrorMessage } from "../../utils/errorHandler";

const STEPS = [
  { id: 1, name: "Thông tin Shop", key: "shopInfo" },
  { id: 2, name: "Cài đặt vận chuyển", key: "shipping" },
  { id: 3, name: "Thông tin thuế", key: "tax" },
  { id: 4, name: "Hoàn tất", key: "completed" },
];

const DEFAULT_SHIPPING_CHANNELS = [
  {
    id: "express",
    name: "Hỏa Tốc (Shobbe Instant)",
    desc: "Giao hàng siêu tốc trong 2 giờ nội thành",
    enabled: true,
  },
  {
    id: "standard",
    name: "Nhanh (Shobbe Express / GHN / GHTK)",
    desc: "Giao hàng tiêu chuẩn 1 - 3 ngày toàn quốc",
    enabled: true,
  },
  {
    id: "economy",
    name: "Tiết Kiệm (Shobbe Economy)",
    desc: "Giao hàng cồng kềnh, tối ưu chi phí 3 - 5 ngày",
    enabled: false,
  },
];

const formatAddressDisplay = (addr) => {
  if (!addr) return "";
  const namePhone =
    addr.fullName && addr.phone
      ? `${addr.fullName} (${addr.phone})`
      : addr.fullName || addr.phone || "";
  const locationParts = [
    addr.addressDetail || addr.addressLine,
    addr.ward,
    addr.district,
    addr.province,
  ]
    .filter(Boolean)
    .join(", ");
  return namePhone && locationParts
    ? `${namePhone} - ${locationParts}`
    : namePhone || locationParts || "";
};

const normalizeAddressItem = (item, index) => {
  const id = item?.id || item?.addressId || item?.address_id || `addr_${index}`;
  const fullName =
    item?.fullName || item?.recipentName || item?.receiverName || "";
  const phone = item?.phone || item?.receiverPhone || "";
  const addressDetail =
    item?.addressDetail || item?.addressLine || item?.street || item?.detailAddress || "";
  const ward = item?.ward || "";
  const district = item?.district || "";
  const province = item?.province || item?.city || "";
  const isDefault = Boolean(item?.isDefault ?? item?.default);

  const formatted = formatAddressDisplay({
    fullName,
    phone,
    addressDetail,
    ward,
    district,
    province,
  });

  return {
    id,
    fullName,
    recipentName: fullName,
    phone,
    addressDetail,
    addressLine: addressDetail,
    ward,
    district,
    province,
    isDefault,
    formatted: formatted || addressDetail || "Địa chỉ chưa cập nhật",
  };
};

export default function SellerRegister() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [savingNewAddress, setSavingNewAddress] = useState(false);

  // Form state matching database schema
  const [formData, setFormData] = useState({
    shopName: "rh18s9z800",
    email: "",
    phone: "",
    pickupAddress: {
      fullName: "",
      phone: "",
      province: "",
      district: "",
      ward: "",
      addressDetail: "",
    },
    pickupAddressFormatted: "",
    shippingChannels: DEFAULT_SHIPPING_CHANNELS,
    enableCod: true,
    taxCode: "",
    businessType: "individual",
    taxAddress: "",
    invoiceEmail: "",
  });

  const [newAddressInput, setNewAddressInput] = useState({
    fullName: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    addressDetail: "",
    isDefault: true,
  });

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/seller/login", { replace: true });
      return;
    }

    const fetchUserData = async () => {
      let currentUser = null;
      try {
        const user = await userService.getUserProfile();
        if (isMounted && user) {
          currentUser = user;
          setProfile(user);
          setFormData((prev) => ({
            ...prev,
            shopName: prev.shopName || user.username || `shop_${user.id || "1"}`,
            email: user.email || prev.email,
            phone: user.phone || prev.phone,
            invoiceEmail: user.email || prev.invoiceEmail,
          }));
        }
      } catch {
        // Fallback
      }

      try {
        const addrList = await userService.getAddresses();
        if (isMounted && Array.isArray(addrList) && addrList.length > 0) {
          const normalized = addrList.map(normalizeAddressItem);
          setAddresses(normalized);
          const defaultAddr = normalized.find((a) => a.isDefault) || normalized[0];
          if (defaultAddr) {
            setFormData((prev) => ({
              ...prev,
              pickupAddress: {
                fullName: defaultAddr.fullName,
                phone: defaultAddr.phone,
                province: defaultAddr.province,
                district: defaultAddr.district,
                ward: defaultAddr.ward,
                addressDetail: defaultAddr.addressDetail,
              },
              pickupAddressFormatted: defaultAddr.formatted,
            }));
          }
        } else if (currentUser) {
          setNewAddressInput((prev) => ({
            ...prev,
            fullName: currentUser.fullName || currentUser.username || "",
            phone: currentUser.phone || "",
          }));
        }
      } catch {
        // Fallback
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "shopName" && value.length > 30) {
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleShipping = (channelId) => {
    setFormData((prev) => ({
      ...prev,
      shippingChannels: prev.shippingChannels.map((ch) =>
        ch.id === channelId ? { ...ch, enabled: !ch.enabled } : ch,
      ),
    }));
  };

  const handleNext = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (currentStep === 1) {
      if (!formData.shopName.trim()) {
        toast.error("Vui lòng nhập Tên Shop");
        return;
      }
      if (
        !formData.pickupAddress.province ||
        !formData.pickupAddress.district ||
        !formData.pickupAddress.ward ||
        !formData.pickupAddress.addressDetail
      ) {
        toast.error("Vui lòng chọn hoặc thêm Địa chỉ lấy hàng đầy đủ");
        return;
      }
    }

    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem("seller_registration_draft", JSON.stringify(formData));
    toast.success("Đã lưu bản nháp thông tin đăng ký Người bán!");
  };

  const handleSelectExistingAddress = (addr) => {
    setFormData((prev) => ({
      ...prev,
      pickupAddress: {
        fullName: addr.fullName,
        phone: addr.phone,
        province: addr.province,
        district: addr.district,
        ward: addr.ward,
        addressDetail: addr.addressDetail,
      },
      pickupAddressFormatted: addr.formatted,
    }));
    setShowAddressModal(false);
    toast.success("Đã chọn địa chỉ lấy hàng!");
  };

  const handleAddAddress = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!newAddressInput.fullName.trim()) {
      toast.error("Vui lòng nhập họ và tên người liên hệ lấy hàng");
      return;
    }
    if (!newAddressInput.phone.trim()) {
      toast.error("Vui lòng nhập số điện thoại liên hệ");
      return;
    }
    if (!newAddressInput.province.trim()) {
      toast.error("Vui lòng nhập Tỉnh / Thành phố");
      return;
    }
    if (!newAddressInput.district.trim()) {
      toast.error("Vui lòng nhập Quận / Huyện");
      return;
    }
    if (!newAddressInput.ward.trim()) {
      toast.error("Vui lòng nhập Phường / Xã");
      return;
    }
    if (!newAddressInput.addressDetail.trim()) {
      toast.error("Vui lòng nhập địa chỉ cụ thể (Số nhà, tên đường)");
      return;
    }

    setSavingNewAddress(true);
    try {
      const payload = {
        recipentName: newAddressInput.fullName.trim(),
        fullName: newAddressInput.fullName.trim(),
        phone: newAddressInput.phone.trim(),
        addressDetail: newAddressInput.addressDetail.trim(),
        addressLine: newAddressInput.addressDetail.trim(),
        ward: newAddressInput.ward.trim(),
        district: newAddressInput.district.trim(),
        province: newAddressInput.province.trim(),
        isDefault: Boolean(newAddressInput.isDefault),
      };

      await userService.addAddress(payload);
      toast.success("Đã lưu địa chỉ mới vào hệ thống!");

      const formatted = formatAddressDisplay(payload);
      setFormData((prev) => ({
        ...prev,
        pickupAddress: {
          fullName: payload.fullName,
          phone: payload.phone,
          province: payload.province,
          district: payload.district,
          ward: payload.ward,
          addressDetail: payload.addressDetail,
        },
        pickupAddressFormatted: formatted,
      }));

      // Reload address list from BE
      const refreshedList = await userService.getAddresses();
      if (Array.isArray(refreshedList)) {
        setAddresses(refreshedList.map(normalizeAddressItem));
      }

      setShowAddressModal(false);
      setNewAddressInput({
        fullName: profile?.fullName || profile?.username || "",
        phone: profile?.phone || "",
        province: "",
        district: "",
        ward: "",
        addressDetail: "",
        isDefault: true,
      });
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể lưu địa chỉ vào cơ sở dữ liệu"));
    } finally {
      setSavingNewAddress(false);
    }
  };

  const displayUsername =
    profile?.username ||
    profile?.fullName ||
    localStorage.getItem("username") ||
    "Người bán";

  return (
    <div className="min-h-screen bg-gray-50/70 dark:bg-gray-950 text-gray-800 dark:text-gray-100 flex flex-col">
      {/* Seller Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2.5 group"
              aria-label="Về trang chủ"
            >
              <div className="rounded-xl bg-blue-50 dark:bg-blue-900/30 p-1.5 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform duration-200">
                <ShoppingBagIcon className="h-6 w-6" />
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent tracking-tight">
                Shobbe
              </span>
            </Link>

            <span className="text-gray-300 dark:text-gray-700 text-xl font-light">
              |
            </span>

            <h1 className="text-base sm:text-xl font-bold text-gray-800 dark:text-gray-100">
              Đăng ký trở thành Người bán Shobbe
            </h1>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
            <UserCircleIcon className="h-5 w-5 text-gray-400" />
            <span className="font-semibold">{displayUsername}</span>
          </div>
        </div>
      </header>

      {/* Main Registration Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          {/* Progress Stepper Bar */}
          <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between relative max-w-2xl mx-auto">
              {/* Connecting line behind steps */}
              <div className="absolute left-6 right-6 top-4 h-0.5 bg-gray-200 dark:bg-gray-700 -z-0" />
              <div
                className="absolute left-6 top-4 h-0.5 bg-blue-600 transition-all duration-300 -z-0"
                style={{
                  width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
                }}
              />

              {STEPS.map((step) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;

                return (
                  <div
                    key={step.id}
                    className="flex flex-col items-center relative z-10"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                        isActive
                          ? "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950/60 shadow-sm"
                          : isCompleted
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-300 dark:border-gray-700"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircleIcon className="h-5 w-5" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium text-center whitespace-nowrap ${
                        isActive
                          ? "text-blue-600 font-bold"
                          : isCompleted
                            ? "text-gray-700 dark:text-gray-300"
                            : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Contents */}
          <div className="p-6 sm:p-10">
            {/* STEP 1: Thông tin Shop */}
            {currentStep === 1 && (
              <form onSubmit={handleNext} className="space-y-6 max-w-2xl mx-auto">
                <div className="space-y-5">
                  {/* Tên Shop */}
                  <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <span className="text-red-500 mr-1">*</span> Tên Shop
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="shopName"
                        value={formData.shopName}
                        onChange={handleChange}
                        placeholder="Nhập tên shop của bạn"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 pr-16"
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                        {formData.shopName.length}/30
                      </span>
                    </div>
                  </div>

                  {/* Địa chỉ lấy hàng */}
                  <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-start gap-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 pt-2 flex items-center">
                      <span className="text-red-500 mr-1">*</span> Địa chỉ lấy hàng
                    </label>
                    <div>
                      {formData.pickupAddressFormatted ? (
                        <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                            <MapPinIcon className="h-5 w-5 text-blue-600 shrink-0" />
                            <span>{formData.pickupAddressFormatted}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowAddressModal(true)}
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0 cursor-pointer"
                          >
                            Thay đổi
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowAddressModal(true)}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer transition-colors shadow-2xs"
                        >
                          <PlusIcon className="h-4 w-4 text-blue-600" />
                          <span>Thêm địa chỉ lấy hàng</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <span className="text-red-500 mr-1">*</span> Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/80 text-sm text-gray-700 dark:text-gray-300 focus:outline-none"
                      readOnly={Boolean(profile?.email)}
                    />
                  </div>

                  {/* Số điện thoại */}
                  <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <span className="text-red-500 mr-1">*</span> Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+84 974 684 656"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                      required
                    />
                  </div>
                </div>
              </form>
            )}

            {/* STEP 2: Cài đặt vận chuyển */}
            {currentStep === 2 && (
              <div className="space-y-6 max-w-2xl mx-auto">
                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-200 dark:border-blue-900/40 text-sm text-blue-900 dark:text-blue-200 flex items-start gap-3">
                  <TruckIcon className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <p>
                    Kích hoạt các phương thức vận chuyển bạn muốn cung cấp cho khách hàng. Các đơn vị vận chuyển đối tác sẽ đến địa chỉ lấy hàng của bạn để lấy và giao hàng.
                  </p>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
                  {formData.shippingChannels.map((channel) => (
                    <div
                      key={channel.id}
                      className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                          {channel.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {channel.desc}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleShipping(channel.id)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          channel.enabled ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            channel.enabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-sm">Thanh toán khi nhận hàng (COD)</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Cho phép người mua thanh toán tiền mặt khi nhận hàng
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, enableCod: !prev.enableCod }))
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      formData.enableCod ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formData.enableCod ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Thông tin thuế */}
            {currentStep === 3 && (
              <div className="space-y-5 max-w-2xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-center gap-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Loại hình kinh doanh
                  </label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                  >
                    <option value="individual">Cá nhân kinh doanh</option>
                    <option value="household">Hộ kinh doanh cá thể</option>
                    <option value="company">Doanh nghiệp / Công ty</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-center gap-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mã số thuế
                  </label>
                  <input
                    type="text"
                    name="taxCode"
                    value={formData.taxCode}
                    onChange={handleChange}
                    placeholder="Mã số thuế cá nhân hoặc doanh nghiệp"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-center gap-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email nhận hóa đơn
                  </label>
                  <input
                    type="email"
                    name="invoiceEmail"
                    value={formData.invoiceEmail}
                    onChange={handleChange}
                    placeholder="invoice@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: Hoàn tất */}
            {currentStep === 4 && (
              <div className="text-center py-8 max-w-lg mx-auto space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/50 text-green-600 dark:text-green-400 mx-auto flex items-center justify-center">
                  <CheckCircleIcon className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Đăng ký Người bán thành công!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Chúc mừng bạn đã hoàn tất đăng ký gian hàng <strong>{formData.shopName}</strong>. Địa chỉ lấy hàng mặc định: <strong>{formData.pickupAddressFormatted}</strong>. Bạn có thể bắt đầu đăng bán sản phẩm và quản lý đơn hàng ngay bây giờ.
                </p>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    to="/seller/dashboard"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-sm"
                  >
                    Đến Dashboard Người Bán
                  </Link>
                  <Link
                    to="/seller/products"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl border border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-sm font-semibold transition-colors"
                  >
                    Đăng bán sản phẩm ngay
                  </Link>
                  <Link
                    to="/"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
                  >
                    Về Trang Chủ
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons Footer ("Lưu" & "Tiếp theo") */}
          {currentStep < 4 && (
            <div className="px-6 sm:px-10 py-5 bg-gray-50/70 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
                  >
                    Quay lại
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
                >
                  Lưu bản nháp
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-sm cursor-pointer"
                >
                  {currentStep === 3 ? "Hoàn tất đăng ký" : "Tiếp theo"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Address Selection / Add Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              Chọn hoặc thêm Địa chỉ lấy hàng
            </h3>

            {/* Existing user addresses */}
            {addresses.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Danh sách địa chỉ của bạn ({addresses.length})
                </p>
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectExistingAddress(addr)}
                      className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-600 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 cursor-pointer text-xs space-y-1 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {addr.fullName} <span className="text-gray-400">|</span> {addr.phone}
                        </p>
                        {addr.isDefault && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">
                        {addr.addressDetail}, {addr.ward}, {addr.district}, {addr.province}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add new address section with structured DB fields */}
            <form onSubmit={handleAddAddress} className="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Hoặc tạo địa chỉ lấy hàng mới
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Họ tên người liên hệ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={newAddressInput.fullName}
                    onChange={(e) =>
                      setNewAddressInput((p) => ({ ...p, fullName: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="0974684656"
                    value={newAddressInput.phone}
                    onChange={(e) =>
                      setNewAddressInput((p) => ({ ...p, phone: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Tỉnh / Thành phố <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Hà Nội"
                    value={newAddressInput.province}
                    onChange={(e) =>
                      setNewAddressInput((p) => ({ ...p, province: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Quận / Huyện <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Cầu Giấy"
                    value={newAddressInput.district}
                    onChange={(e) =>
                      setNewAddressInput((p) => ({ ...p, district: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Phường / Xã <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Dịch Vọng"
                    value={newAddressInput.ward}
                    onChange={(e) =>
                      setNewAddressInput((p) => ({ ...p, ward: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Địa chỉ chi tiết (Số nhà, tên đường, tòa nhà...) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Số 123 Đường Cầu Giấy"
                  value={newAddressInput.addressDetail}
                  onChange={(e) =>
                    setNewAddressInput((p) => ({ ...p, addressDetail: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="new-addr-default"
                  type="checkbox"
                  checked={newAddressInput.isDefault}
                  onChange={(e) =>
                    setNewAddressInput((p) => ({ ...p, isDefault: e.target.checked }))
                  }
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <label htmlFor="new-addr-default" className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                  Đặt làm địa chỉ mặc định
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingNewAddress}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {savingNewAddress ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <span>Lưu và chọn địa chỉ này</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

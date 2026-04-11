import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  formatNumber,
  swalWithCustomConfiguration,
  addressInputField,
  paymentMethods,
  generateFutureYearsForExpiryDate,
  months,
} from "../../utility/constant";
import { useTheme } from "../../Context/themeContext";
import { Loader, Button, Input } from "../../LIBS";
import { useAuth } from "../../Context/authContext";
import { useUser } from "../../Context/userContext";
import { MdLocationOn, MdPayment, MdShoppingBag, MdCheckCircle, MdCreditCard } from "react-icons/md";
import { FaLock, FaTruck, FaTag } from "react-icons/fa";
import { BsLightningChargeFill } from "react-icons/bs";
import "./style.css";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

/* ── Reusable styled field wrapper ── */
const FieldGroup = ({ label, required, error, children }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-sm font-semibold font-roboto text-gray-600 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    {children}
    {error && <p className="text-red-500 text-xs font-roboto">{error}</p>}
  </div>
);

/* ── Section card wrapper ── */
const SectionCard = ({ icon, title, badge, isDark, children }) => (
  <div className={`rounded-2xl border p-5 flex flex-col gap-4 ${
    isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow-sm"
  }`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600">{icon}</div>
        <h2 className={`font-bold font-roboto text-base ${isDark ? "text-white" : "text-gray-900"}`}>{title}</h2>
      </div>
      {badge}
    </div>
    <div className={`border-t ${isDark ? "border-gray-700" : "border-gray-100"}`} />
    {children}
  </div>
);

/* ── Themed input class builder ── */
const inputCls = (isDark, extraCls = "") =>
  `w-full px-3 py-2.5 rounded-xl border-2 outline-none font-roboto text-sm transition-all duration-200
  ${isDark
    ? "bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-indigo-500"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white"
  } ${extraCls}`;

const BuyNow = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { authToken } = useAuth();
  const { productId } = useParams();
  const { userDetail, setUserDetail } = useUser();
  const isDark = theme === "dark";

  const [isorderSubmitting, setIsOrderSubmitting] = useState(false);
  const [productArr, setProductArr] = useState([]);
  const [isDataFetching, setIsDataFetching] = useState(false);
  const [paymentData, setPaymentData] = useState({ methodName: "", methodDetail: {} });
  const [errors, setErrors] = useState({});
  const [shippingAddress, setShippingAddress] = useState({});
  const [isError, setIsError] = useState({});

  const totalMRP = productArr?.reduce((t, p) => t + (p?.mrpPrice || p?.price) * p?.quantity, 0);
  const totalSelling = productArr?.reduce((t, p) => t + (p?.sellingPrice || p?.price) * p?.quantity, 0);
  const totalDiscount = totalMRP - totalSelling;
  const shippingCharges = totalSelling < 1000 ? Math.round(totalSelling * 0.1) : 0;
  const grandTotal = totalSelling + shippingCharges;

  /* ── API Calls (unchanged) ── */
  const getProductDataById = () => {
    setIsDataFetching(true);
    axios({ method: "get", url: `${SERVER_URL}/api/product/${productId}` })
      .then(({ data, status }) => {
        if (status === 200) setProductArr([{ ...data?.product, quantity: 1 }]);
      })
      .catch(({ response: { data, status } }) => {
        if (status === 404) setIsError({ error: data?.message, status });
      })
      .finally(() => setIsDataFetching(false));
  };

  const getCartItem = () => {
    setIsDataFetching(true);
    axios({
      method: "POST",
      url: `${SERVER_URL}/api/user/get-cart-items`,
      headers: { Authorization: `Bearer ${authToken}` },
      data: { userId: userDetail?.id },
    })
      .then(({ data }) => setProductArr(data?.cartProduct))
      .catch(console.error)
      .finally(() => setIsDataFetching(false));
  };

  const validateCheckoutDetails = () => {
    let errs = {};
    addressInputField.forEach((field) => {
      if (field.required && !shippingAddress?.[field.value]) errs[field.value] = `${field.label} is required.`;
    });
    if (!paymentData?.methodName) {
      errs.methodName = "Please select a payment method.";
    } else {
      const { methodName, methodDetail } = paymentData;
      if (methodName === "debitcard") {
        if (!methodDetail?.cardNumber) errs.cardNumber = "Card number is required.";
        if (!methodDetail?.cardHolderName) errs.cardHolderName = "Cardholder name is required.";
        if (!methodDetail?.expiryMonth) errs.expiryMonth = "Expiry month is required.";
        if (!methodDetail?.expiryYear) errs.expiryYear = "Expiry year is required.";
        if (!methodDetail?.cvv) errs.cvv = "CVV is required.";
      } else if (methodName === "upi") {
        if (!methodDetail?.upiId) errs.upiId = "UPI ID is required.";
      }
    }
    if (Object.keys(errs).length > 0) { setErrors(errs); return false; }
    return true;
  };

  const submitOrder = () => {
    setIsOrderSubmitting((prev) => !prev);
    axios({
      method: "POST",
      url: `${SERVER_URL}/api/order/submit-order`,
      headers: { Authorization: `Bearer ${authToken}` },
      data: { cartProduct: productArr, shippingAddress, paymentData },
    })
      .then(({ data, status }) => {
        if (data?.updatedShippingAddress) {
          setUserDetail((prev) => ({ ...prev, shippingAddress: data?.updatedShippingAddress }));
        }
        setIsOrderSubmitting((prev) => !prev);
        if (status === 201) navigate("/order-success", { state: data?.orderIds });
      })
      .catch(({ response: { data, status } }) => {
        setIsOrderSubmitting((prev) => !prev);
        if (status === 404) swalWithCustomConfiguration?.fire("Oops!", data?.message, "error");
        console.error(data);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateCheckoutDetails()) return;
    setErrors({});
    submitOrder();
  };

  const handlePaymentMethodChange = (e) => {
    if (e.target.name === "paymentMethod") {
      setPaymentData((prev) => ({ ...prev, methodName: e.target.value, methodDetail: {} }));
    }
  };

  const handlePaymentDetailChange = (e) => {
    const { name, value } = e.target;
    if (name === "cardNumber" && value.length > 16) return;
    if (name === "cvv" && value.length > 3) return;
    setPaymentData((prev) => ({ ...prev, methodDetail: { ...prev.methodDetail, [name]: value } }));
  };

  const handleShippingAddressChange = (e) => {
    const { name, value } = e.target;
    if (value) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "pinCode" && value.length > 6) return;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: name === "isDefaultShippingAddress" ? e?.target?.checked : value?.toLowerCase(),
    }));
  };

  useEffect(() => { productId ? getProductDataById() : getCartItem(); }, [productId]);
  useEffect(() => { if (!authToken) navigate("/login"); });
  useEffect(() => { window.scrollTo(0, 0); }, []);

  if (isDataFetching) return <Loader />;

  return (
    productArr?.length > 0 && (
      <div className={`min-h-screen w-full transition-all duration-300 ${isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>

        {/* ── Page Header ── */}
        <div className={`sticky top-0 z-30 border-b px-6 py-3 flex items-center gap-3 ${
          isDark ? "bg-gray-900/95 border-gray-700 backdrop-blur" : "bg-white/95 border-gray-200 backdrop-blur shadow-sm"
        }`}>
          <div className="p-2 bg-indigo-600 rounded-xl">
            <BsLightningChargeFill className="text-white text-sm" />
          </div>
          <h1 className={`text-lg font-bold font-roboto ${isDark ? "text-white" : "text-gray-900"}`}>
            Secure Checkout
          </h1>
          <div className="ml-auto flex items-center gap-1.5 text-green-600">
            <FaLock className="text-xs" />
            <span className="text-xs font-roboto font-semibold">SSL Secured</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6 mobile:flex-col mobile:items-stretch tablet:flex-row tablet:items-start">

          {/* ════ LEFT COLUMN — Forms ════ */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">

            {/* ── Customer Details ── */}
            <SectionCard
              icon={<MdShoppingBag className="text-lg" />}
              title="Customer Details"
              isDark={isDark}
            >
              <div className="grid grid-cols-2 gap-4 mobile:grid-cols-1 small-device:grid-cols-2">
                <FieldGroup label="Full Name" required>
                  <Input
                    type="text" name="name" id="name"
                    className={inputCls(isDark, userDetail?.name ? "cursor-not-allowed opacity-70" : "")}
                    placeholder="Your name"
                    value={userDetail?.name?.toCapitalize?.() || ""}
                    disabled={!!userDetail?.name}
                    onChange={() => {}}
                  />
                </FieldGroup>
                <FieldGroup label="Phone Number" required>
                  <Input
                    type="number" name="phoneNumber" id="phoneNumber"
                    className={inputCls(isDark, userDetail?.phoneNumber ? "cursor-not-allowed opacity-70" : "")}
                    placeholder="Phone number"
                    value={userDetail?.phoneNumber || ""}
                    disabled={!!userDetail?.phoneNumber}
                    onChange={() => {}}
                  />
                </FieldGroup>
              </div>
            </SectionCard>

            {/* ── Shipping Address ── */}
            <SectionCard
              icon={<MdLocationOn className="text-lg" />}
              title="Shipping Address"
              isDark={isDark}
              badge={
                userDetail?.shippingAddress && Object.keys(userDetail?.shippingAddress).length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setShippingAddress(userDetail?.shippingAddress)}
                    className={`text-xs font-semibold font-roboto px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                      isDark
                        ? "border-indigo-500 text-indigo-400 hover:bg-indigo-900/30"
                        : "border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                    }`}
                  >
                    Use Default Address
                  </button>
                ) : null
              }
            >
              <div className="grid grid-cols-2 gap-4 mobile:grid-cols-1 small-device:grid-cols-2 laptop:grid-cols-3">
                {addressInputField.map(({ label, type, placeholder, value, id, name, required }, index) => (
                  <FieldGroup key={index} label={label} required={required} error={errors[name]}>
                    <Input
                      type={type} id={id} name={name}
                      className={inputCls(isDark)}
                      placeholder={placeholder}
                      onChange={handleShippingAddressChange}
                      value={shippingAddress?.[value] || ""}
                    />
                  </FieldGroup>
                ))}
              </div>

              {/* Save as default checkbox */}
              <label className="flex items-center gap-2.5 cursor-pointer w-max">
                <input
                  type="checkbox"
                  id="isDefaultShippingAddress"
                  name="isDefaultShippingAddress"
                  onChange={handleShippingAddressChange}
                  checked={shippingAddress?.isDefaultShippingAddress || false}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
                />
                <span className={`text-sm font-roboto ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  Save as default shipping address
                </span>
              </label>
            </SectionCard>

            {/* ── Payment Method ── */}
            <SectionCard
              icon={<MdPayment className="text-lg" />}
              title="Payment Method"
              isDark={isDark}
            >
              {/* Method selector pills — stacked on mobile, row on tablet+ */}
              <div className="flex flex-col gap-2 small-device:flex-row small-device:gap-3">
                {paymentMethods.map((method) => {
                  const isSelected = paymentData.methodName === method.value;
                  return (
                    <label
                      key={method.id}
                      htmlFor={method.id}
                      className={`
                        flex-1 cursor-pointer flex items-center gap-2.5
                        px-4 py-3 rounded-xl border-2 text-sm font-semibold font-roboto
                        transition-all duration-200 whitespace-nowrap
                        ${isSelected
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200"
                          : isDark
                            ? "border-gray-600 text-gray-300 hover:border-indigo-500 hover:bg-indigo-900/20"
                            : "border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50"
                        }
                      `}
                    >
                      <input
                        type="radio" id={method.id} name="paymentMethod" value={method.value}
                        checked={isSelected} onChange={handlePaymentMethodChange}
                        className="hidden"
                      />
                      {method.value === "debitcard" && <MdCreditCard className={`flex-shrink-0 text-lg ${isSelected ? "text-white" : "text-indigo-500"}`} />}
                      {method.value === "upi" && <span className={`flex-shrink-0 text-xs font-black ${isSelected ? "text-white" : "text-indigo-500"}`}>UPI</span>}
                      {method.value === "cod" && <FaTruck className={`flex-shrink-0 ${isSelected ? "text-white" : "text-indigo-500"}`} />}
                      {method.label}
                    </label>
                  );
                })}
              </div>

              {errors.methodName && <p className="text-red-500 text-xs font-roboto">{errors.methodName}</p>}

              {/* Card Details */}
              {paymentData?.methodName === "debitcard" && (
                <div className={`rounded-xl p-4 border ${isDark ? "bg-gray-700/50 border-gray-600" : "bg-indigo-50/50 border-indigo-100"}`}>
                  <p className={`text-xs font-semibold font-roboto mb-3 uppercase tracking-widest ${isDark ? "text-gray-400" : "text-indigo-400"}`}>Card Details</p>
                  <div className="grid grid-cols-1 gap-3 small-device:grid-cols-2">
                    {/* Card Number — full width on mobile, spans 2 on small-device+ */}
                    <div className="col-span-1 small-device:col-span-2">
                      <FieldGroup label="Card Number" required error={errors.cardNumber}>
                        <Input
                          type="text" id="cardNumber" name="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          className={inputCls(isDark)}
                          onChange={handlePaymentDetailChange}
                          value={paymentData?.methodDetail?.cardNumber || ""}
                        />
                      </FieldGroup>
                    </div>
                    {/* Cardholder Name — full width on mobile, half on small-device+ */}
                    <div className="col-span-1 small-device:col-span-2">
                      <FieldGroup label="Cardholder Name" required error={errors.cardHolderName}>
                        <Input
                          type="text" id="cardHolderName" name="cardHolderName"
                          placeholder="Name on card"
                          className={inputCls(isDark)}
                          onChange={handlePaymentDetailChange}
                          value={paymentData?.methodDetail?.cardHolderName || ""}
                        />
                      </FieldGroup>
                    </div>
                    <FieldGroup label="Expiry Date" required error={errors.expiryMonth || errors.expiryYear}>
                      <div className="flex gap-2">
                        <select
                          name="expiryMonth"
                          className={inputCls(isDark)}
                          onChange={handlePaymentDetailChange}
                          value={paymentData?.methodDetail?.expiryMonth || ""}
                        >
                          <option value="">Month</option>
                          {months.map((m, i) => <option key={i} value={m.value}>{m.alphabetics}</option>)}
                        </select>
                        <select
                          name="expiryYear"
                          className={inputCls(isDark)}
                          onChange={handlePaymentDetailChange}
                          value={paymentData?.methodDetail?.expiryYear || ""}
                        >
                          <option value="">Year</option>
                          {generateFutureYearsForExpiryDate().map((y, i) => <option key={i} value={y}>{y}</option>)}
                        </select>
                      </div>
                    </FieldGroup>
                    <FieldGroup label="CVV" required error={errors.cvv}>
                      <Input
                        type="password" id="cvv" name="cvv"
                        placeholder="•••"
                        className={inputCls(isDark)}
                        onChange={handlePaymentDetailChange}
                        value={paymentData?.methodDetail?.cvv || ""}
                      />
                    </FieldGroup>
                  </div>
                </div>
              )}

              {/* UPI Details */}
              {paymentData?.methodName === "upi" && (
                <FieldGroup label="UPI ID" required error={errors.upiId}>
                  <Input
                    type="text" id="upi" name="upiId"
                    placeholder="yourname@upi"
                    className={inputCls(isDark, "max-w-sm")}
                    onChange={handlePaymentDetailChange}
                    value={paymentData?.methodDetail?.upiId || ""}
                  />
                </FieldGroup>
              )}

              {/* COD note */}
              {paymentData?.methodName === "cod" && (
                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-roboto ${
                  isDark ? "bg-yellow-900/30 text-yellow-300 border border-yellow-800" : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                }`}>
                  <FaTruck />
                  Pay in cash when your order is delivered. No advance needed.
                </div>
              )}
            </SectionCard>
          </div>

          {/* ════ RIGHT COLUMN — Order Summary ════ */}
          <div className="w-full tablet:w-[280px] laptop:w-[360px] flex-shrink-0 flex flex-col gap-4 tablet:sticky tablet:top-20">

            {/* Products list */}
            <div className={`rounded-2xl border p-5 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow-sm"}`}>
              <div className="flex items-center gap-2 mb-4">
                <MdShoppingBag className="text-indigo-500" />
                <h2 className={`font-bold font-roboto text-base ${isDark ? "text-white" : "text-gray-900"}`}>
                  Your Order ({productArr.length} item{productArr.length !== 1 ? "s" : ""})
                </h2>
              </div>
              <div className={`border-t mb-4 ${isDark ? "border-gray-700" : "border-gray-100"}`} />

              <div className="fancy-scroll flex flex-col gap-3 max-h-[260px] overflow-y-auto pr-2">
                {productArr?.map((product, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                      <img
                        src={product?.image?.[0]}
                        alt={product?.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <p className={`font-semibold font-roboto text-sm line-clamp-2 leading-snug ${isDark ? "text-white" : "text-gray-900"}`}>
                        {product?.name}
                      </p>
                      <p className={`text-xs font-roboto ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        Qty: {product?.quantity} × {formatNumber(product?.sellingPrice || product?.price)}
                      </p>
                      <p className={`text-sm font-bold font-roboto ${isDark ? "text-indigo-300" : "text-indigo-600"}`}>
                        {formatNumber((product?.sellingPrice || product?.price) * product?.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className={`rounded-2xl border p-5 flex flex-col gap-3 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow-sm"}`}>
              <div className="flex items-center gap-2 mb-1">
                <FaTag className="text-indigo-500 text-sm" />
                <h2 className={`font-bold font-roboto text-base ${isDark ? "text-white" : "text-gray-900"}`}>Price Details</h2>
              </div>
              <div className={`border-t ${isDark ? "border-gray-700" : "border-gray-100"}`} />

              {[
                { label: "MRP Total", value: formatNumber(totalMRP), muted: true },
                { label: "Discount", value: totalDiscount > 0 ? `- ${formatNumber(totalDiscount)}` : "₹0", green: totalDiscount > 0 },
                { label: "Shipping", value: shippingCharges > 0 ? formatNumber(shippingCharges) : "FREE", green: shippingCharges === 0 },
              ].map(({ label, value, muted, green }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className={`text-sm font-roboto ${isDark ? "text-gray-400" : "text-gray-500"}`}>{label}</span>
                  <span className={`text-sm font-semibold font-roboto ${
                    green ? "text-green-500" : muted ? isDark ? "text-gray-300" : "text-gray-600" : isDark ? "text-white" : "text-gray-900"
                  }`}>{value}</span>
                </div>
              ))}

              <div className={`border-t pt-3 mt-1 ${isDark ? "border-gray-700" : "border-gray-100"}`} />
              <div className="flex justify-between items-center">
                <span className={`font-bold font-roboto text-base ${isDark ? "text-white" : "text-gray-900"}`}>Grand Total</span>
                <span className="font-bold font-roboto text-lg text-indigo-600">{formatNumber(grandTotal)}</span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-2 bg-green-50 border border-green-200 rounded-xl">
                  <MdCheckCircle className="text-green-500 text-sm flex-shrink-0" />
                  <p className="text-green-700 text-xs font-semibold font-roboto">
                    You save {formatNumber(totalDiscount)} on this order!
                  </p>
                </div>
              )}
            </div>

            {/* Place Order CTA */}
            <button
              onClick={handleSubmit}
              disabled={isorderSubmitting}
              className={`
                w-full py-3.5 rounded-2xl font-roboto font-bold text-base text-white
                flex items-center justify-center gap-2
                transition-all duration-200 shadow-lg
                ${isorderSubmitting
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-300 hover:scale-[1.02] active:scale-100"
                }
              `}
            >
              {isorderSubmitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Placing Order...
                </>
              ) : (
                <>
                  <BsLightningChargeFill />
                  Place Order · {formatNumber(grandTotal)}
                </>
              )}
            </button>

            {/* Trust strip */}
            <div className={`flex items-center justify-center gap-3 py-2 text-xs font-roboto ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              <span className="flex items-center gap-1"><FaLock /> Secure</span>
              <span>·</span>
              <span className="flex items-center gap-1"><FaTruck /> Fast Delivery</span>
              <span>·</span>
              <span className="flex items-center gap-1"><MdCheckCircle /> Easy Returns</span>
            </div>
          </div>

        </div>
      </div>
    )
  );
};

export default BuyNow;

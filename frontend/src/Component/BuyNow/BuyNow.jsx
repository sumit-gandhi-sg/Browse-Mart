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
import "./style.css";
import { useTheme } from "../../Context/themeContext";
import { Loader, Button, Input } from "../../LIBS";
import { useAuth } from "../../Context/authContext";
import { useUser } from "../../Context/userContext";
// import { FaRupeeSign } from "react-icons/fa";
// const LOCATION_SERVER_URL = import.meta.env.VITE_LOCATION_FETCHING_SERVER_URL;
// const LOCATION_API = import.meta.env.VITE_LOCATION_FETCHING_API_KEY;
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const BuyNow = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { authToken } = useAuth();

  const { productId } = useParams();
  const { userDetail, setUserDetail } = useUser();
  const [isorderSubmitting, setIsOrderSubmitting] = useState(false);
  const [productArr, setProductArr] = useState([]);
  const [isDataFetching, setIsDataFetching] = useState(false);
  const [countryList, setCountryList] = useState([]);
  const [paymentData, setPaymentData] = useState({
    methodName: "",
    methodDetail: {},
  });

  const [errors, setErrors] = useState({});
  const [shippingAddress, setShippingAddress] = useState({});
  const [isError, setIsError] = useState({});
  const totalPrice = productArr?.reduce((total, product) => {
    return (
      total + (product?.sellingPrice || product?.price) * product?.quantity
    );
  }, 0);

  const shippingCharges = totalPrice < 1000 ? totalPrice * 0.1 : 0;
  //Getting Single Product Data By Id
  const getProductDataById = () => {
    setIsDataFetching(true);
    axios({
      method: "get",
      url: `${SERVER_URL}/api/product/${productId}`,
      // data: {
      //   productId: productId,
      //   quantity: 1,
      // },
    })
      .then((response) => {
        const { data, status } = response;
        if (status === 200) {
          // setProductData(data?.product);
          setProductArr((prev) => {
            return [
              {
                ...data?.product,
                quantity: 1,
              },
            ];
          });
        } else {
          // Handle error
        }
      })
      .catch((error) => {
        const { data, status } = error?.response;
        if (status === 404) {
          setIsError({ error: data?.message, status: status });
        }
      })
      .finally(() => setIsDataFetching(false));
  };

  // Getting Cart Item From Cart from database
  const getCartItem = () => {
    setIsDataFetching(true);
    axios({
      method: "POST",
      url: `${SERVER_URL}/api/user/get-cart-items`,
      headers: { Authorization: `Bearer ${authToken}` },
      data: { userId: userDetail?.id },
    })
      .then((response) => {
        setProductArr(response?.data?.cartProduct);
      })
      .catch((error) => {
        console.error(error);
        // setError(() => {
        //   return {
        //     message: "Failed to fetch cart items",
        //     status: error?.response?.status,
        //   };
        // });
      })
      .finally(() => setIsDataFetching(false));
  };

  const validateCheckoutDetails = () => {
    let errors = {}; // Object to store all error messages

    // Validate address fields dynamically from the array
    addressInputField.forEach((field) => {
      if (field.required && !shippingAddress?.[field.value]) {
        errors[field.value] = `${field.label} is required.`;
      }
    });

    // Validate payment method
    if (!paymentData?.methodName) {
      errors.methodName = "Please select a payment method.";
    } else {
      const { methodName, methodDetail } = paymentData;

      if (methodName === "debitcard") {
        if (!methodDetail?.cardNumber)
          errors.cardNumber = "Card number is required.";
        if (!methodDetail?.cardHolderName)
          errors.cardHolderName = "Cardholder name is required.";
        if (!methodDetail?.expiryMonth)
          errors.expiryMonth = "Expiry month is required.";
        if (!methodDetail?.expiryYear)
          errors.expiryYear = "Expiry year is required.";
        if (!methodDetail?.cvv) errors.cvv = "CVV is required.";
      } else if (methodName === "upi") {
        if (!methodDetail?.upiId) errors.upiId = "UPI ID is required.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return false;
    }

    return true;
  };

  //order Submissions
  const submitOrder = () => {
    // Validate and submit payment details
    // If successful, send order to server
    // If not, display error message
    // Navigate to success page
    setIsOrderSubmitting((prev) => !prev);

    axios({
      method: "POST",
      url: `${SERVER_URL}/api/order/submit-order`,
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        cartProduct: productArr,
        shippingAddress: shippingAddress,
        paymentData,
        timeStamp: new Date().toLocaleString(),
      },
    })
      .then((response) => {
        const { data, status } = response;
        if (data?.updatedShippingAddress) {
          setUserDetail((prev) => {
            return {
              ...prev,
              shippingAddress: data?.updatedShippingAddress,
            };
          });
        }

        setIsOrderSubmitting((prev) => !prev);

        if (status === 201) {
          navigate("/order-success", { state: data?.orderIds });
        }
      })
      .catch((error) => {
        const { data, status } = error?.response;
        setIsOrderSubmitting((prev) => !prev);
        if (status === 404) {
          swalWithCustomConfiguration?.fire("Oops!", data?.message, "error");
        }
        console.error(error);
      });
  };
  //handle submit event
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateCheckoutDetails()) return;

    setErrors({});

    submitOrder();
    // // Reset paymentData
    // setPaymentData({
    //   methodName: "",
    //   methodDetail: {},
    // });
    // // Reset shippingAddress
    // setShippingAddress({});
    // Navigate to success page
  };
  // Handle Payemnt Method Change
  const handlePaymentMethodChange = (e) => {
    if (e.target.name === "paymentMethod") {
      setPaymentData((prev) => {
        return {
          ...prev,
          methodName: e.target.value,
          methodDetail: {},
        };
      });
    }
  };
  // Handle Payment Detail Change
  const handlePaymentDetailChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    if (name === "cardNumber") {
      // Validate card number here
      // if valid, proceed to next field
      if (value.length <= 16) {
        setPaymentData((prev) => {
          return {
            ...prev,
            methodDetail: {
              ...prev.methodDetail,
              [name]: value,
            },
          };
        });
      }
    } else if (name === "cvv") {
      if (value.length <= 3) {
        setPaymentData((prev) => {
          return {
            ...prev,
            methodDetail: {
              ...prev.methodDetail,
              [name]: value,
            },
          };
        });
      }
    } else {
      setPaymentData((prev) => {
        return {
          ...prev,
          methodDetail: {
            ...prev.methodDetail,
            [name]: value,
          },
        };
      });
    }
  };
  // Handle Shipping Address Change
  const handleShippingAddressChange = (e) => {
    const name = e.target.name;
    const value = e.target?.value?.toLowerCase();
    if (value) {
      setErrors((prev) => {
        return {
          ...prev,
          [name]: "",
        };
      });
    }
    if (name === "pinCode") {
      if (value.length <= 6) {
        setShippingAddress((prev) => {
          return {
            ...prev,
            [name]:
              name === "isDefaultShippingAddress" ? e?.target?.checked : value,
          };
        });
      }
    } else {
      setShippingAddress((prev) => {
        return {
          ...prev,
          [name]:
            name === "isDefaultShippingAddress" ? e?.target?.checked : value,
        };
      });
    }
  };

  // Fetching Order Product Details
  useEffect(() => {
    if (productId) {
      getProductDataById();
    } else {
      getCartItem();
    }
  }, [productId]);
  useEffect(() => {
    if (!authToken) {
      navigate("/login");
    }
  });
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top on component mount
  }, []);

  if (isDataFetching) return <Loader />;
  return (
    productArr?.length > 0 && (
      <div
        className={`w-full min-h-screen transition-all duration-300  ${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
      >
        {/* <CartCard product={productData} />
      
      */}
        <div className=" w-[80%] m-auto p-2 mobile:w-full tablet:w-[90%] laptop:w-[80%]">
          <div className="m-5">
            <span className="text-2xl font-bold font-roboto m-4">Checkout</span>
          </div>

          <div className="w-full p-2 h-full flex justify-between gap-8 mobile:flex-col mobile:gap-8 tablet:flex-row">
            <div className="w-8/12 p-3 rounded border-2 border-gray-100 min-h-[150px] flex flex-col gap-3 h-max mobile:w-full tablet:w-7/12 desktop:8/12">
              {/* customer detail section */}
              <div className="border-gray-200 border-b-2 w-full p-3 flex flex-col gap-3">
                <div className="font-roboto font-semibold text-lg">
                  Customer Detail
                </div>

                <div className="grid grid-cols-2 gap-4 w-full  mobile:text-sm  tablet:text-base">
                  <div className="flex flex-col gap-2  ">
                    <label htmlFor="name">
                      Name <span className="required">*</span>
                    </label>
                    <Input
                      type={"text"}
                      name={"name"}
                      id={"name"}
                      className={`p-2 bg-gray-100 border-2 w-full rounded border-gray-300 outline-none ${
                        userDetail?.name ? "cursor-not-allowed" : ""
                      }
                    ${
                      theme === "dark"
                        ? "bg-gray-700 text-white border-gray-600"
                        : "text-gray-900 bg-gray-100 border-gray-300"
                    } `}
                      placeholder={"Name"}
                      value={userDetail?.name?.toCapitalize()}
                      disabled={userDetail?.name ? true : false}
                      onChange={() => {
                        return;
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="phoneNumber">
                      Phone <span className="required">*</span>
                    </label>
                    <Input
                      type={"number"}
                      id={"phoneNumber"}
                      name={"phoneNumber"}
                      className={`p-2 bg-gray-100 border-2 w-full rounded border-gray-300 outline-none  ${
                        userDetail?.phoneNumber ? "cursor-not-allowed" : ""
                      }
                    ${
                      theme === "dark"
                        ? "bg-gray-700 text-white border-gray-600"
                        : "text-gray-900 bg-gray-100 border-gray-300"
                    }`}
                      placeholder={"Phone Number"}
                      value={userDetail?.phoneNumber}
                      disabled={userDetail?.phoneNumber ? true : false}
                      onChange={() => {
                        return;
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* shipping address section */}
              <div className="border-gray-200 border-b-2 w-full p-3 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold font-roboto text-lg">
                    Shipping Address
                  </span>
                  {userDetail?.shippingAddress &&
                    Object.keys(userDetail?.shippingAddress).length > 0 && (
                      <Button
                        btntext={"Use Default Address"}
                        className={` px-3 py-1 rounded-full text-sm font-medium ${
                          theme === "dark"
                            ? "bg-gray-700 text-white border-gray-600"
                            : "text-gray-900 bg-gray-100 border-gray-300"
                        }`}
                        onClick={() =>
                          setShippingAddress(() => userDetail?.shippingAddress)
                        }
                      />
                    )}
                </div>
                <div className="w-full grid  gap-4 mobile:text-sm mobile:grid-cols-2 small-device:grid-cols-3 tablet:text-base tablet:grid-cols-2 laptop:grid-cols-3">
                  {addressInputField?.map(
                    (
                      {
                        label = null,
                        type,
                        placeholder,
                        value,
                        id,
                        name,
                        required,
                      },
                      index
                    ) => (
                      <div className="flex flex-col gap-2">
                        <label htmlFor={id} className="flex gap-2">
                          {label}
                          {required && <span className="required">*</span>}
                        </label>
                        <Input
                          type={type}
                          id={id}
                          name={name}
                          className={`p-2 bg-gray-100 w-full border-2 rounded border-gray-300 ${
                            theme === "dark"
                              ? "bg-gray-700 text-white border-gray-600"
                              : "text-gray-900 bg-gray-100 border-gray-300"
                          }`}
                          placeholder={placeholder}
                          onChange={handleShippingAddressChange}
                          value={shippingAddress?.[value]}
                        />

                        {errors[name] && (
                          <p className="text-red-500 text-sm font-medium mt-1">
                            {errors[value]}
                          </p>
                        )}
                      </div>
                    )
                  )}

                  <div className="flex gap-2 w-full font-roboto items-center mobile:col-span-2 small-device:col-span-3 tablet:col-span-2 laptop:col-span-3 ">
                    <Input
                      type={"checkbox"}
                      id={"isDefaultShippingAddress"}
                      name={"isDefaultShippingAddress"}
                      onChange={handleShippingAddressChange}
                      checked={shippingAddress?.isDefaultShippingAddress}
                      className={` bg-gray-100 border-2 rounded border-gray-300 ${
                        theme === "dark"
                          ? "bg-gray-700 text-white border-gray-600"
                          : "text-gray-900 bg-gray-100 border-gray-300"
                      }`}
                    />
                    <label htmlFor="isDefaultShippingAddress">
                      Make this address as default shipping address
                    </label>
                  </div>
                </div>
              </div>

              {/* Payment method section */}

              <div className=" w-full p-3 flex flex-col gap-3">
                <div className="font-roboto font-semibold text-lg">
                  Payment Method
                </div>

                <div className=" mobile:text-sm tablet:text-base ">
                  <div className="grid mobile:grid-cols-2 small-device:grid-cols-3 tablet:grid-cols-2 laptop:grid-cols-2 desktop:grid-cols-3  gap-4 w-max  box-border  rounded mobile:w-full mobile:gap-2 tablet:w-full ">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`${
                          method.classes
                        } flex justify-center items-center gap-3 border-gray-200 border-2 rounded ${
                          paymentData.methodName === method.value
                            ? "bg-indigo-600 text-white border-transparent"
                            : "bg-none"
                        }`}
                      >
                        <Input
                          type="radio"
                          id={method.id}
                          name="paymentMethod"
                          value={method.value}
                          checked={paymentData.methodName === method.value}
                          onChange={handlePaymentMethodChange}
                          className="hidden"
                        />
                        <label
                          htmlFor={method.id}
                          className="w-full h-full p-2 cursor-pointer flex items-center justify-center"
                        >
                          {method.label}
                        </label>
                      </div>
                    ))}
                  </div>

                  {errors.methodName && (
                    <p className="text-red-500 text-sm font-medium mt-1">
                      {errors.methodName}
                    </p>
                  )}

                  <div>
                    {paymentData?.methodName === "debitcard" && (
                      <div className="grid  flex-col gap-4 p-3 mobile:grid-cols-2 small-device:grid-cols-3 tablet:grid-cols-2 laptop:grid-cols-3">
                        {/* <div className="flex  gap-4 w-full"> */}
                        <div className="flex flex-col gap-2 min-w-[100px] small-device:col-span-2 tablet:col-span-1 laptop:col-span-2">
                          <label htmlFor="cardNumber">
                            Card Number <span className="required">*</span>
                          </label>
                          <Input
                            type="text"
                            id="cardNumber"
                            name="cardNumber"
                            placeholder={"Card Number"}
                            className={`p-2 bg-gray-100 w-full border-2 rounded border-gray-300 ${
                              theme === "dark"
                                ? "bg-gray-700 text-white border-gray-600"
                                : "text-gray-900 bg-gray-100 border-gray-300"
                            }`}
                            onChange={handlePaymentDetailChange}
                            value={paymentData?.methodDetail?.cardNumber}
                          />
                          {errors.cardNumber && (
                            <p className="text-red-500 text-sm font-medium mt-1">
                              {errors.cardNumber}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ">
                          <label htmlFor="cardHolderName">
                            Name <span className="required">*</span>
                          </label>
                          <Input
                            type="text"
                            id="cardHolderName"
                            name="cardHolderName"
                            placeholder={"Card Holder Name"}
                            className={`p-2 bg-gray-100 w-full border-2 rounded border-gray-300 ${
                              theme === "dark"
                                ? "bg-gray-700 text-white border-gray-600"
                                : "text-gray-900 bg-gray-100 border-gray-300"
                            }`}
                            onChange={handlePaymentDetailChange}
                            value={paymentData?.methodDetail?.cardHolderName}
                          />
                          {errors.cardHolderName && (
                            <p className="text-red-500 text-sm font-medium mt-1">
                              {errors.cardHolderName}
                            </p>
                          )}
                        </div>
                        {/* </div> */}
                        {/* <div className="flex  gap-4 w-full"> */}
                        <div className="flex flex-col gap-2 ">
                          <label htmlFor="expirydate">
                            Expiry Date <span className="required">*</span>
                          </label>
                          <div className="flex gap-2 border-2 border-gray-200 rounded p-1 w-full">
                            <div className="w-1/2">
                              <select
                                name="expiryMonth"
                                id=""
                                className={`p-1  w-full border-2 rounded border-gray-300 ${
                                  theme === "dark"
                                    ? "bg-gray-700 text-white border-gray-600"
                                    : "text-gray-900 bg-gray-100 border-gray-300"
                                }`}
                                onChange={handlePaymentDetailChange}
                                value={paymentData?.methodDetail?.expirymonth}
                              >
                                <option value="">Month</option>
                                {months.map((month, i) => {
                                  return (
                                    <option key={i} value={month?.value}>
                                      {month?.alphabetics}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                            <div className="w-1/2">
                              <select
                                name="expiryYear"
                                id=""
                                // className=" bg-gray-200 p-1 rounded scroll w-full outline-gray-400 outline-2"
                                className={`p-1  w-full border-2 rounded border-gray-300 ${
                                  theme === "dark"
                                    ? "bg-gray-700 text-white border-gray-600"
                                    : "text-gray-900 bg-gray-100 border-gray-300"
                                }`}
                                onChange={handlePaymentDetailChange}
                                value={paymentData?.methodDetail?.expiryear}
                              >
                                <option value="">Year</option>
                                {generateFutureYearsForExpiryDate()?.map(
                                  (year, i) => {
                                    return (
                                      <option key={i} value={year}>
                                        {year}
                                      </option>
                                    );
                                  }
                                )}
                              </select>
                            </div>
                          </div>

                          {errors.expiryMonth || errors.expiryYear ? (
                            <p className="text-red-500 text-sm font-medium mt-1">
                              {errors.expiryMonth || errors.expiryYear}
                            </p>
                          ) : (
                            ""
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ">
                          <label htmlFor="cvv">
                            CVV <span className="required">*</span>
                          </label>
                          <Input
                            type="password"
                            id="cvv"
                            name="cvv"
                            placeholder={"CVV"}
                            className={`p-2 bg-gray-100 w-full border-2 rounded border-gray-300 ${
                              theme === "dark"
                                ? "bg-gray-700 text-white border-gray-600"
                                : "text-gray-900 bg-gray-100 border-gray-300"
                            }`}
                            onChange={handlePaymentDetailChange}
                            value={paymentData?.methodDetail?.cvv}
                          />
                          {errors.cvv && (
                            <p className="text-red-500 text-sm font-medium mt-1">
                              {errors.cvv}
                            </p>
                          )}
                        </div>
                        {/* </div> */}
                      </div>
                    )}

                    {paymentData?.methodName === "upi" && (
                      <div className="flex gap-4 p-3 ">
                        <div className="flex flex-col gap-2">
                          <label htmlFor="upi">
                            UPI ID <span className="required">*</span>
                          </label>
                          <Input
                            type="text"
                            id="upi"
                            name="upiId"
                            placeholder={"UPI ID"}
                            className={`p-2 bg-gray-100 w-full border-2 rounded border-gray-300 ${
                              theme === "dark"
                                ? "bg-gray-700 text-white border-gray-600"
                                : "text-gray-900 bg-gray-100 border-gray-300"
                            }`}
                            onChange={handlePaymentDetailChange}
                            value={paymentData?.methodDetail?.upiId}
                          />

                          {errors.upiId && (
                            <p className="text-red-500 text-sm font-medium mt-1">
                              {errors.upiId}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* order summary section */}
            <div className="w-4/12 p-2 rounded border-2 border-gray-100 min-h-[150px] h-max mobile:w-full  tablet:w-5/12 laptop:w-5/12 desktop:w-4/12 ">
              <div className="m-2">
                <span className="  font-roboto font-semibold text-2xl">
                  Your Order
                </span>
              </div>

              <div className="flex flex-col gap-3 max-h-[250px] overflow-scroll ">
                {productArr?.map((product, index) => {
                  return (
                    <div key={index} className="flex gap-4 p-2 w-full">
                      {/* <div className="flex gap-2 p-2"> */}
                      <img
                        src={product?.image?.[0]}
                        alt={product?.name}
                        className="w-20 h-20 object-cover object-top rounded scale-105"
                      />
                      <div className="w-2/3 flex flex-col gap-2">
                        <span className="font-semibold font-roboto w-full text-ellipsis overflow-hidden whitespace-nowrap">
                          {product?.name}
                        </span>
                        <div>
                          Qty: {product?.quantity}
                          <span className="text-gray-400">
                            {" "}
                            x{" "}
                            {formatNumber(product?.price || product?.mrpPrice)}
                          </span>
                        </div>
                        <span className="flex w-full items-center ">
                          Subtotal:{" "}
                          {formatNumber(
                            (product?.price || product?.mrpPrice) *
                              product?.quantity
                          )}
                        </span>
                      </div>
                      {/* </div> */}
                    </div>
                  );
                })}
              </div>

              <div className="m-2">
                <div className="m-2">
                  {/* Total Price */}
                  <div className="flex gap-4 p-2 w-full total-price">
                    <span className="text-lg font-roboto w-full">Total</span>
                    <span className="flex items-center">
                      <span className="text-lg font-semibold font-roboto">
                        {formatNumber(
                          productArr?.reduce((total, product) => {
                            return (
                              total +
                              (product?.price || product?.mrpPrice) *
                                product?.quantity
                            );
                          }, 0)
                        )}
                      </span>
                    </span>
                  </div>

                  {/* Discount Price */}
                  <div className="flex gap-4 p-2 w-full total-price">
                    <span className="text-lg font-roboto w-full">Discount</span>
                    <span className="flex items-center">
                      <span className="text-lg font-semibold font-roboto">
                        {formatNumber(
                          productArr?.reduce((total, product) => {
                            return (
                              total +
                              (product?.mrpPrice - product?.sellingPrice) *
                                product?.quantity
                            );
                          }, 0)
                        ) || 0}
                      </span>
                    </span>
                  </div>
                  {totalPrice < 1000 && (
                    <div className="flex gap-4 p-2 w-full total-price">
                      <span className="text-lg font-roboto w-full">
                        Shipping Charges
                      </span>
                      <span className="flex items-center">
                        <span className="text-lg font-semibold font-roboto">
                          {formatNumber(shippingCharges)}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Grand Total */}
                  <div className="flex gap-4 p-2 w-full total-price">
                    <span className="text-lg font-roboto w-full">
                      Grand Total
                    </span>
                    <span className="flex items-center">
                      <span className="text-lg font-semibold font-roboto">
                        {formatNumber(totalPrice + shippingCharges)}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="w-full p-2">
                  <Button
                    btntext={"Place Order"}
                    className={
                      "w-full bg-indigo-600 rounded p-2 text-white font-roboto font-semibold outline-none border-none"
                    }
                    onClick={handleSubmit}
                    loading={isorderSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default BuyNow;

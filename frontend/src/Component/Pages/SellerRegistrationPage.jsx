import React, { useEffect, useState } from "react";
import axios from "axios";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import {
  FiArrowRight,
  FiBriefcase,
  FiCheckCircle,
  FiCreditCard,
  FiFileText,
  FiShield,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
  sellerRegistrationInputFields,
  initialSellerDetails,
  swalWithCustomConfiguration,
} from "../../utility/constant";
import { Button, Input } from "../../LIBS";
import { useTheme } from "../../Context/themeContext";
import { useAuth } from "../../Context/authContext";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const tabs = [
  {
    id: "businessInformation",
    value: "Business Information",
    helper: "Store identity, contact, and address details",
    icon: <FiBriefcase />,
  },
  {
    id: "legalInformation",
    value: "Legal Information",
    helper: "Business compliance and registration records",
    icon: <FiFileText />,
  },
  {
    id: "financialInformation",
    value: "Financial Information",
    helper: "Settlement account and payout information",
    icon: <FiCreditCard />,
  },
];

const SellerRegistrationPage = () => {
  const [sellerDetail, setSellerDetail] = useState(initialSellerDetails);
  const { theme } = useTheme();
  const { authToken } = useAuth();
  const [isDataSending, setIsDataSending] = useState(false);
  const [error, setError] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const currentTab = tabs[activeTab];
  const currentTabFields = sellerRegistrationInputFields?.filter(
    (field) => field?.tab === currentTab?.id
  );
  const completedTabs = tabs.filter((tab) => validateTabFields(tab.id, true)).length;

  function handleChange(e) {
    const { name, value } = e.target;
    setSellerDetail((prev) => ({ ...prev, [name]: value }));
    setError((prev) => ({ ...prev, [name]: null }));
  }

  function validateTabFields(currentTabId, silent = false) {
    const matchingFields = sellerRegistrationInputFields.filter(
      (field) => field?.tab === currentTabId
    );

    const nextErrors = {};
    let valid = true;

    matchingFields.forEach((field) => {
      const fieldError = field?.validationRule(sellerDetail[field?.name]);
      if (fieldError) {
        nextErrors[field?.name] = fieldError;
        valid = false;
      }
    });

    if (!silent) {
      setError((prev) => ({ ...prev, ...nextErrors }));
    }

    return valid;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const allValid = tabs.every((tab) => validateTabFields(tab?.id));
    if (!allValid) {
      return;
    }

    try {
      setIsDataSending(true);
      const response = await axios(`${SERVER_URL}/api/seller/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        data: sellerDetail,
      });

      if (response?.status === 201) {
        swalWithCustomConfiguration?.fire({
          title: "Seller Registration Successful!",
          text: "You have successfully registered as a seller.",
          icon: "success",
        });
        navigate("/");
      }
    } catch (requestError) {
      const { status, data } = requestError?.response || {};
      if (status === 400) {
        swalWithCustomConfiguration?.fire({
          title: "Seller Registration Failed!",
          text: data?.message,
          icon: "error",
        });
      } else {
        swalWithCustomConfiguration?.fire({
          title: "Something went wrong",
          text: "Please try again in a moment.",
          icon: "error",
        });
      }
    } finally {
      setIsDataSending(false);
    }
  }

  function handleTabChange(index) {
    if (index <= activeTab || validateTabFields(tabs[activeTab]?.id)) {
      setActiveTab(index);
    }
  }

  useEffect(() => {
    if (!authToken) {
      navigate("/login");
    }

    return () => {
      setSellerDetail(initialSellerDetails);
    };
  }, [authToken, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        isDark ? "bg-gray-900 text-white" : "bg-slate-50 text-gray-900"
      }`}
    >
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 tablet:px-6 laptop:px-8">
          <section
            className={`overflow-hidden rounded-[30px] border px-6 py-8 shadow-sm transition-all duration-300 mobile:px-4 ${
              isDark
                ? "border-gray-800 bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900"
                : "border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-sky-50"
            }`}
          >
            <div className="grid gap-6 laptop:grid-cols-[minmax(0,1.4fr)_360px] laptop:items-end">
              <div>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                    isDark
                      ? "bg-white/10 text-indigo-200"
                      : "bg-white text-indigo-600 shadow-sm"
                  }`}
                >
                  <FiShield />
                  Seller onboarding
                </span>
                <h1 className="mt-4 font-roboto text-4xl font-bold mobile:text-3xl">
                  Launch your seller profile with a cleaner, guided flow.
                </h1>
                <p
                  className={`mt-3 max-w-2xl text-sm leading-6 ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Complete your business, legal, and payout information in a single
                  polished application designed to feel consistent with the rest of
                  the storefront.
                </p>
              </div>

              <div
                className={`rounded-[26px] border p-5 ${
                  isDark ? "border-white/10 bg-white/5" : "border-white bg-white/85"
                }`}
              >
                <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Progress
                </p>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold">{completedTabs}/3</p>
                    <p className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Sections ready for review
                    </p>
                  </div>
                  <FiArrowRight className={isDark ? "text-indigo-300" : "text-indigo-500"} />
                </div>
                <div className={`mt-4 h-2 overflow-hidden rounded-full ${isDark ? "bg-white/10" : "bg-indigo-100"}`}>
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${(completedTabs / tabs.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-6 laptop:grid-cols-[300px_minmax(0,1fr)]">
            <aside
              className={`rounded-[28px] border p-4 shadow-sm ${
                isDark ? "border-gray-800 bg-gray-950/70" : "border-gray-200 bg-white"
              }`}
            >
              <div className="mb-4">
                <h2 className="font-roboto text-xl font-bold">Application Steps</h2>
                <p className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Move section by section and submit once everything looks right.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {tabs.map((item, index) => {
                  const isActive = activeTab === index;
                  const isComplete = validateTabFields(item.id, true);

                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => handleTabChange(index)}
                      className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-300 ${
                        isActive
                          ? isDark
                            ? "border-indigo-500 bg-indigo-500/10"
                            : "border-indigo-300 bg-indigo-50"
                          : isDark
                            ? "border-gray-800 bg-gray-900 hover:border-gray-700"
                            : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`mt-1 rounded-xl p-2 ${
                          isActive
                            ? "bg-indigo-500 text-white"
                            : isDark
                              ? "bg-gray-800 text-gray-300"
                              : "bg-white text-gray-600"
                        }`}
                      >
                        {isComplete ? <FiCheckCircle /> : item.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="font-roboto text-sm font-semibold">{item.value}</p>
                        <p
                          className={`mt-1 text-xs leading-5 ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {item.helper}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section
              className={`rounded-[28px] border shadow-sm ${
                isDark ? "border-gray-800 bg-gray-950/70" : "border-gray-200 bg-white"
              }`}
            >
              <div
                className={`border-b px-6 py-5 mobile:px-4 ${
                  isDark ? "border-gray-800" : "border-gray-200"
                }`}
              >
                <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                  Step {activeTab + 1}
                </p>
                <h2 className="mt-2 font-roboto text-2xl font-bold mobile:text-xl">
                  {currentTab?.value}
                </h2>
                <p className={`mt-2 text-sm leading-6 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  {currentTab?.helper}
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid gap-5 p-6 mobile:grid-cols-1 mobile:px-4 small-device:grid-cols-2 laptop:grid-cols-3">
                  {currentTabFields?.map((field) => (
                    <div
                      className={`rounded-2xl border p-4 transition-all duration-300 ${
                        error?.[field?.name]
                          ? "border-red-300 bg-red-50/70 dark:border-red-800"
                          : isDark
                            ? "border-gray-800 bg-gray-900"
                            : "border-gray-200 bg-gray-50"
                      }`}
                      key={field?.id}
                    >
                      <label
                        htmlFor={field?.name}
                        className="mb-2 block font-roboto text-sm font-semibold"
                      >
                        {field?.label}
                        {field?.required ? <span className="text-red-500"> *</span> : null}
                      </label>
                      <Input
                        type={field?.type}
                        id={field?.name}
                        name={field?.name}
                        placeholder={field?.placeholder}
                        className={`w-full rounded-xl border px-4 py-3 ${
                          error?.[field?.name]
                            ? "border-red-400 focus:border-red-500"
                            : isDark
                              ? "border-gray-700 bg-gray-950"
                              : "border-gray-200 bg-white"
                        }`}
                        value={sellerDetail?.[field?.name]}
                        onChange={handleChange}
                        maxLength={field?.maxLength || null}
                      />
                      <p className="mt-2 min-h-5 text-sm text-red-500">
                        {error?.[field?.name] || ""}
                      </p>
                    </div>
                  ))}
                </div>

                <div
                  className={`flex items-center justify-between border-t px-6 py-5 mobile:px-4 ${
                    isDark ? "border-gray-800" : "border-gray-200"
                  }`}
                >
                  <Button
                    btntext="Previous"
                    disabled={activeTab === 0}
                    className={`rounded-2xl px-5 py-3 ${
                      activeTab === 0
                        ? "cursor-not-allowed bg-gray-300 text-gray-500"
                        : isDark
                          ? "bg-gray-800 text-white hover:bg-gray-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    icon={<GrFormPrevious className="text-xl" />}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab((prev) => (prev > 0 ? prev - 1 : prev));
                    }}
                  />

                  <Button
                    btntext={activeTab !== tabs.length - 1 ? "Next Section" : "Submit Application"}
                    loading={isDataSending}
                    icon={<GrFormNext className="text-xl" />}
                    iconPosition="right"
                    onClick={(e) => {
                      e.preventDefault();
                      if (activeTab < tabs.length - 1) {
                        handleTabChange(activeTab + 1);
                      } else {
                        handleSubmit(e);
                      }
                    }}
                    className="rounded-2xl bg-indigo-600 px-5 py-3 text-white hover:bg-indigo-700"
                  />
                </div>
              </form>
            </section>
          </div>
        </div>
    </div>
  );
};

export default SellerRegistrationPage;

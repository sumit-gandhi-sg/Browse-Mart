import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { GrFormPrevious, GrFormNext } from "react-icons/gr";
import {
  sellerRegistrationInputFields,
  initialSellerDetails,
  swalWithCustomConfiguration,
} from "../../utility/constant";
import { Button, Input } from "../../LIBS";
import axios from "axios";
import { useTheme } from "../../Context/themeContext";
import { useAuth } from "../../Context/authContext";
import { useUser } from "../../Context/userContext";
const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const SellerRegistrationPage = () => {
  const [sellerDetail, setSellerDetail] = useState(initialSellerDetails);
  const { theme } = useTheme();
  const { userDetail } = useUser();
  const { authToken } = useAuth();
  const [isDataSending, setIsDataSending] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const tab = [
    { id: "businessInformation", value: "Business Information" },
    { id: "legalInformation", value: "Legal Information" },
    { id: "financialInformation", value: "Financial Information" },
  ];

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSellerDetail({ ...sellerDetail, [name]: value });
    setError((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // setIsSubmit(true);
    const allValid = tab.every((tab) => validateTabFields(tab?.id));
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
      const { data, status } = response;
      if (status === 201) {
        swalWithCustomConfiguration?.fire({
          title: "Seller Registration Successful!",
          text: "You have successfully registered as a seller.",
          icon: "success",
        });
        // navigate("/seller/dashboard");
        navigate("/");
      }
    } catch (error) {
      const { status, data } = error?.response;
      if (status === 400) {
        swalWithCustomConfiguration?.fire({
          title: "Seller Registration Failed!",
          text: data?.message,
          icon: "error",
        });
      }
    } finally {
      setIsDataSending(false);
      //   navigate("/seller/dashboard");
    }
  };

  const validateTabFields = (currentTab) => {
    const currentTabFields = sellerRegistrationInputFields.filter(
      (field) => field?.tab === currentTab
    );
    let valid = true;
    currentTabFields.forEach((field) => {
      const error = field?.validationRule(sellerDetail[field?.name]);
      if (error) {
        setError((prev) => ({
          ...prev,
          [field?.name]: error,
        }));
        valid = false;
      }
    });
    return valid;
  };

  const handleTabChange = (index) => {
    if (validateTabFields(tab[activeTab]?.id)) {
      setActiveTab(index);
    }
  };

  useEffect(() => {
    if (!authToken) {
      navigate("/login");
    }
    return () => {
      setSellerDetail(initialSellerDetails);
    };
  }, [authToken, navigate]);
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top on component mount
  }, []);
  return (
    <div
      className={` flex-1 flex justify-center  items-center transition-all duration-300 h-full ${
        theme === "dark"
          ? " bg-gray-900 text-white"
          : "bg-gray-200 text-gray-900"
      }`}
    >
      <div
        className={`rounded-lg m-8 w-full max-w-4xl mobile:m-0 mobile:mt-10 mobile:rounded-none small-device:m-8 small-device:rounded-lg mt-4 relative  ${
          theme === "dark" ? " bg-gray-800" : "bg-white"
        } transition-all duration-300`}
      >
        <h1 className="font-roboto text-center  text-gray-400 text-3xl m-3 p-4 font-semibold">
          Seller Registration
        </h1>
        <form action="" method="post">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 mobile:grid-cols-2 tablet:grid-cols-3">
              {tab.map((item, index) => (
                <span
                  key={item.id}
                  //   onClick={(e) => {
                  //     console.log(index);
                  //     e.preventDefault();
                  //     handleTabChange(index);
                  //   }}
                  className={`p-2 flex items-center border-y-2 font-roboto  border-r-2 last:border-r-0   mobile:last:col-span-2  mobile:last:border-t-0 mobile:last:flex mobile:last:justify-center  tablet:last:col-span-1 tablet:last:border-t-2  tablet:last:flex tablet:last:justify-start ${
                    activeTab === index
                      ? "text-bluetext-center bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent  text-lg font-medium  border-b-indigo-600 border-b-4"
                      : " "
                  }`}
                >
                  {item.value}
                </span>
              ))}
            </div>
            <div className="w-full grid  grid-1 p-4  gap-4 gap-y-7 mobile:text-sm mobile:grid-cols-2 small-device:grid-cols-2  tablet:text-base tablet:grid-cols-2 laptop:grid-cols-3">
              {sellerRegistrationInputFields
                ?.filter((field) => field?.tab === tab[activeTab]?.id)
                ?.map((field, index) => {
                  return (
                    <div
                      className="flex flex-col gap-2 relative"
                      key={field?.id}
                    >
                      <label htmlFor={field?.name}>
                        {field.label?.toCapitalize()}
                        {field?.required ? (
                          <span className="required"> *</span>
                        ) : (
                          ""
                        )}
                      </label>
                      <Input
                        type={field?.type}
                        id={field?.name}
                        name={field?.name}
                        placeholder={field?.placeholder?.toCapitalize()}
                        className={`p-2   rounded border-2  ${
                          theme === "dark"
                            ? "bg-gray-700 text-white border-gray-600 focus:border-gray-300"
                            : "text-gray-900 bg-gray-100 border-gray-300 focus:border-gray-600"
                        }`}
                        value={sellerDetail?.[field?.name]}
                        onChange={handleChange}
                        maxLength={field?.maxLength || null}
                      />
                      <p className="text-red-600 ">{error?.[field?.name]}</p>
                    </div>
                  );
                })}
            </div>
          </div>
          <div className="w-full p-3 flex  items-center justify-between ">
            <Button
              btntext={"Previous"}
              disabled={activeTab === 0}
              className="font-bold text-blue-500  py-2 px-3 rounded hover:cursor-pointer"
              icon={<GrFormPrevious className="text-xl font-bold" />}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab((prev) => (prev > 0 ? prev - 1 : prev));
              }}
            />
            <Button
              btntext={`${activeTab !== tab?.length - 1 ? "Next" : "Submit"}`}
              loading={isDataSending}
              icon={<GrFormNext className="text-xl hover:cursor-pointer   " />}
              onClick={(e) => {
                e.preventDefault();
                setIsSubmit(true);
                if (activeTab < tab.length - 1) {
                  handleTabChange(activeTab + 1);
                } else {
                  handleSubmit(e); // Submit when at last tab
                }
              }}
              className="   text-white px-3 py-2 rounded-md bg-gradient-to-r from-blue-500 to-purple-500"
              iconPosition="right"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerRegistrationPage;

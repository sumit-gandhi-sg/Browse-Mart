import React, { useEffect, useState } from "react";
import Button from "../../LIBS/Button";
import Input from "../../LIBS/Input";
import axios from "axios";
import { swalWithCustomConfiguration } from "../../utility/constant";
import defaultProileImage from "../../assets/images/maleprofileicon.jpg";
import { useAuth } from "../../Context/authContext";
import { useUser } from "../../Context/userContext";
import { useTheme } from "../../Context/themeContext";
import { Loader } from "../../LIBS";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const initialShippingAddress = {
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pinCode: "",
  country: "",
};

const Profile = () => {
  const [profileDetails, setProfileDetails] = useState();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [shippingForm, setShippingForm] = useState(initialShippingAddress);
  const [isShippingUpdating, setIsShippingUpdating] = useState(false);
  const { authToken } = useAuth();
  const { userDetail, setUserDetail } = useUser();
  const { theme } = useTheme();

  const getProfileDetails = async () => {
    setIsProfileLoading(true);
    try {
      const response = await axios({
        method: "post",
        url: `${SERVER_URL}/api/user/profile`,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Authorization: `Bearer ${authToken}`,
        },
      });

      setUserDetail(response?.data?.userDetail);
    } catch (error) {
      console.log(error);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    const name = e.target.name;
    if (name === "phoneNumber") {
      if (value?.length <= 11) {
        setProfileDetails((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setProfileDetails((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsUpdating(true);
    updateProfile();
  };

  const updateProfile = async () => {
    axios({
      method: "post",
      url: `${SERVER_URL}/api/user/update-profile`,
      headers: { Authorization: `Bearer ${authToken}` },
      data: profileDetails,
    })
      .then((response) => {
        setUserDetail((prev) => ({
          ...prev,
          ...response?.data?.updatedUser,
        }));
        setIsUpdating(false);
        setIsEditing(false);
      })
      .catch((error) => {
        const { data, status } = error?.response;
        swalWithCustomConfiguration?.fire(
          `Oops! Error ${status}`,
          data?.message,
          "error"
        );
        setIsUpdating(false);
        console.log(error);
      });
  };

  useEffect(() => {
    if (userDetail) {
      setProfileDetails(userDetail);
      setShippingForm({
        addressLine1: userDetail?.shippingAddress?.addressLine1 || "",
        addressLine2:
          userDetail?.shippingAddress?.addressLine2 ||
          userDetail?.shippingAddress?.adressLine2 ||
          "",
        city: userDetail?.shippingAddress?.city || "",
        state: userDetail?.shippingAddress?.state || "",
        pinCode: userDetail?.shippingAddress?.pinCode || "",
        country: userDetail?.shippingAddress?.country || "",
      });
    }
  }, [userDetail]);

  useEffect(() => {
    const hasResolvedProfile =
      userDetail?.id && typeof userDetail?.email !== "undefined";

    if (authToken && !hasResolvedProfile) {
      getProfileDetails();
    }
  }, [authToken, userDetail]);

  const handleShippingChange = (e) => {
    const { name, value, checked, type } = e.target;
    setShippingForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleShippingSave = async (e) => {
    e.preventDefault();
    setIsShippingUpdating(true);

    try {
      const response = await axios({
        method: "post",
        url: `${SERVER_URL}/api/user/update-shipping-address`,
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          shippingAddress: shippingForm,
        },
      });

      setUserDetail((prev) => ({
        ...prev,
        shippingAddress: response?.data?.shippingAddress,
      }));
    } catch (error) {
      const { data, status } = error?.response || {};
      swalWithCustomConfiguration?.fire(
        `Oops! Error ${status || 500}`,
        data?.message || "Failed to update shipping address",
        "error"
      );
    } finally {
      setIsShippingUpdating(false);
    }
  };

  if (isProfileLoading && !profileDetails) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center ${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-blue-100 text-blue-500"
        }`}
      >
        <Loader />
      </div>
    );
  }

  return (
    <div
      className={`w-11/12 h-full relative flex items-center ${
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-blue-100 text-blue-500"
      }`}
    >
      <form className="w-full h-full relative flex flex-col overflow-y-scroll items-center justify-between p-2 gap-6">
        <div
          className={
            "w-full h-max top-10 flex flex-col items-center gap-4 relative "
          }
        >
          <div className="h-40 w-40 rounded-full overflow-hidden ">
            <img
              src={profileDetails?.profilePic || defaultProileImage}
              alt="User Avatar"
              className=""
            />
          </div>
          <div className=" profile-detail w-10/12 font-roboto text-lg flex flex-col gap-3  break-words">
            <div className="flex gap-2 w-full p-1 items-center">
              <label
                htmlFor="name "
                className={`w-1/3 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-300"
                }`}
              >
                Name:
              </label>
              {isEditing ? (
                <Input
                  id={"name"}
                  name={"name"}
                  value={profileDetails?.name || ""}
                  placeholder={"Enter Name"}
                  className={
                    "px-2 py-1 bg-gray-100  border-gray-300 border-2 w-2/3 text-left font-semibold rounded text-gray-900"
                  }
                  onChange={handleChange}
                />
              ) : (
                <p className="name w-2/3 text-left font-semibold" id="name">
                  {profileDetails?.name?.toCapitalize() || "N/A"}
                </p>
              )}
            </div>
            <div className="flex gap-2 w-full p-1 items-center">
              <label
                htmlFor="email"
                className={`w-1/3 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-300"
                }`}
              >
                Email:
              </label>
              {isEditing ? (
                <Input
                  id={"email"}
                  name={"email"}
                  value={profileDetails?.email || ""}
                  className={
                    "px-2 py-1 bg-gray-100  border-gray-300 border-2 w-2/3 text-left font-semibold rounded text-gray-900"
                  }
                  placeholder={"Enter Email"}
                  onChange={handleChange}
                />
              ) : (
                <p
                  id="email"
                  className="w-2/3 text-left font-semibold break-words overflow-hidden "
                >
                  {profileDetails?.email || "N/A"}
                </p>
              )}
            </div>
            <div className="flex gap-2 w-full p-1 items-center">
              <label
                htmlFor="phoneNumber"
                className={`w-1/3 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-300"
                }`}
              >
                Phone No:
              </label>
              {isEditing ? (
                <Input
                  id={"phoneNumber"}
                  name={"phoneNumber"}
                  value={profileDetails?.phoneNumber || ""}
                  className={
                    "px-2 py-1 bg-gray-100 border-gray-300 border-2 w-2/3 text-left font-semibold rounded text-gray-900"
                  }
                  placeholder={"Enter Phone Number"}
                  onChange={handleChange}
                />
              ) : (
                <p id="phoneNumber" className=" w-2/3 text-left font-semibold">
                  {profileDetails?.phoneNumber || "N/A"}
                </p>
              )}
            </div>

            <div className="flex gap-2 w-full p-1 items-center">
              <label
                htmlFor="address"
                className={`w-1/3 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-300"
                }`}
              >
                Address:
              </label>
              {isEditing ? (
                <Input
                  id={"address"}
                  name={"address"}
                  value={profileDetails?.address || ""}
                  className={
                    "px-2 py-1 bg-gray-100 border-gray-300 border-2 w-2/3 text-left font-semibold rounded break-words overflow-hidden text-gray-900"
                  }
                  placeholder={"Enter Address"}
                  onChange={handleChange}
                />
              ) : (
                <p
                  id="address"
                  className=" w-2/3 text-left font-semibold break-words overflow-hidden "
                >
                  {profileDetails?.address || "N/A"}
                </p>
              )}
            </div>
          </div>

          <div className="w-10/12 border-t border-white/20 pt-4">
            <div className="flex flex-col gap-4">
              <div className="text-left">
                <h3 className="text-xl font-semibold">Shipping Address</h3>
                <p className="text-sm text-gray-300">
                  Keep one saved shipping address here. If you change it, the
                  old address will be overwritten.
                </p>
              </div>

              <div
                className={`rounded-lg p-3 ${
                  theme === "dark" ? "bg-gray-800" : "bg-white text-gray-900"
                }`}
              >
                {userDetail?.shippingAddress?.addressLine1 ? (
                  <div
                    className={`mb-4 rounded-lg border p-3 text-sm ${
                      theme === "dark"
                        ? "border-gray-700 bg-gray-900 text-gray-200"
                        : "border-blue-200 bg-blue-50 text-gray-900"
                    }`}
                  >
                    <p className="font-semibold">Current saved address</p>
                    <p>{userDetail?.shippingAddress?.addressLine1}</p>
                    {userDetail?.shippingAddress?.addressLine2 ? (
                      <p>{userDetail?.shippingAddress?.addressLine2}</p>
                    ) : null}
                    <p>
                      {userDetail?.shippingAddress?.city},{" "}
                      {userDetail?.shippingAddress?.state}
                    </p>
                    <p>
                      {userDetail?.shippingAddress?.country} -{" "}
                      {userDetail?.shippingAddress?.pinCode}
                    </p>
                  </div>
                ) : (
                  <div className="mb-4 text-sm text-gray-300">
                    No shipping address saved yet.
                  </div>
                )}

                <div className="grid gap-3 small-device:grid-cols-2">
                  <Input
                    name="addressLine1"
                    value={shippingForm.addressLine1}
                    placeholder="Address Line 1"
                    className="text-gray-900"
                    onChange={handleShippingChange}
                  />
                  <Input
                    name="addressLine2"
                    value={shippingForm.addressLine2}
                    placeholder="Address Line 2"
                    className="text-gray-900"
                    onChange={handleShippingChange}
                  />
                  <Input
                    name="city"
                    value={shippingForm.city}
                    placeholder="City"
                    className="text-gray-900"
                    onChange={handleShippingChange}
                  />
                  <Input
                    name="state"
                    value={shippingForm.state}
                    placeholder="State"
                    className="text-gray-900"
                    onChange={handleShippingChange}
                  />
                  <Input
                    name="country"
                    value={shippingForm.country}
                    placeholder="Country"
                    className="text-gray-900"
                    onChange={handleShippingChange}
                  />
                  <Input
                    name="pinCode"
                    value={shippingForm.pinCode}
                    placeholder="Pin Code"
                    className="text-gray-900"
                    onChange={handleShippingChange}
                  />
                </div>

                <div className="mt-3">
                  <Button
                    btntext="Update Shipping Address"
                    loading={isShippingUpdating}
                    className="rounded bg-indigo-600 px-4 py-2 text-white"
                    onClick={handleShippingSave}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className=" absolute bottom-3  right-2 flex gap-3">
          <Button
            btntext={isEditing ? "Cancel" : "Edit"}
            className={
              "bg-blue-300 px-3 py-1 text-lg text-blue-100 font-roboto hover:bg-blue-500 hover:text-white outline-none border-none rounded"
            }
            onClick={(e) => {
              e.preventDefault();
              setIsEditing((prev) => !prev);
              if (isEditing) {
                setProfileDetails(userDetail);
              }
            }}
          />
          {isEditing ? (
            <Button
              btntext={"Save"}
              onClick={handleSubmit}
              loading={isUpdating}
              className="bg-blue-500 px-3 py-1 text-lg text-blue-100 font-roboto hover:bg-blue-500 hover:text-white outline-none border-none rounded"
            />
          ) : (
            ""
          )}
        </div>
      </form>
    </div>
  );
};

export default Profile;

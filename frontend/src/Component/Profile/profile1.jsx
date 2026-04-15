import { useEffect, useState } from "react";
import axios from "axios";
import { FaBox, FaHeart, FaUser } from "react-icons/fa";
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../Context/themeContext";
import { useAuth } from "../../Context/authContext";
import { useUser } from "../../Context/userContext";
import { OrdersContainer, WishListContainer } from "./index";
import Button from "../../LIBS/Button";
import Input from "../../LIBS/Input";
import { swalWithCustomConfiguration } from "../../utility/constant";
import defaultProileImage from "../../assets/images/maleprofileicon.jpg";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const tabs = [
  { icon: FaUser, tab: "overview", label: "Profile Overview" },
  { icon: FaBox, tab: "orders", label: "Orders" },
  { icon: FaHeart, tab: "wishlist", label: "Wishlist" },
];

const Profile1 = () => {
  const { theme } = useTheme();
  const { authToken } = useAuth();
  const { userDetail } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = `/login?redirect=${encodeURIComponent(location?.pathname)}`;
  const userName = userDetail?.name?.toCapitalize?.() || "My Account";

  useEffect(() => {
    if (!authToken) {
      navigate(redirect);
    }
  }, [authToken, navigate, redirect]);

  return (
    <div
      className={`flex min-h-screen ${
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-900"
      } transition-all duration-300`}
    >
      <aside
        className={`hidden w-64 shrink-0 p-6 shadow-md small-device:block ${
          theme === "dark" ? "bg-gray-950" : "bg-white"
        }`}
      >
        <div className="text-center">
          <div className="mx-auto h-16 w-16 overflow-hidden rounded-full">
            <img
              src={userDetail?.profilePic || defaultProileImage}
              alt={userName}
              className="h-full w-full object-cover"
            />
          </div>
          <h2 className="mt-2 text-lg font-semibold">{userName}</h2>
          <p className="text-sm text-gray-500">
            {userDetail?.email || "Manage your profile"}
          </p>
        </div>

        <nav className="mt-6 space-y-3">
          {tabs.map(({ icon: Icon, tab, label }) => (
            <NavLink
              key={tab}
              to={`/profile/${tab}`}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : theme === "dark"
                    ? "text-gray-300 hover:bg-gray-800"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1">
        <div
          className={`flex gap-2 overflow-x-auto p-3 small-device:hidden ${
            theme === "dark" ? "bg-gray-950" : "bg-white"
          }`}
        >
          {tabs.map(({ icon: Icon, tab, label }) => (
            <NavLink
              key={tab}
              to={`/profile/${tab}`}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : theme === "dark"
                    ? "bg-gray-800 text-gray-300"
                    : "bg-gray-200 text-gray-700"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        <Outlet />
      </main>
    </div>
  );
};

export const ProfileOverviewPage = () => {
  const { theme } = useTheme();
  const { authToken } = useAuth();
  const { userDetail, setUserDetail } = useUser();
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
  });
  const [shippingForm, setShippingForm] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pinCode: "",
    country: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isShippingEditing, setIsShippingEditing] = useState(false);
  const [isShippingUpdating, setIsShippingUpdating] = useState(false);

  useEffect(() => {
    setProfileForm({
      name: userDetail?.name || "",
      email: userDetail?.email || "",
      phoneNumber: userDetail?.phoneNumber || "",
      address: userDetail?.address || "",
    });

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
  }, [userDetail]);

  const nameParts = profileForm?.name?.split(" ") || [];
  const firstName = nameParts?.[0] || "N/A";
  const lastName = nameParts?.slice(1)?.join(" ") || "N/A";

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phoneNumber" && value.length > 11) {
      return;
    }

    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const response = await axios({
        method: "post",
        url: `${SERVER_URL}/api/user/update-profile`,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: profileForm,
      });

      setUserDetail((prev) => ({
        ...prev,
        ...response?.data?.updatedUser,
      }));
      setIsEditing(false);
    } catch (error) {
      const { data, status } = error?.response || {};
      swalWithCustomConfiguration?.fire(
        `Oops! Error ${status || 500}`,
        data?.message || "Something went wrong",
        "error"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;

    setShippingForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleShippingSave = async (e) => {
    e.preventDefault();
    setIsShippingUpdating(true);

    try {
      const response = await axios({
        method: "post",
        url: `${SERVER_URL}/api/user/update-shipping-address`,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: {
          shippingAddress: shippingForm,
        },
      });

      setUserDetail((prev) => ({
        ...prev,
        shippingAddress: response?.data?.shippingAddress,
      }));
      setIsShippingEditing(false);
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

  const handleCancel = () => {
    setProfileForm({
      name: userDetail?.name || "",
      email: userDetail?.email || "",
      phoneNumber: userDetail?.phoneNumber || "",
      address: userDetail?.address || "",
    });
    setIsEditing(false);
  };

  const handleShippingCancel = () => {
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
    setIsShippingEditing(false);
  };

  return (
    <main className="flex-1 p-6">
      <div className="flex flex-col gap-3 small-device:flex-row small-device:items-center small-device:justify-between">
        <h1 className="text-2xl font-semibold">Profile Overview</h1>
        <div className="flex gap-3">
          <Button
            btntext={isEditing ? "Cancel" : "Edit"}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              isEditing
                ? theme === "dark"
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
            onClick={(e) => {
              e.preventDefault();
              if (isEditing) {
                handleCancel();
              } else {
                setIsEditing(true);
              }
            }}
          />
          {isEditing && (
            <Button
              btntext="Save"
              loading={isUpdating}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              onClick={handleSave}
            />
          )}
        </div>
      </div>

      <SectionTitle title="Personal Information" />
      <div
        className={`grid grid-cols-1 gap-4 rounded-lg p-4 shadow-md small-device:grid-cols-2 ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <InputField
          label="First Name"
          value={firstName}
          theme={theme}
          editable={false}
        />
        <InputField
          label="Last Name"
          value={lastName}
          theme={theme}
          editable={false}
        />
        <InputField
          label="Email"
          value={profileForm?.email}
          theme={theme}
          editable={isEditing}
          name="email"
          onChange={handleChange}
        />
        <InputField
          label="Phone"
          value={profileForm?.phoneNumber}
          theme={theme}
          editable={isEditing}
          name="phoneNumber"
          onChange={handleChange}
        />
      </div>

      <SectionTitle title="Saved Addresses" />
      <div className="grid grid-cols-1 gap-4 small-device:grid-cols-2">
        <AddressCard
          title="Home"
          address={profileForm?.address || ""}
          theme={theme}
          editable={isEditing}
          name="address"
          onChange={handleChange}
        />
        <AddressCard
          title="Primary Address"
          address={profileForm?.address || ""}
          theme={theme}
          editable={false}
        />
      </div>

      <SectionTitle title="Shipping Address" />
      <div
        className={`rounded-lg p-4 shadow-md ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="mb-4 flex flex-col gap-3 small-device:flex-row small-device:items-center small-device:justify-between">
          <p
            className={`text-sm ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Saved shipping address for checkout.
          </p>
          <div className="flex gap-3">
            <Button
              btntext={isShippingEditing ? "Cancel" : "Edit"}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                isShippingEditing
                  ? theme === "dark"
                    ? "bg-gray-700 text-white hover:bg-gray-600"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
              onClick={(e) => {
                e.preventDefault();
                if (isShippingEditing) {
                  handleShippingCancel();
                } else {
                  setIsShippingEditing(true);
                }
              }}
            />
            {isShippingEditing && (
              <Button
                btntext="Save"
                loading={isShippingUpdating}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                onClick={handleShippingSave}
              />
            )}
          </div>
        </div>

        {userDetail?.shippingAddress?.addressLine1 ? (
          <div
            className={`mb-4 rounded-lg border p-3 text-sm ${
              theme === "dark"
                ? "border-gray-700 bg-gray-900 text-gray-200"
                : "border-blue-200 bg-blue-50 text-gray-900"
            }`}
          >
            <p className="font-semibold">Current saved shipping address</p>
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
          <p
            className={`mb-4 text-sm ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            No shipping address saved yet.
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 small-device:grid-cols-2">
          <InputField
            label="Address Line 1"
            value={shippingForm?.addressLine1}
            theme={theme}
            editable={isShippingEditing}
            name="addressLine1"
            onChange={handleShippingChange}
          />
          <InputField
            label="Address Line 2"
            value={shippingForm?.addressLine2}
            theme={theme}
            editable={isShippingEditing}
            name="addressLine2"
            onChange={handleShippingChange}
          />
          <InputField
            label="City"
            value={shippingForm?.city}
            theme={theme}
            editable={isShippingEditing}
            name="city"
            onChange={handleShippingChange}
          />
          <InputField
            label="State"
            value={shippingForm?.state}
            theme={theme}
            editable={isShippingEditing}
            name="state"
            onChange={handleShippingChange}
          />
          <InputField
            label="Pin Code"
            value={shippingForm?.pinCode}
            theme={theme}
            editable={isShippingEditing}
            name="pinCode"
            onChange={handleShippingChange}
          />
          <InputField
            label="Country"
            value={shippingForm?.country}
            theme={theme}
            editable={isShippingEditing}
            name="country"
            onChange={handleShippingChange}
          />
        </div>
      </div>
    </main>
  );
};

export const ProfileOrdersPage = () => <OrdersContainer />;

export const ProfileWishlistPage = () => {
  const { authToken } = useAuth();
  return <WishListContainer authToken={authToken} />;
};

export const ProfileIndexRedirect = () => <Navigate to="overview" replace />;

const SectionTitle = ({ title }) => (
  <h2 className="mb-2 mt-6 text-lg font-semibold">{title}</h2>
);

const InputField = ({ label, value, theme, editable = false, name, onChange }) => (
  <div>
    <label
      className={`block text-sm font-medium ${
        theme === "dark" ? "text-gray-300" : "text-gray-700"
      }`}
    >
      {label}
    </label>
    {editable ? (
      <Input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 w-full"
      />
    ) : (
      <input
        type="text"
        value={value}
        readOnly
        className={`mt-1 w-full rounded-md border p-2 ${
          theme === "dark"
            ? "border-gray-700 bg-gray-900 text-white"
            : "bg-gray-100 text-gray-900"
        }`}
      />
    )}
  </div>
);

const AddressCard = ({
  title,
  address,
  theme,
  editable = false,
  name,
  onChange,
}) => (
  <div
    className={`relative rounded-lg p-4 shadow-md ${
      theme === "dark" ? "bg-gray-800" : "bg-white"
    }`}
  >
    <h3 className="font-semibold">{title}</h3>
    {editable ? (
      <Input
        type="text"
        name={name}
        value={address}
        onChange={onChange}
        placeholder="Enter address"
        className="mt-3 w-full"
      />
    ) : (
      <p
        className={`mt-1 text-sm ${
          theme === "dark" ? "text-gray-300" : "text-gray-600"
        }`}
      >
        {address || "No address added yet"}
      </p>
    )}
  </div>
);

export default Profile1;

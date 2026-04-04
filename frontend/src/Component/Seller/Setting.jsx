import { useState } from "react";
import { useTheme } from "../../Context/themeContext";
import { Button, Input, SectionTitle, TextArea } from "../../LIBS";

const Setting = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    businessName: "",
    supportEmail: "",
    supportPhone: "",
    website: "",
    address: "",
    taxLabel: "GST",
    currency: "INR",
    lowStockThreshold: "10",
    orderAutoConfirm: false,
    sendOrderEmail: true,
    sendStockAlert: true,
    weeklyReport: false,
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div
      className={`w-full max-w-full overflow-x-hidden ${
        theme === "dark" ? "text-white" : "text-gray-900"
      } transition-all duration-300`}
    >
      <SectionTitle title="Settings" />
      <p className="text-gray-500 mt-2">
        Manage your store information, preferences, and notifications.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-6">
        <div
          className={`rounded-xl border p-5 ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          <h3 className="text-lg font-semibold">Business Profile</h3>
          <div className="mt-4 grid grid-cols-1 small-device:grid-cols-2 gap-4">
            <Input
              name="businessName"
              placeholder="Business Name"
              value={formData.businessName}
              onChange={handleChange}
            />
            <Input
              name="website"
              placeholder="Website URL"
              value={formData.website}
              onChange={handleChange}
            />
            <Input
              type="email"
              name="supportEmail"
              placeholder="Support Email"
              value={formData.supportEmail}
              onChange={handleChange}
            />
            <Input
              name="supportPhone"
              placeholder="Support Phone"
              value={formData.supportPhone}
              onChange={handleChange}
            />
          </div>

          <TextArea
            name="address"
            placeholder="Store Address"
            value={formData.address}
            onChange={handleChange}
            rows={4}
            className={`mt-4 w-full rounded-md border-2 p-3 outline-none ${
              theme === "dark"
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-gray-100 text-gray-900 border-gray-300"
            }`}
          />
        </div>

        <div
          className={`rounded-xl border p-5 ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          <h3 className="text-lg font-semibold">Store Preferences</h3>
          <div className="mt-4 grid grid-cols-1 small-device:grid-cols-3 gap-4">
            <Input
              name="currency"
              placeholder="Currency"
              value={formData.currency}
              onChange={handleChange}
            />
            <Input
              name="taxLabel"
              placeholder="Tax Label"
              value={formData.taxLabel}
              onChange={handleChange}
            />
            <Input
              type="number"
              name="lowStockThreshold"
              placeholder="Low Stock Threshold"
              value={formData.lowStockThreshold}
              onChange={handleChange}
            />
          </div>

          <div className="mt-5 grid grid-cols-1 small-device:grid-cols-2 gap-4">
            <label
              className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-900"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <span>Auto confirm new orders</span>
              <input
                type="checkbox"
                name="orderAutoConfirm"
                checked={formData.orderAutoConfirm}
                onChange={handleChange}
                className="h-4 w-4"
              />
            </label>
            <label
              className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-900"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <span>Email when order placed</span>
              <input
                type="checkbox"
                name="sendOrderEmail"
                checked={formData.sendOrderEmail}
                onChange={handleChange}
                className="h-4 w-4"
              />
            </label>
          </div>
        </div>

        <div
          className={`rounded-xl border p-5 ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          <h3 className="text-lg font-semibold">Notifications</h3>
          <div className="mt-4 grid grid-cols-1 small-device:grid-cols-2 gap-4">
            <label
              className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-900"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <span>Low stock alerts</span>
              <input
                type="checkbox"
                name="sendStockAlert"
                checked={formData.sendStockAlert}
                onChange={handleChange}
                className="h-4 w-4"
              />
            </label>

            <label
              className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-900"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <span>Weekly performance report</span>
              <input
                type="checkbox"
                name="weeklyReport"
                checked={formData.weeklyReport}
                onChange={handleChange}
                className="h-4 w-4"
              />
            </label>
          </div>
        </div>

        <div
          className={`rounded-xl border p-5 ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          <h3 className="text-lg font-semibold">Security</h3>
          <div className="mt-4 grid grid-cols-1 small-device:grid-cols-3 gap-4">
            <Input type="password" placeholder="Current Password" />
            <Input type="password" placeholder="New Password" />
            <Input type="password" placeholder="Confirm Password" />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pb-8">
          <Button
            type="submit"
            btntext="Save Changes"
            className="rounded-md bg-purple-600 px-5 py-2 text-white hover:bg-purple-700"
          />
          <Button
            btntext="Reset"
            className={`rounded-md px-5 py-2 ${
              theme === "dark"
                ? "bg-gray-700 text-white"
                : "bg-gray-200 text-gray-900"
            }`}
            onClick={() =>
              setFormData({
                businessName: "",
                supportEmail: "",
                supportPhone: "",
                website: "",
                address: "",
                taxLabel: "GST",
                currency: "INR",
                lowStockThreshold: "10",
                orderAutoConfirm: false,
                sendOrderEmail: true,
                sendStockAlert: true,
                weeklyReport: false,
              })
            }
          />
        </div>
      </form>
    </div>
  );
};
export default Setting;

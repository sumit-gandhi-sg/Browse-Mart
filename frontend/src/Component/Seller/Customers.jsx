import axios from "axios";
import { useEffect, useState } from "react";
import { useTheme } from "../../Context/themeContext";
import { useAuth } from "../../Context/authContext";
import { Button, Loader, SectionTitle, ServerError } from "../../LIBS";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const Customers = () => {
  const { theme } = useTheme();
  const { authToken } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [customerCount, setCustomerCount] = useState(0);
  const [customerRange, setCustomerRange] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const visiblePages = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  )
    .filter((page) => page >= Math.max(1, currentPage - 1))
    .filter((page) => page <= Math.min(totalPages, currentPage + 1));

  const getSellerCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(`${SERVER_URL}/api/seller/customers`, {
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          Authorization: `Bearer ${authToken}`,
        },
        params: {
          page: currentPage,
        },
      });

      setCustomers(response?.data?.customers || []);
      setTotalPages(response?.data?.totalPages || 1);
      setCustomerCount(response?.data?.totalCustomers || 0);
      setCustomerRange({
        startCustomerIndex: response?.data?.startCustomerIndex || 0,
        endCustomerIndex: response?.data?.endCustomerIndex || 0,
      });
    } catch (fetchError) {
      setError(
        fetchError?.response?.data?.message || "Unable to fetch customers",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      getSellerCustomers();
    }
  }, [authToken, currentPage]);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <ServerError />;
  }

  return (
    <div
      className={`w-full max-w-full overflow-x-hidden ${
        theme === "dark" ? "text-white" : "text-gray-900"
      } transition-all duration-300`}
    >
      <SectionTitle title="Customers" />

      <p className="text-gray-500 mt-2">
        All distinct customers for your store
      </p>

      <div className="mt-6 space-y-4 pb-24">
        <div className="w-full max-w-full overflow-hidden rounded-lg">
          <div className="w-full max-w-full overflow-x-auto">
            <table className="min-w-[760px] w-full text-left border-collapse">
              <thead>
                <tr
                  className={`${
                    theme === "dark"
                      ? "bg-gray-700 text-white"
                      : "bg-gray-200 text-gray-900"
                  } transition-all duration-300`}
                >
                  <th className="p-3">Customer</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Total Orders</th>
                  <th className="p-3">Last Order</th>
                  <th className="p-3">Last Order Date</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer?._id} className="border-b">
                    <td className="p-3 font-semibold">
                      {customer?.name || "Unknown Customer"}
                    </td>
                    <td className="p-3 text-gray-500 break-all">
                      {customer?.email || "No email"}
                    </td>
                    <td className="p-3 text-gray-500">
                      {customer?.phoneNumber || "No phone number"}
                    </td>
                    <td className="p-3">{customer?.totalOrders || 0}</td>
                    <td className="p-3">{customer?.lastOrderId || "-"}</td>
                    <td className="p-3 text-gray-500">
                      {customer?.lastOrderDate
                        ? new Date(customer?.lastOrderDate).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}

                {customers.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan="6" className="p-5 text-center">
                      No customers yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div
          className={`sticky bottom-0 z-10 mt-4 flex items-center justify-between gap-4 border-t px-3 py-3 mobile:flex-col small-device:flex-row ${
            theme === "dark"
              ? "border-gray-700 bg-gray-900/95"
              : "border-gray-200 bg-gray-100/95"
          } backdrop-blur`}
        >
          <p className="text-gray-500">
            Showing {customerRange?.startCustomerIndex} to{" "}
            {customerRange?.endCustomerIndex} of {customerCount} results
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              className={`px-3 py-1 rounded-md disabled:opacity-50 ${
                theme === "dark"
                  ? "bg-gray-700 text-white"
                  : "bg-gray-300 text-gray-900"
              }`}
              btntext="Previous"
              onClick={() =>
                setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))
              }
              disabled={currentPage === 1}
            />

            {currentPage > 2 && (
              <>
                <Button
                  className={`px-3 py-1 rounded-md ${
                    theme === "dark"
                      ? "bg-gray-700 text-white"
                      : "bg-gray-300 text-gray-900"
                  }`}
                  btntext={1}
                  onClick={() => setCurrentPage(1)}
                />
                {currentPage > 3 && <span className="px-1 py-1">...</span>}
              </>
            )}

            {visiblePages.map((page) => (
              <Button
                className={`px-3 py-1 rounded-md ${
                  page === currentPage
                    ? "bg-purple-600 text-white"
                    : theme === "dark"
                      ? "bg-gray-700 text-white"
                      : "bg-gray-300 text-gray-900"
                }`}
                key={page}
                btntext={page}
                onClick={() => setCurrentPage(page)}
              />
            ))}

            {currentPage < totalPages - 1 && (
              <>
                {currentPage < totalPages - 2 && (
                  <span className="px-1 py-1">...</span>
                )}
                <Button
                  className={`px-3 py-1 rounded-md ${
                    theme === "dark"
                      ? "bg-gray-700 text-white"
                      : "bg-gray-300 text-gray-900"
                  }`}
                  btntext={totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                />
              </>
            )}

            <Button
              className={`px-3 py-1 rounded-md disabled:opacity-50 ${
                theme === "dark"
                  ? "bg-gray-700 text-white"
                  : "bg-gray-300 text-gray-900"
              }`}
              btntext="Next"
              onClick={() => {
                setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
              }}
              disabled={currentPage === totalPages}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Customers;

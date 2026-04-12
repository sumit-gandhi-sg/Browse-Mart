import React, { useEffect, useState } from "react";
import { useTheme } from "../../Context/themeContext";
import { SideBar } from "../../LIBS";
import { useAuth } from "../../Context/authContext";
import { Outlet, useNavigate } from "react-router-dom";

const AdminLayout = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const { authToken } = useAuth();

  const tabs = [
    {
      id: 1,
      name: "Dashboard",
      icon: "",
      navigate: "",
    },
    {
      id: 2,
      name: "Users Directory",
      icon: "",
      navigate: "users",
    },
    {
      id: 3,
      name: "Global Inventory",
      icon: "",
      navigate: "products",
    },
    {
      id: 4,
      name: "Categories",
      icon: "",
      navigate: "categories",
    },
  ];

  useEffect(() => {
    if (!authToken) {
      navigate("/login");
    }
  }, [authToken, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0); 
  }, []);

  return (
    <div
      className={`${
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-900"
      } min-h-screen overflow-x-hidden w-full max-w-[100vw] transition-all duration-300 mobile:text-xs tablet:text-base flex font-roboto `}
    >
      {/* Integrated Sidebar Component matching Seller layout */}
      <SideBar title="Admin Panel" activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />
      
      {/* Fluid Main Content */}
      <div className="flex-1 min-w-0 p-6 mobile:p-1 tablet:p-6 transition-all duration-300 overflow-x-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;

import React, { useEffect, useState } from "react";
import { useTheme } from "../../Context/themeContext";

import { Settings } from "lucide-react";
import { SideBar } from "../../LIBS";

import { useAuth } from "../../Context/authContext";
import { Outlet, useNavigate } from "react-router-dom";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const SlidingButton = () => {
  const [isSliding, setIsSliding] = useState(false);

  const handleClick = () => {
    setIsSliding((prev) => !prev);
  };

  return (
    <div className="relative w-full h-20 flex items-center justify-center">
      <button
        className={`absolute px-6 py-2 text-white font-semibold rounded-md shadow-md transition-transform duration-500 ${
          isSliding
            ? "translate-x-full bg-green-500"
            : "translate-x-0 bg-blue-500"
        }`}
        onClick={handleClick}
      >
        {isSliding ? "Slide Left" : "Slide Right"}
      </button>
    </div>
  );
};

const SellerLayout = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const { authToken } = useAuth();

  const tabs = [
    {
      id: 1,
      name: "Dashboard",
      icon: "",
      navigate: "dashboard",
    },
    {
      id: 2,
      name: "Products",
      icon: "",
      navigate: "products",
    },
    {
      id: 3,
      name: "Orders",
      icon: "",
      navigate: "orders",
    },
    {
      id: 4,
      name: "Cutomers",
      icon: "",
      // redirect: "/",
      navigate: "customers",
    },
    // {
    //   id: 5,
    //   name: "Setting",
    //   icon: Settings,
    //   navigate: "setting",
    // },
  ];
  // const ActiveTabComponent = tabs[activeTab]?.component;
  useEffect(() => {
    if (!authToken) {
      console.log("authToken", authToken);
      navigate("/login");
    }
  }, [authToken, navigate]);
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top on component mount
  }, []);

  return (
    <div
      className={`${
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-900"
      } h-screen overflow-hidden transition-all duration-300 mobile:text-xs tablet:text-base flex font-roboto `}
    >
      {/* Sidebar */}
      <SideBar activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />
      {/* Main Content */}
      <div className="flex-1 p-6 mobile:p-1 tablet:p-6 transition-all duration-300 overflow-y-auto overscroll-contain">
        <Outlet />
      </div>
    </div>
  );
};

export default SellerLayout;

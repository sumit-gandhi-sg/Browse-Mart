import React, { useState } from "react";
import { useTheme } from "../Context/themeContext";
import { MdClose } from "react-icons/md";
import { RxHamburgerMenu } from "react-icons/rx";
import { NavLink } from "react-router-dom";

const SideBar = ({ title = "Seller Panel", tabs = [], activeTab, setActiveTab, classNames = {} }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();

  const defaults = {
    wrapper: "relative z-20",
    overlay:
      "fixed inset-x-0 bottom-0 top-16 z-30 bg-black/40 backdrop-blur-[1px] tablet:hidden",
    aside: `${
      theme === "dark"
        ? "border-gray-700 bg-gray-900 text-white"
        : "border-gray-200 bg-white text-gray-900"
    } fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-72 border-r px-4 py-4 shadow-2xl transition-transform duration-300 tablet:relative tablet:top-0 tablet:z-0 tablet:h-full tablet:translate-x-0`,
    header: "mb-4 flex items-center justify-between",
    title: "text-lg font-semibold tracking-wide",
    list: "space-y-1",
    item: "",
    link: `${
      theme === "dark"
        ? "text-gray-300 hover:bg-gray-800 hover:text-white"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    } group flex items-center justify-start gap-3 rounded-xl px-3 py-2.5 font-medium transition-all duration-200`,
    activeLink:
      "bg-blue-600 text-white shadow-sm hover:bg-blue-600 hover:text-white",
    icon: "text-lg",
    mobileToggle: `${
      theme === "dark"
        ? "bg-gray-800 text-white border-gray-700"
        : "bg-white text-gray-900 border-gray-200"
    } fixed right-3 top-[4.5rem] z-40 rounded-lg border p-2 shadow-md tablet:hidden`,
    closeButton: `${
      theme === "dark"
        ? "text-gray-300 hover:bg-gray-800"
        : "text-gray-700 hover:bg-gray-100"
    } rounded-md p-1 transition-all duration-200 tablet:hidden`,
  };

  const mergedClassNames = {
    ...defaults,
    ...classNames,
  };

  return (
    <div className={mergedClassNames.wrapper}>
      {sidebarOpen && (
        <button
          className={mergedClassNames.overlay}
          aria-label="Close sidebar overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`${mergedClassNames.aside} ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className={mergedClassNames.header}>
          <h2 className={mergedClassNames.title}>{title}</h2>
          <button
            className={mergedClassNames.closeButton}
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <MdClose className="h-6 w-6" />
          </button>
        </div>

        <ul className={mergedClassNames.list}>
          {tabs?.map((item, index) => {
            const Icon = item.icon;
            return (
              <li key={index} className={mergedClassNames.item}>
                <NavLink
                  to={item?.navigate}
                  end={item?.navigate === "" || item?.navigate === "dashboard"}
                  onClick={() => {
                    setActiveTab && setActiveTab(index);
                    setSidebarOpen(false);
                  }}
                  className={({ isActive }) =>
                    `${mergedClassNames.link} ${
                      isActive ? mergedClassNames.activeLink : ""
                    }`
                  }
                >
                  {Icon ? <Icon className={mergedClassNames.icon} /> : null}
                  <span>{item?.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </aside>

      {!sidebarOpen && (
        <button
          className={mergedClassNames.mobileToggle}
          aria-label="Open sidebar"
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          <RxHamburgerMenu className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default SideBar;

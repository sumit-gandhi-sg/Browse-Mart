import React, { useState } from "react";
import { useTheme } from "../Context/themeContext";
import { MdClose } from "react-icons/md";
import { RxHamburgerMenu } from "react-icons/rx";
import { Link, NavLink } from "react-router-dom";

const SideBar = ({ tabs, activeTab, setActiveTab }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();
  return (
    <div className=" relative z-50 ">
      <aside
        className={`${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        } transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }  w-64 z-10  p-4 text-base shadow-lg transition-all duration-300 fixed h-full  tablet:relative tablet:transform-none`}
      >
        <MdClose
          className="w-7 h-7 tablet:hidden  font-bold text-2xl ml-auto"
          onClick={() => setSidebarOpen(false)}
        />

        <ul className="mt-4 space-y-2">
          {tabs?.map((item, index) => {
            const Icon = item.icon;
            return (
              <li
                key={index}
                className={` `}
                // onClick={() => {
                //   setActiveTab(index);
                //   setSidebarOpen(false);
                // }}
              >
                <NavLink
                  to={item?.navigate}
                  className={({ isActive }) =>
                    ` p-2  flex items-center flex-row-reverse justify-end gap-4 text-blue-600 rounded-md  cursor-pointer ${
                      isActive ? "bg-blue-100" : "hover:bg-gray-200"
                    } `
                  }
                >
                  {Icon && <span>{<Icon />}</span>}

                  {item?.name}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </aside>
      {!sidebarOpen && (
        <RxHamburgerMenu
          className="w-5 h-5 m-4 z-0 absolute top-0 tablet:hidden"
          onClick={() => setSidebarOpen((prev) => !prev)}
        />
      )}
    </div>
  );
};

export default SideBar;

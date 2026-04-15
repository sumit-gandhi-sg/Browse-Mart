import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaChevronDown,
  FaMoon,
  FaShoppingCart,
  FaSignOutAlt,
  FaSun,
  FaUser,
} from "react-icons/fa";
import { Button, SearchBar } from "../../LIBS";
import { useTheme } from "../../Context/themeContext";
import { useCart } from "../../Context/cartContext";
import { useAuth } from "../../Context/authContext";
import { useUser } from "../../Context/userContext";
import { swalWithCustomConfiguration } from "../../utility/constant";
import "../../LIBS/Loader/Loader.css";

const Navbar = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { authToken, setAuthToken } = useAuth();
  const { cartCount } = useCart();
  const { userDetail, setUserDetail } = useUser();
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);
  const isDark = theme === "dark";
  const isProfileLoading = !!authToken && typeof userDetail === "undefined";
  const themeClass = isDark
    ? "bg-gray-800 text-white"
    : "bg-gray-200 text-gray-900";

  const handleLogOut = () => {
    swalWithCustomConfiguration
      .fire({
        title: "Are you Leaving?",
        text: "Are you sure want to logout?",
        icon: "warning",
        showDenyButton: true,
        confirmButtonText: "Logout",
        denyButtonText: "Cancel",
        reverseButtons: true,
      })
      .then((response) => {
        if (response.isConfirmed) {
          localStorage.removeItem("AuthToken");
          setAuthToken(null);
          setUserDetail(null);
          setShowProfileMenu(false);
          navigate("/");
        }
      });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav
      className={`${themeClass} sticky top-0 z-50 flex items-center justify-between p-4 shadow-md transition-all duration-300`}
    >
      <Link to="/">
        <h1 className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-center text-2xl font-bold text-transparent mobile:text-2xl tablet:text-3xl laptop:text-4xl">
          Browse Mart
        </h1>
      </Link>

      <div className="flex items-center gap-4">
        <SearchBar />
        <Button
          onClick={toggleTheme}
          className={`rounded-full p-1 transition-all duration-300 ${
            isDark ? "hover:bg-gray-400" : "hover:bg-gray-300"
          }`}
          icon={
            isDark ? (
              <FaSun className="h-4 w-4 text-white transition-all duration-300" />
            ) : (
              <FaMoon className="h-4 w-4 text-gray-800 transition-all duration-300" />
            )
          }
        />

        {authToken ? (
          <>
            <Link to="/cart">
              <span className="relative">
                <FaShoppingCart
                  className={`cursor-pointer text-lg ${
                    isDark ? "hover:text-indigo-400" : "hover:text-indigo-600"
                  }`}
                  aria-label="Cart"
                />
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[12px] font-semibold text-black">
                  {cartCount}
                </span>
              </span>
            </Link>

            <div className="relative" ref={profileMenuRef}>
              {isProfileLoading ? (
                <div
                  className={`flex items-center gap-3 rounded-full px-3 py-2 ${
                    isDark ? "bg-gray-900 text-white" : "bg-white text-gray-800"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      isDark
                        ? "bg-indigo-500/20 text-indigo-300"
                        : "bg-indigo-100 text-indigo-600"
                    }`}
                  >
                    <FaUser className="text-sm" />
                  </span>
                  <div className="loader scale-[0.4]">
                    <div className="loading !h-5 !w-5 !border-[3px]" />
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowProfileMenu((prev) => !prev)}
                    className={`flex items-center gap-2 rounded-full px-3 py-2 transition-all duration-300 ${
                      isDark
                        ? "bg-gray-900 text-white hover:bg-gray-700"
                        : "bg-white text-gray-800 hover:bg-gray-100"
                    }`}
                    aria-label="User Profile Menu"
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        isDark ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-600"
                      }`}
                    >
                      <FaUser className="text-sm" />
                    </span>
                    <span className="hidden max-w-28 truncate text-sm font-semibold small-device:block">
                      {userDetail?.name?.toCapitalize?.().split(" ")?.[0] || "Profile"}
                    </span>
                    <FaChevronDown
                      className={`text-xs transition-transform duration-300 ${
                        showProfileMenu ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showProfileMenu ? (
                    <div
                      className={`absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border shadow-xl ${
                        isDark
                          ? "border-gray-800 bg-gray-900 text-white"
                          : "border-gray-200 bg-white text-gray-900"
                      }`}
                    >
                      <div
                        className={`border-b px-4 py-4 ${
                          isDark ? "border-gray-800 bg-gray-950" : "border-gray-100 bg-gray-50"
                        }`}
                      >
                        <p className="font-roboto text-base font-bold">
                          {userDetail?.name?.toCapitalize?.() || "Browse Mart User"}
                        </p>
                        <p className={`mt-1 break-words text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          {userDetail?.email || "Signed in account"}
                        </p>
                      </div>

                      <div className="flex flex-col p-2">
                        <Link
                          to="/profile/overview"
                          className={`rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 ${
                            isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                          }`}
                          onClick={() => setShowProfileMenu(false)}
                        >
                          My Profile
                        </Link>
                        <Link
                          to="/profile/orders"
                          className={`rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 ${
                            isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                          }`}
                          onClick={() => setShowProfileMenu(false)}
                        >
                          My Orders
                        </Link>
                        <Link
                          to="/profile/wishlist"
                          className={`rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 ${
                            isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                          }`}
                          onClick={() => setShowProfileMenu(false)}
                        >
                          Wishlist
                        </Link>
                      </div>

                      <div className={`border-t p-2 ${isDark ? "border-gray-800" : "border-gray-100"}`}>
                        <button
                          type="button"
                          onClick={handleLogOut}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition-all duration-300 ${
                            isDark
                              ? "text-red-300 hover:bg-red-500/10"
                              : "text-red-600 hover:bg-red-50"
                          }`}
                        >
                          <FaSignOutAlt />
                          Logout
                        </button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </>
        ) : (
          <Link to="/login">
            <Button
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white shadow-lg hover:bg-indigo-700"
              aria-label="Login"
              btntext="Login"
            />
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

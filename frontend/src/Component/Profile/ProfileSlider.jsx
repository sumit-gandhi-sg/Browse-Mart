import React, { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { LuLogOut } from "react-icons/lu";
import { FaBox, FaUser, FaHeart } from "react-icons/fa";
import { swalWithCustomConfiguration } from "../../utility/constant";
import { useNavigate } from "react-router-dom";
import { WishListContainer, Profile, OrdersContainer } from "./index";
import { useTheme } from "../../Context/themeContext";
import { useAuth } from "../../Context/authContext";
const ProfileSlider = ({
  showProfileSlider,
  setShowProfileSlider,
  userDetail,
  setUserDetail,
}) => {
  const [activeTab, setActiveTab] = useState("profile");
  const { theme } = useTheme();
  const { authToken, setAuthToken } = useAuth();
  const navigate = useNavigate();
  const themeClass =
    theme === "dark" ? " bg-gray-900 text-white" : "bg-white text-gray-900";
  const icons = [
    { icon: FaUser, tab: "profile" },
    { icon: FaBox, tab: "orders" },
    { icon: FaHeart, tab: "wishList" },
  ];
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
          setShowProfileSlider(false);
          navigate("/");
          setUserDetail(null);
        } else if (response.isDenied) {
          return;
        }
      });
  };
  return (
    <div
      className={`h-full fixed top-0 right-0 flex ${themeClass} w-full max-w-[560px] mobile:w-full mobile:rounded-none tablet:w-[70%] laptop:w-[48%] large-device:w-[42%] tablet:rounded-l-lg shadow-md shadow-black/60 rounded-l-lg overflow-hidden transition-all duration-300 transform ${
        showProfileSlider ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="relative h-full w-[44px] shrink-0 bg-indigo-600">
        <RxCross2
          className="relative top-2 left-[50%] translate-x-[-50%]  cursor-pointer font-extrabold text-2xl bg-white text-blue-500 rounded-full p-1 "
          onClick={() => setShowProfileSlider((prev) => !prev)}
        />
        <div className="w-full relative top-10 flex flex-col gap-5 items-center justify-normal">
          {icons.map(({ icon: Icon, tab }, index) => (
            <div key={index} className="relative group">
              <Icon
                className="text-3xl rounded-full p-1 text-white hover:text-indigo-600 cursor-pointer font-extrabold hover:bg-white"
                onClick={() => setActiveTab(tab)}
              />
              <span className="absolute top-0 text-sm  left-10 bg-indigo-600 text-white font-semibold p-1 rounded hidden group-hover:block">
                {tab}
              </span>
            </div>
          ))}
        </div>

        <LuLogOut
          className="absolute p-1 bottom-2 text-3xl rounded-full text-white -scale-100 hover:bg-white hover:text-blue-500 cursor-pointer font-extrabold left-[50%] translate-x-[-50%]"
          onClick={handleLogOut}
        />
      </div>

      <div className="min-w-0 flex-1">
        {activeTab === "profile" && (
          <Profile
            userDetail={userDetail}
            authToken={authToken}
            setUserDetail={setUserDetail}
          />
        )}
        {activeTab === "orders" && <OrdersContainer embedded={true} />}
        {activeTab === "wishList" && (
          <WishListContainer authToken={authToken} />
        )}
      </div>
    </div>
  );
};

export default ProfileSlider;

import React, { useEffect, useState } from "react";
import image from "../../../assets/images/login_panel_logo.png";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../../LIBS/Button";
import axios from "axios";
import { swalWithCustomConfiguration } from "../../../utility/constant";
import { customToast } from "../../../utility/constant";
import Swal from "sweetalert2";
import { useAuth } from "../../../Context/authContext";
import { adminUser } from "../../../utility/constant";
const SERVER_URL = import.meta.env.VITE_SERVER_URL;
//form direct action config
// action={`${SERVER_URL}${isSignUpShow ? "/create-user" : ""}`}
// method={`${isSignUpShow ? "post" : "get"}`

const LoginPage = () => {
  const location = useLocation();
  const [isQuickLogining, setIsQuickLogining] = useState({
    guest: false,
    admin: false,
  });
  const navigate = useNavigate();
  const [isSignUpShow, setIsSignUpShow] = useState(false);
  const { authToken, setAuthToken } = useAuth();
  const guestUser = {
    email: "guest@gmail.com",
    password: "guestuser",
  };
  const redirect = new URLSearchParams(location?.search)?.get("redirect");

  const handleGuestLogin = () => {
    setIsQuickLogining((prev) => ({ ...prev, guest: true }));
    axios({
      method: "POST",
      url: `${SERVER_URL}/api/auth/login`,
      data: guestUser,
      headers: { "Content-type": "application/json; charset=UTF-8" },
    })
      .then((response) => {
        if (response?.status === 200) {
          localStorage.setItem("AuthToken", response?.data?.AuthToken);
          setAuthToken(response?.data?.AuthToken);
          navigate(redirect ? `${redirect}` : "/");
          customToast()?.fire({
            icon: "success",
            title: "User Login Successfully!",
          });
        } else {
          swalWithCustomConfiguration?.fire(
            "Oops!",
            "Something went wrong",
            "error",
          );
        }
      })
      .catch((error) => {
        const status = error?.response?.status;
        const message = error?.response?.data?.message;
        if (status === 404) {
          swalWithCustomConfiguration?.fire("Oops!", message, "error");
        } else if (status === 401) {
          swalWithCustomConfiguration?.fire("Oops!", message, "error");
        } else if (status === 400) {
          swalWithCustomConfiguration?.fire("Oops!", message, "error");
        } else {
          swalWithCustomConfiguration?.fire(
            "Oops!",
            "Something went wrong",
            "error",
          );
        }
      })
      .finally(() => {
        setIsQuickLogining((prev) => ({ ...prev, guest: false }));
      });
  };

  const handleAdminLogin = () => {
    setIsQuickLogining((prev) => ({ ...prev, admin: true }));
    axios({
      method: "POST",
      url: `${SERVER_URL}/api/auth/login`,
      data: adminUser,
      headers: { "Content-type": "application/json; charset=UTF-8" },
    })
      .then((response) => {
        if (response?.status === 200) {
          localStorage.setItem("AuthToken", response?.data?.AuthToken);
          setAuthToken(response?.data?.AuthToken);
          navigate(redirect ? `${redirect}` : "/");
          customToast()?.fire({
            icon: "success",
            title: "Admin Login Successfully!",
          });
        }
      })
      .catch((error) => {
        const message =
          error?.response?.data?.message || "Something went wrong";
        swalWithCustomConfiguration?.fire("Oops!", message, "error");
      })
      .finally(() => {
        setIsQuickLogining((prev) => ({ ...prev, admin: false }));
      });
  };
  // const [authToken, setAuthToken] = useState(localStorage.getItem("AuthToken"));
  useEffect(() => {
    if (authToken) navigate("/");
  }, [authToken, navigate]);

  return (
    <div className="w-screen flex h-screen laptop:w-screen laptop:h-screen bg-blue-300  ">
      <div
        className={`w-1/2 mobile:w-full tablet:w-1/2 flex  justify-center transform  transition-transform duration-700  items-center  ${
          isSignUpShow
            ? " mobile:translate-x-0 small-device:translate-x-full"
            : "translate-x-0"
        }`}
      >
        <div className=" min-w-[300px] mobile:w-full small-device:w-[500px] ">
          <div className="flex w-full items-center gap-3 p-3 ">
            <div
              onClick={() => setIsSignUpShow((prev) => !prev)}
              className={` p-3 font-bold font-roboto w-1/2 border-2 border-transparent text-2xl hover:cursor-pointer ${
                !isSignUpShow ? "text-blue-600 " : "text-blue-400"
              }`}
            >
              Login
              <div
                className={`w-full ${
                  !isSignUpShow ? "bg-blue-600" : "bg-blue-400"
                }  h-[3px] rounded`}
              ></div>
            </div>
            <div
              onClick={() => setIsSignUpShow((prev) => !prev)}
              className={`p-3 font-bold font-roboto w-1/2 border-2 border-transparent text-2xl hover:cursor-pointer ${
                isSignUpShow ? "text-blue-600 " : "text-blue-400"
              }`}
            >
              Sign up
              <div
                className={`w-full ${
                  isSignUpShow ? "bg-blue-600" : "bg-blue-400"
                }  h-[3px] rounded`}
              ></div>
            </div>
          </div>

          {isSignUpShow ? (
            <SignUpForm
              setIsSignUpShow={setIsSignUpShow}
              setAuthToken={setAuthToken}
            />
          ) : (
            <LoginForm
              setIsSignUpShow={setIsSignUpShow}
              setAuthToken={setAuthToken}
              redirect={redirect}
            />
          )}
          <div className="w-full p-3 grid grid-cols-2 gap-2">
            <Button
              btntext={"Guest Login"}
              className={"w-full p-2 bg-blue-500 rounded text-white"}
              onClick={handleGuestLogin}
              loading={isQuickLogining.guest}
              disabled={isQuickLogining.admin}
            />
            <Button
              btntext={"Admin Login"}
              className={"w-full p-2 bg-slate-800 rounded text-white"}
              onClick={handleAdminLogin}
              loading={isQuickLogining.admin}
              disabled={isQuickLogining.guest}
            />
          </div>
        </div>
      </div>

      <div
        className={`w-1/2 relative overflow-hidden mobile:hidden tablet:block transform transition-transform duration-700  ${
          isSignUpShow ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        <div
          className={`z-50 absolute w-[300px] top-1/2 -translate-y-1/2  transform left-1/2 -translate-x-1/2   ${
            isSignUpShow ? "scale-x-[-1] " : ""
          }  `}
        >
          <img src={image} alt="" />
        </div>
        <div
          className={`w-full bg-[#CAF4FF] rounded-full transform transition-transform duration-700 absolute ${
            isSignUpShow
              ? "-left-1/2 translate-x-1/4"
              : "-right-1/2 -translate-x-1/4"
          } top-1/2 -translate-y-1/2   scale-[1.5] h-full`}
        >
          <div
            className={`w-full  bg-[#A0DEFF] rounded-full  h-full transform transition-transform duration-700 absolute ${
              isSignUpShow ? "-left-1/4" : "-right-1/4"
            }   top-1/2 -translate-y-1/2 `}
          >
            <div
              className={` w-full bg-[#5AB2FF] rounded-full  h-full transform transition-transform duration-700 absolute ${
                isSignUpShow ? "-left-1/4" : "-right-1/4"
              } -right-1/4 top-1/2 -translate-y-1/2`}
            ></div>
          </div>
        </div>
        {/* <div className="w-full bg-[#a3c7f0] rounded-full transform absolute -right-1/2 top-1/2 -translate-y-1/2 -translate-x-1/4  scale-[1.5] h-full">
          <div className="w-full  bg-[#9bb7dd] rounded-full  h-full absolute -right-1/4 top-1/2 -translate-y-1/2  ">
            <div className=" w-full bg-[#76a9d0] rounded-full  h-full absolute -right-1/4 top-1/2 -translate-y-1/2"></div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default LoginPage;

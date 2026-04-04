import React, { useState } from "react";
import axios from "axios";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import Input from "../../../LIBS/Input";
import Button from "../../../LIBS/Button";
import { useNavigate } from "react-router-dom";
import {
  customToast,
  swalWithCustomConfiguration,
} from "../../../utility/constant";

const LoginForm = ({ setIsSignUpShow, setAuthToken, redirect }) => {
  const navigate = useNavigate();
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const [initialUserDetail, setInitialUserDetail] = useState({
    email: "",
    password: "",
  });
  const [userDetail, setUserDetail] = useState(initialUserDetail);
  const [error, setError] = useState({
    email: "",
    password: "",
    isError: false,
  });
  const [isPasswordShow, setIsPasswordShow] = useState(false);

  const handleInput = (e) => {
    const { name, value, checked, type } = e.target;
    if (value === "" || value === undefined || value === null) {
      setError({ ...error, [name]: `${[name]} is required`, isError: true });
    } else {
      setError({ ...error, [name]: "", isError: false });
    }
    setUserDetail({
      ...userDetail,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      (error.isError && userDetail.email === "") ||
      userDetail.password === ""
    ) {
      swalWithCustomConfiguration?.fire(
        "Oops!",
        "All field are required",
        "warning",
      );
    } else {
      handleLogin();
      setUserDetail(initialUserDetail);
    }
  };

  const handleLogin = () => {
    axios({
      method: "POST",
      url: `${SERVER_URL}/api/auth/login`,
      data: userDetail,
      headers: { "Content-type": "application/json; charset=UTF-8" },
    })
      .then((response) => {
        if (response.status === 200) {
          localStorage.setItem("AuthToken", response?.data?.AuthToken);
          setAuthToken(response?.data?.AuthToken);
          navigate(redirect ? `${redirect}` : "/");
          customToast()?.fire({
            icon: "success",
            title: "User Login Successfully !",
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
      });
  };

  return (
    <form className="p-3 flex flex-col gap-3">
      <div className="w-full">
        <Input
          type={"email"}
          name={"email"}
          className={
            "w-full bg-transparent outline-none placeholder:text-white p-2 text-white font-roboto  border-2 border-white rounded"
          }
          placeholder={"Email"}
          value={userDetail?.email}
          onChange={handleInput}
          id={"email"}
        />
      </div>
      <div className="w-full relative flex">
        <Input
          type={isPasswordShow ? "text" : "password"}
          name={"password"}
          className={
            "w-full bg-transparent outline-none placeholder:text-white p-2 text-white font-roboto  border-2 border-white rounded"
          }
          placeholder={"Password"}
          value={userDetail?.password}
          onChange={handleInput}
          id={"password"}
        />

        <div
          onClick={() => setIsPasswordShow((prev) => !prev)}
          className={`hover:cursor-pointer ${
            userDetail?.password ? "block" : "hidden"
          }`}
        >
          {isPasswordShow ? (
            <FaEyeSlash className="absolute text-white font-bold  right-3 top-1/2 -translate-y-1/2" />
          ) : (
            <FaEye className="absolute text-white font-bold right-3 top-1/2 -translate-y-1/2" />
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <div className="text-white font-roboto">Don't have an account</div>
        <div
          className="text-blue-600 font-bold font-roboto hover:cursor-pointer"
          onClick={() => setIsSignUpShow((prev) => !prev)}
        >
          Sign-up here!
        </div>
      </div>
      <div className="w-full relative">
        <Button
          btntext={"Login"}
          className={
            " bg-white text-blue-600 font-bold py-1 px-3 w-full  font-roboto rounded"
          }
          onClick={handleSubmit}
        />
      </div>
    </form>
  );
};

export default LoginForm;

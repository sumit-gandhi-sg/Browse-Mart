import "./App.css";
import { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { useCart } from "../../Context/cartContext";
import {
  LoginPage,
  RegisterPage,
  ForgetPasswordPage,
  Login,
} from "../Pages";
import Profile1 from "../Profile/profile1";
import { useAuth } from "../../Context/authContext";
import { useUser } from "../../Context/userContext";
import { ConsumerRoutes, SellerRoutes } from "../../routes";
import AppLayout from "../AppLayout/AppLayout";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/login-1",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/forget-password",
    element: <ForgetPasswordPage />,
  },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      ...ConsumerRoutes,
      SellerRoutes,
      {
        path: "/profile",
        element: <Profile1 />,
      },
      {
        path: "*",
        element: <Navigate to="/" />,
      },
    ],
  },
]);

const App = () => {
  const { setUserDetail } = useUser();
  const { setCartCount } = useCart();
  const { authToken, setAuthToken } = useAuth();
  const getUserDetail = async () => {
    try {
      const response = await axios({
        method: "POST",
        url: `${SERVER_URL}/api/user/profile`,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Authorization: `Bearer ${authToken}`,
        },
      });

      const { data } = response;
      setUserDetail(data?.userDetail);
      if (data?.userDetail?.cartCount) {
        setCartCount(data?.userDetail?.cartCount);
      }
    } catch (error) {
      console.log(error?.response?.data?.message);
      if (error?.response?.data?.message === "Token expired") {
        localStorage.removeItem("AuthToken");
        setAuthToken(null);
      }
    }
  };

  // eslint-disable-next-line no-extend-native
  String.prototype.toCapitalize = function () {
    if (this.length === 0) return "";
    const words = this.split(" ");
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }
    return words.join(" ");
  };
  useEffect(() => {
    if (authToken) {
      getUserDetail();
    } else {
      setUserDetail(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  return <RouterProvider router={router} />;
};

export default App;

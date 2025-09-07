import { useEffect } from "react";
import { useTheme } from "../../Context/themeContext";
import { useUser } from "../../Context/userContext";
import Navbar from "../Navbar/Navbar";
import { Outlet } from "react-router-dom";
import Footer from "../Footer/Footer";
import { Analytics } from "@vercel/analytics/react";

const AppLayout = () => {
  const { toggleTheme } = useTheme();
  const { userDetail, setUserDetail } = useUser();

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.key?.toString().toLowerCase() === "b") {
        e.preventDefault();
        // alert(" ctrl + B pressd");
        toggleTheme();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [toggleTheme]);
  return (
    <div className="App flex flex-col min-h-screen">
      <Navbar userDetail={userDetail} setUserDetail={setUserDetail} />
      <Outlet />
      <Footer userDetail={userDetail} />
      <Analytics />
    </div>
  );
};
export default AppLayout;

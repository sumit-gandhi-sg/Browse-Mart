import { Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { useUser } from "../Context/userContext";
import AdminLayout from "../Component/Admin/AdminLayout";
import AdminDashboard from "../Component/Admin/Dashboard/AdminDashboard";
import UserManagement from "../Component/Admin/UserManagement/UserManagement";
import AdminProductList from "../Component/Admin/ProductManagement/AdminProductList";

const AdminOnly = ({ children }) => {
  const { userDetail } = useUser();
  
  if (!userDetail) return null; // Wait for load
  
  if (userDetail?.userType !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
};

const AdminRoutes = {
  path: "/admin",
  element: (
    <ProtectedRoute>
      <AdminOnly>
        <AdminLayout />
      </AdminOnly>
    </ProtectedRoute>
  ),
  children: [
    {
      index: true,
      element: <AdminDashboard />,
    },
    {
      path: "users",
      element: <UserManagement />,
    },
    {
      path: "products",
      element: <AdminProductList />,
    },
  ],
};

export default AdminRoutes;

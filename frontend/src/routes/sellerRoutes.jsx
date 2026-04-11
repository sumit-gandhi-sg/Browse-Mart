// src/routes/sellerRoutes.jsx
import { Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import {
  Setting,
  Orders,
  DashBoard,
  ProductsPanel,
  AddProductPanel,
  Customers,
  SellerLayout,
} from "../Component/Seller";

const SellerRoutes = {
  path: "/seller",
  element: (
    <ProtectedRoute requiredRole="seller" redirectPath="/seller-registration">
      <SellerLayout />
    </ProtectedRoute>
  ),
  children: [
    {
      index: true,
      element: <Navigate to="dashboard" />,
    },
    {
      path: "dashboard",
      element: <DashBoard />,
    },
    {
      path: "products",
      element: <ProductsPanel />,
    },
    {
      path: "products/add",
      element: <AddProductPanel />,
    },
    {
      path: "products/edit/:id",
      element: <AddProductPanel />,
    },
    {
      path: "orders",
      element: <Orders />,
    },
    {
      path: "customers",
      element: <Customers />,
    },
    {
      path: "setting",
      element: <Setting />,
    },
    {
      path: "*",
      element: <Navigate to="dashboard" />,
    },
  ],
};

export default SellerRoutes;

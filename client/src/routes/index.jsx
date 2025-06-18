import { UsersLayout, AdminLayout } from "@layouts";
import BranchManagement from "@/pages/admin/branch";
import Dashboard from "@/pages/admin/dashboard/Dashboard";
import CategoryPage from "@/pages/admin/category/category";
import { Home, ProductDetail, SearchProductResult } from "@/pages/users";
import { AddProduct, EditProduct, ListProduct } from "@/pages/admin/product";

import { createBrowserRouter } from "react-router-dom";
import WarehouseManagement from "@/pages/admin/warehouse";
import WarehouseInbound from "@/pages/admin/warehouse/import";
import WarehouseOutbound from "@/pages/admin/warehouse/export";

const router = createBrowserRouter([
  {
    element: <UsersLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/product/:id",
        element: <ProductDetail />,
      },
      {
        path: "/search/:query",
        element: <SearchProductResult />,
      },
    ],
  },
  {
    element: <AdminLayout />,
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/product/add", element: <AddProduct /> },
      { path: "/product/", element: <ListProduct /> },
      { path: "/product/edit/:id", element: <EditProduct /> },
      { path: "/category", element: <CategoryPage /> },
      {
        path: "/branch/management",
        element: <BranchManagement />,
      },
      { path: "/warehouse", element: <WarehouseManagement /> },
      {
        path: "/warehouse/import",
        element: <WarehouseInbound />,
      },
      {
        path: "/warehouse/export",
        element: <WarehouseOutbound />,
      },
    ],
  },
]);

export default router;

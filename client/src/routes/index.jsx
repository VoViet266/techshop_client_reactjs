import CategoryPage from "@/pages/admin/category/category";
import Dashboard from "@/pages/admin/dashboard/Dashboard";
import { AddProduct, EditProduct, ListProduct } from "@/pages/admin/product";
import { Home, ProductDetail } from "@/pages/users";
import { UsersLayout, AdminLayout } from "@layouts";

import { createBrowserRouter } from "react-router-dom";

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
    ],
  },
]);

export default router;

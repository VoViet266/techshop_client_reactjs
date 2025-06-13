import { Home, ProductDetail } from "@pages/users";
import { UsersLayout, AdminLayout } from "@layouts";
import { Dashboard, AddProduct, ListProduct } from "@pages/admin";
import { createBrowserRouter } from "react-router-dom";
import EditProduct from "@/pages/admin/EditProduct";

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
      { path: "/product/all", element: <ListProduct /> },
      { path: "/product/edit/:id", element: <EditProduct /> },
    ],
  },
]);

export default router;

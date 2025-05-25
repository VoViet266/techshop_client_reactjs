import { Home } from "@pages/users";
import { Dashboard } from "@pages/admin";
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
    ],
  },
  {
    element: <AdminLayout />,
    children: [{ path: "/dashboard", element: <Dashboard /> }],
  },
]);

export default router;

import { createBrowserRouter } from "react-router";
import { UsersLayout } from "@layouts";
import { Home } from "@pages/users";

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
]);

export default router;

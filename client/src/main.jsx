import router from "./routes";
import { StrictMode } from "react";
import { ConfigProvider } from "antd";
import { AppProvider } from "@contexts";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ConfigProvider theme={{}}>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </ConfigProvider>
  </StrictMode>
);

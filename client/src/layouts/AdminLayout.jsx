import { useState, useEffect } from "react";
import { useAppContext } from "@contexts";
import { Outlet, Link } from "react-router-dom";
import { AiOutlineProduct, AiOutlineHome } from "react-icons/ai";
import { LoadingToast, SuccessToast, ErrorToast } from "@/components/app";

function Header() {
  useEffect(() => {
    document.title = "TechShop | Dashboard";
  }, []);

  return (
    <header className="font-roboto xl:px-50 lg:px-30 md:px-20 w-full fixed top-0 left-0 right-0 z-100 bg-white border-b border-b-gray-300 h-60 flex items-center justify-between">
      <Link to="/dashboard">
        <h3 className="font-bold xl:text-3xl lg:text-2xl md:text-2xl text-primary">
          TechShop
        </h3>
      </Link>
    </header>
  );
}

function AdminLayout() {
  const {
    toastLoading,
    loadingError,
    loadingSuccess,
    sideBarSelectedTab,
    setSideBarSelectedTab,
  } = useAppContext();

  return (
    <div className="relative font-roboto overflow-x-hidden">
      <Header />
      <main className="mt-90 flex">
        <div className="xl:pl-50 w-[20%] border-r fixed top-60 left-0 bottom-0 border-r-gray-300 flex flex-col gap-10 h-screen p-20">
          <Link to="/dashboard">
            <div
              onClick={() => {
                setSideBarSelectedTab("Trang chủ");
              }}
              className={`${sideBarSelectedTab === "Trang chủ" && "text-primary"} flex items-center font-medium gap-8 group cursor-pointer`}
            >
              <div>
                <AiOutlineHome className="text-xl group-hover:text-primary" />
              </div>
              <span className={`text-md group-hover:text-primary`}>
                Trang chủ
              </span>
            </div>
          </Link>

          <div>
            <div className="flex items-center font-medium gap-8">
              <div>
                <AiOutlineProduct className="text-xl" />
              </div>
              <span className="text-md cursor-pointer">Quản lý sản phẩm</span>
            </div>

            <div className="ml-30 flex flex-col items-start gap-10 mt-10">
              <Link to="/product/add">
                <span
                  onClick={() => {
                    setSideBarSelectedTab("Thêm sản phẩm");
                  }}
                  className={`${sideBarSelectedTab === "Thêm sản phẩm" && "text-primary"} cursor-pointer hover:text-primary`}
                >
                  Thêm sản phẩm
                </span>
              </Link>

              <Link to="/product/all">
                <span
                  onClick={() => {
                    setSideBarSelectedTab("Xem danh sách sản phẩm");
                  }}
                  className={`${sideBarSelectedTab === "Xem danh sách sản phẩm" && "text-primary"} cursor-pointer hover:text-primary`}
                >
                  Xem danh sách sản phẩm
                </span>
              </Link>
            </div>
          </div>
        </div>
        <div
          className={`w-full ml-[20%] p-20 ${window.location.pathname === "/product/all"}`}
        >
          <Outlet />
        </div>
      </main>
      {loadingError && <ErrorToast />}
      {toastLoading && <LoadingToast />}
      {loadingSuccess && <SuccessToast />}
    </div>
  );
}

export default AdminLayout;

import { useEffect } from "react";
import { Login, Signup } from "@pages/app";
import { useAppContext } from "@contexts";
import { Outlet, Link } from "react-router-dom";
import { LoadingToast, SuccessToast, ErrorToast } from "@/components/app";

function Header() {
  const { setShowLogin, setShowSignup } = useAppContext();

  useEffect(() => {
    document.title = "TechShop | Mua sắm thả ga";
  }, []);

  return (
    <header className="font-roboto xl:px-50 w-full fixed top-0 left-0 right-0 z-10 bg-white border-b border-b-gray-300 h-60 flex items-center justify-between">
      <Link to="/">
        <h3 className="font-bold xl:text-3xl text-primary">TechShop</h3>
      </Link>
      <div className="flex gap-8 font-medium">
        <button
          onClick={() => {
            setShowLogin(true);
          }}
          className="border border-gray-300 py-6 px-12 rounded-lg cursor-pointer"
        >
          Đăng nhập
        </button>
        <button
          onClick={() => {
            setShowSignup(true);
          }}
          className="py-6 px-12 rounded-lg bg-primary text-white cursor-pointer hover:opacity-80"
        >
          Đăng ký
        </button>
      </div>
    </header>
  );
}

function UsersLayout() {
  const {
    loading,
    showLogin,
    showSignup,
    setMessage,
    setLoading,
    toastLoading,
    loadingError,
    loadingSuccess,
    setLoadingError,
    setLoadingSuccess,
  } = useAppContext();

  return (
    <div className="font-roboto relative flex flex-col items-center">
      <Header />
      <main className="w-full mt-60 flex flex-col items-center">
        <Outlet />
        {showLogin && <Login />}
        {showSignup && <Signup />}
      </main>
      {loadingError && <ErrorToast />}
      {toastLoading && <LoadingToast />}
      {loadingSuccess && <SuccessToast />}
      {/* <footer>Footer</footer> */}
    </div>
  );
}

export default UsersLayout;

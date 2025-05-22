import { useEffect } from "react";
import { Login } from "@pages/app";
import { LoadingToast } from "@/components/app";
import { useAppContext } from "@contexts";
import { Outlet, Link } from "react-router-dom";

function Header() {
  const { setShowLogin } = useAppContext();

  const style = {
    logo: "font-bold xl:text-3xl text-primary",
    buttonsContainer: "flex gap-8 font-medium",
    loginButton: "border border-gray-300 py-6 px-12 rounded-lg cursor-pointer",
    container:
      "font-roboto xl:px-50 w-full h-60 flex items-center justify-between",
    signupButton:
      "py-6 px-12 rounded-lg bg-primary text-white cursor-pointer hover:opacity-80",
  };

  useEffect(() => {
    document.title = "TechShop | Mua sắm thả ga";
  }, []);

  return (
    <header className={style.container}>
      <Link to="/">
        <h3 className={style.logo}>TECHSHOP</h3>
      </Link>
      <div className={style.buttonsContainer}>
        <button
          onClick={() => {
            setShowLogin(true);
          }}
          className={style.loginButton}
        >
          Đăng nhập
        </button>
        <button className={style.signupButton}>Đăng ký</button>
      </div>
    </header>
  );
}

function UsersLayout() {
  const { loading, setLoading, showLogin, setMessage } = useAppContext();
  return (
    <div>
      <Header />
      <main>
        <Outlet />
        {showLogin && <Login />}
      </main>
      <footer>Footer</footer>
    </div>
  );
}

export default UsersLayout;

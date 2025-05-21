import { Login } from "@/pages/app";
import { useAppContext } from "@/contexts";
import { Outlet, Link } from "react-router";

function Header() {
  const { showLogin, setShowLogin } = useAppContext();
  document.title = "TechShop | Mua sắm thả ga"
  return (
    <header className="font-roboto xl:px-50 w-full h-60 flex items-center justify-between">
      <Link to="/">
        <h3 className="font-bold xl:text-3xl text-primary">TECHSHOP</h3>
      </Link>
      <div className="flex gap-8 font-medium">
        <button
          onClick={() => {
            setShowLogin(!showLogin);
          }}
          className="border border-gray-300 py-6 px-12 rounded-lg cursor-pointer"
        >
          Đăng nhập
        </button>
        <button className="py-6 px-12 rounded-lg bg-primary text-white cursor-pointer hover:opacity-80">
          Đăng ký
        </button>
      </div>
    </header>
  );
}

function UsersLayout() {
  const { showLogin } = useAppContext();

  return (
    <div>
      <Header />
      <div>
        <Outlet />
        {showLogin && <Login />}
      </div>
      <footer>Footer</footer>
    </div>
  );
}

export default UsersLayout;

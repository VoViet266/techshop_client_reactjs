import { useEffect } from "react";
import { useAppContext } from "@contexts";
import { Outlet, Link } from "react-router-dom";
import { LoadingToast, SuccessToast, ErrorToast } from "@/components/app";

function Header() {
  const { setShowLogin, setShowSignup } = useAppContext();

  useEffect(() => {
    document.title = "TechShop | Dashboard";
  }, []);

  return (
    <header className="font-roboto xl:px-50 w-full h-60 flex items-center justify-between">
      <Link to="/">
        <h3 className="font-bold xl:text-3xl text-primary">TechShop</h3>
      </Link>
    </header>
  );
}

function AdminLayout() {
  const { toastLoading, loadingError, loadingSuccess } = useAppContext();

  return (
    <div className="relative">
      <Header />
      <main>
        <Outlet />
      </main>
      {loadingError && <ErrorToast />}
      {toastLoading && <LoadingToast />}
      {loadingSuccess && <SuccessToast />}
      <footer>Footer</footer>
    </div>
  );
}

export default AdminLayout;

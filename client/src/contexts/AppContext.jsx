import useMessage from '@/hooks/useMessage';
import { callFetchAccount, callLogout } from '@/services/apis';
import { useContext, createContext, useState, useEffect } from 'react';

const AppContext = createContext();

function AppProvider({ children }) {
  const message = useMessage();
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [toastLoading, setToastLoading] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const [loadingSuccess, setLoadingSuccess] = useState(false);
  const [sideBarSelectedTab, setSideBarSelectedTab] = useState();
  
  useEffect(() => {
    const verifyToken = async () => {
      const accessToken = localStorage.getItem('access_token');

      if (!accessToken) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await callFetchAccount();
        setLoading(false);
        if (response.data) {
          setUser(response.data.data.user);
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (username, password) => {
    setIsSubmit(true);
    const res = await callLogin(username, password);
    const redirect = localStorage.getItem('redirectUrl');
    if (res?.data) {
      const { access_token } = res.data;
      localStorage.setItem('access_token', access_token);
      message.success('Đăng nhập thành công!');
      window.location.href = redirect || '/';
      localStorage.removeItem('redirectUrl');
    } else {
      throw new Error(res?.message || 'Đăng nhập thất bại');
    }
  };

  // Hàm đăng xuất
  const logout = async () => {
    try {
      await callLogout();

      localStorage.removeItem('access_token');
      // Reset state
      setUser(null);
      message.success('Đăng xuất thành công!');

      // Chuyển về trang đăng nhập
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
    } catch (error) {
      console.error('Logout error:', error);
      // Xóa token dù có lỗi hay không
      localStorage.removeItem('access_token');
      setUser(null);
    }
  };
  // Kiểm tra xem người dùng có đăng nhập không
  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('access_token');
  };

  // Hàm kiểm tra quyền admin
  const isAdmin = () => {
    return user && user?.permission.length > 0;
  };

  const data = {
    user,
    query,
    loading,
    message,
    showLogin,
    showSignup,
    loadingError,
    toastLoading,
    loadingSuccess,
    sideBarSelectedTab,

    login,
    logout,
    isAdmin,
    setUser,
    setQuery,
    setLoading,
    setShowLogin,
    setShowSignup,
    setLoadingError,
    isAuthenticated,
    setToastLoading,
    setLoadingSuccess,
    setSideBarSelectedTab,
  };

  return <AppContext.Provider value={data}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}

export default AppProvider;

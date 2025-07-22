import { callFetchAccount, callLogin, callLogout } from '@/services/apis';
import { message, notification } from 'antd';
import { useContext, createContext, useState, useEffect } from 'react';

const AppContext = createContext();

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [toastLoading, setToastLoading] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const [loadingSuccess, setLoadingSuccess] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [sideBarSelectedTab, setSideBarSelectedTab] = useState();
  const [messageApi, contextHolder] = message.useMessage();
  const [notificationApi, notificationContextHolder] =
    notification.useNotification();

  const contextValue = {
    message: messageApi,
    notification: notificationApi,
    contextHolder,
    notificationContextHolder,
  };
  useEffect(() => {
    const verifyToken = async () => {
      const accessToken = localStorage.getItem('access_token');

      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await callFetchAccount();
        if (response.data) {
          setUser(response.data.data.user);
          setPermissions(response.data.data.user.permission);
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        localStorage.removeItem('access_token');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const logout = async () => {
    try {
      await callLogout();
      localStorage.removeItem('access_token');
      setUser(null);
      message.success('Đăng xuất thành công!');
      window.location.href = '/';
    } catch (error) {
      message.error('Đăng xuất thất bại');
      localStorage.removeItem('access_token');
      setUser(null);
    }
  };
  // Kiểm tra xem người dùng có đăng nhập không
  const isAuthenticated = () => {
    const hasToken = !!localStorage.getItem('access_token');

    if (loading && hasToken) return true;
    return !!user && hasToken;
  };

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
    showForgotPassword,
    permissions,
    loadingError,
    toastLoading,
    loadingSuccess,
    currentCategory,
    sideBarSelectedTab,
    ...contextValue,

    logout,
    isAdmin,
    setUser,
    setQuery,
    setLoading,
    setPermissions,
    setShowLogin,
    setShowSignup,
    setLoadingError,
    isAuthenticated,
    setToastLoading,
    setLoadingSuccess,
    setCurrentCategory,
    setSideBarSelectedTab,
    setShowForgotPassword,
  };

  return (
    <AppContext.Provider value={data}>
      {contextHolder}
      {notificationContextHolder}
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}

export default AppProvider;

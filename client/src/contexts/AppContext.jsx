import useMessage from '@/hooks/useMessage';
import { callFetchAccount, callLogin, callLogout } from '@/services/apis';
import { message } from 'antd';
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
  const [sideBarSelectedTab, setSideBarSelectedTab] = useState();
  const [messageApi, contextHolder] = message.useMessage();

  const contextValue = {
    message: messageApi,
    contextHolder,
  };
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
        console.log(response);
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

  const logout = async () => {
    try {
      await callLogout();
      localStorage.removeItem('access_token');
      setUser(null);
      message.success('Đăng xuất thành công!');
    } catch (error) {
      message.error('Đăng xuất thất bại');
      localStorage.removeItem('access_token');
      setUser(null);
    }
  };
  // Kiểm tra xem người dùng có đăng nhập không
  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('access_token');
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
    setShowLogin,
    setShowSignup,
    setShowForgotPassword,
    setLoadingError,
    isAuthenticated,
    setToastLoading,
    setLoadingSuccess,
    setCurrentCategory,
    setSideBarSelectedTab,
  };

  return (
    <AppContext.Provider value={data}>
      {contextHolder}
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}

export default AppProvider;

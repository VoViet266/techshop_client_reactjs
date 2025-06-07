import { useContext, createContext, useState } from "react";

const AppContext = createContext();

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [toastLoading, setToastLoading] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const [loadingSuccess, setLoadingSuccess] = useState(false);
  const [sideBarSelectedTab, setSideBarSelectedTab] = useState();

  const data = {
    loading,
    message,
    showLogin,
    showSignup,
    loadingError,
    toastLoading,
    loadingSuccess,
    sideBarSelectedTab,

    setLoading,
    setMessage,
    setShowLogin,
    setShowSignup,
    setLoadingError,
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

import { useContext, createContext, useState } from "react";

const AppContext = createContext();

function AppProvider({ children }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const [loadingSuccess, setLoadingSuccess] = useState(false);

  const data = {
    loading,
    message,
    showLogin,
    loadingError,
    loadingSuccess,

    setLoading,
    setMessage,
    setShowLogin,
    setLoadingError,
    setLoadingSuccess,
  };

  return <AppContext.Provider value={data}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}

export default AppProvider;

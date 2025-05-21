import { useContext, createContext, useState } from "react";

const AppContext = createContext();

function AppProvider({ children }) {
  const [showLogin, setShowLogin] = useState(false);

  const data = { showLogin, setShowLogin };

  return <AppContext.Provider value={data}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}

export default AppProvider;

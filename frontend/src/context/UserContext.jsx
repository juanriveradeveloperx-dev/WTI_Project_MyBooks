import { createContext, useContext } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const user = {
    id: 1,
    name: "Mock User",
  };

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used inside a UserProvider");
  }

  return context;
}
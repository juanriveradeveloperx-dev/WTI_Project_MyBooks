import { createContext, useContext } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  // Temporary provider for the current user.
  // Receives: children.
  // Sends: a fixed mock user object to all nested components through context.
  // Purpose: keeps the app ready for future real authentication without forcing
  // props to be passed down manually.
  const user = {
    id: 1,
    name: "Mock User",
  };

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  // Convenience hook to read the current user from anywhere inside UserProvider.
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used inside a UserProvider");
  }

  return context;
}

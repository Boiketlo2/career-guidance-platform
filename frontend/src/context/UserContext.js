import React, { createContext, useContext, useState } from "react";

// Create context
const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    role: "student", // default role
    uid: "mock-user-id-123", // mock uid
  });

  const switchRole = (newRole) => {
    setUser((prev) => ({ ...prev, role: newRole }));
  };

  return (
    <UserContext.Provider value={{ user, setUser, switchRole }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for easier use
export const useUser = () => useContext(UserContext);

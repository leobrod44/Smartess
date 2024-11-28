"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

// Define the interface for context values
interface UserTypeContextProps {
  userType: string;
  setUserType: Dispatch<SetStateAction<string>>;
}

// Create the context with default undefined
const UserTypeContext = createContext<UserTypeContextProps | null>(null);

// Create a context provider component
export const UserTypeProvider = ({ children }: { children: ReactNode }) => {
  const [userType, setUserType] = useState<string>("");

  const value = {
    userType,
    setUserType,
  };

  return (
    <UserTypeContext.Provider value={value}>
      {children}
    </UserTypeContext.Provider>
  );
};

// Custom hook to consume the context
export const useUserTypeContext = (): UserTypeContextProps => {
  const context = useContext(UserTypeContext);
  if (!context) {
    throw new Error(
      "useUserTypeContext must be used within a UserTypeProvider"
    );
  }
  return context;
};

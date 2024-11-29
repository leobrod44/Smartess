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
interface UserContextProps {
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  userType: string;
  setUserEmail: Dispatch<SetStateAction<string>>;
  setUserFirstName: Dispatch<SetStateAction<string>>;
  setUserLastName: Dispatch<SetStateAction<string>>;
  setUserType: Dispatch<SetStateAction<string>>;
}

// Create the context with default undefined
const UserContext = createContext<UserContextProps | null>(null);

// Create a context provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userEmail, setUserEmail] = useState<string>("");
  const [userFirstName, setUserFirstName] = useState<string>("");
  const [userLastName, setUserLastName] = useState<string>("");
  const [userType, setUserType] = useState<string>("");

  const value = {
    userEmail,
    userFirstName,
    userLastName,
    userType,
    setUserEmail,
    setUserFirstName,
    setUserLastName,
    setUserType,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom hook to consume the context
export const useUserContext = (): UserContextProps => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

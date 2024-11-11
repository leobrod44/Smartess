"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

interface ProjectContextProps {
  selectedProjectId: string;
  selectedProjectAddress: string;
  setSelectedProjectId: Dispatch<SetStateAction<string>>;
  setSelectedProjectAddress: Dispatch<SetStateAction<string>>;
}

const ProjectContext = createContext<ProjectContextProps | undefined>(
  undefined
);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedProjectAddress, setSelectedProjectAddress] =
    useState<string>("ALL PROJECTS");

  return (
    <ProjectContext.Provider
      value={{
        selectedProjectId,
        selectedProjectAddress,
        setSelectedProjectId,
        setSelectedProjectAddress,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjectContext must be used within a ProjectProvider");
  }
  return context;
};

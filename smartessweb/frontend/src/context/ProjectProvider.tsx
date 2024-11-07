'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';

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
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedProjectId') || '';
    }
    return '';
  });

  const [selectedProjectAddress, setSelectedProjectAddress] = useState<string>(
    () => {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('selectedProjectAddress') || 'ALL PROJECTS';
      }
      return 'ALL PROJECTS';
    }
  );

  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem('selectedProjectId', selectedProjectId);
    }
    if (selectedProjectAddress) {
      localStorage.setItem('selectedProjectAddress', selectedProjectAddress);
    }
  }, [selectedProjectId, selectedProjectAddress]);

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
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};

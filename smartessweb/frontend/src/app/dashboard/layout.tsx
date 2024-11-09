import DashboardNavbar from '../components/DashboardNavbar';
import { ReactNode } from 'react';
import { ProjectProvider } from '@/context/ProjectProvider';

interface DashboardProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardProps) => {
  return (
    <ProjectProvider>
      <DashboardNavbar />
      <main className='min-h-screen py-10 lg:pl-72'>{children}</main>
    </ProjectProvider>
  );
};

export default DashboardLayout;

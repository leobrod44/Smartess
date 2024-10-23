import DashboardNavbar from '../components/DashboardNavbar';
import { ReactNode } from 'react';

interface DashboardProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardProps) => {
  return (
    <div>
      <DashboardNavbar />
      <main className='min-h-screen py-10 lg:pl-72'>{children}</main>
    </div>
  );
};

export default DashboardLayout;

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardNavbar from '../components/DashboardNavbar';

const DashboardPage = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/sign-in');
    }
  }, [router]);

  return (
    <div>
      <DashboardNavbar />
      <h1>Dashboard</h1>
    </div>
  );
};

export default DashboardPage;

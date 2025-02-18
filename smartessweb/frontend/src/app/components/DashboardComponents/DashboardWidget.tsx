import { useEffect, useState } from "react";
import AlertWidget from "./AlertWidget";
import SystemHealthWidget from "./SystemHealthWidget";
import SystemOverviewWidget from "./SystemOverviewWidget";
import { dashboardApi, SystemOverview, SystemAlerts, SystemHealth } from "@/api/components/DashboardComponents/DashboardWidget";

const DashboardWidget = () => {
  const [systemOverview, setSystemOverview] = useState<SystemOverview>({
    projects: 0,
    totalUnits: 0,
    pendingTickets: 0,
    totalAdminUsers: 0,
  });

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    systemsLive: 0,
    systemsDown: 0,
  });

  const [systemAlerts, setSystemAlerts] = useState<SystemAlerts[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const data = await dashboardApi.getDashboardData(token);
        
        setSystemOverview(data.systemOverview);
        setSystemHealth(data.systemHealth);
        setSystemAlerts(data.alerts);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching dashboard data');
        console.error('Dashboard fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">Failed to load dashboard data: {error}</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[200px] bg-[#14323B] rounded-[7px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row justify-between  p-1.5 rounded-[7px] shadow-md md:max-w-full transition duration-300 text-[#fff] w-full p-2.5 gap-2">
      <SystemOverviewWidget systemOverview={systemOverview} />
      <SystemHealthWidget systemHealth={systemHealth} />
      <AlertWidget systemAlerts={systemAlerts} />
    </div>
  );
};

export default DashboardWidget;
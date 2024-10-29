import { useEffect, useState } from "react";
import AlertWidget from "./AlertWidget";
import SystemHealthWidget from "./SystemHealthWidget";
import SystemOverviewWidget from "./SystemOverviewWidget";

interface SystemOverview {
  projects: number;
  totalUnits: number;
  pendingTickets: number;
  totalAdminUsers: number;
}

interface SystemAlerts {
  alertType: string;
  unitAddress: string;
  unitNumber: string;
}

interface SystemHealth {
  systemsLive: number;
  systemsDown: number;
}

interface MockDashboard {
  projectId: string;
  systemOverview: SystemOverview;
  alerts: SystemAlerts[];
  systemHealth: SystemHealth;
}

const DashboardWidget = ({ projectId }: { projectId: string }) => {
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

  // Simulate a backend API call
  const fetchData = async (projectId: string): Promise<MockDashboard> => {
    // Mock API response

    const response: MockDashboard = {
      projectId,
      systemOverview: {
        projects: 19,
        totalUnits: 3,
        pendingTickets: 32,
        totalAdminUsers: 3,
      },
      alerts: [
        {
          alertType: "Smoke Alarm Activated",
          unitAddress: "1000 De La Gauchetiere",
          unitNumber: "Unit 103",
        },
        {
          alertType: "Smoke Alarm Activated",
          unitAddress: "750 Peel Street",
          unitNumber: "Unit 205",
        },
        // {
        //   alertType: "Smoke Alarm Activated",
        //   unitAddress: "1500 Maisonneuve Blvd",
        //   unitNumber: "Unit 501",
        // },
      ],
      systemHealth: {
        systemsLive: 20,
        systemsDown: 1,
      },
    };

    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(response);
      }, 1000);
    });
  };

  useEffect(() => {
    const getData = async () => {
      const data = await fetchData(projectId);
      setSystemOverview(data.systemOverview);
      setSystemHealth(data.systemHealth);
      setSystemAlerts(data.alerts);
    };

    getData();
  }, [projectId]);

  return (
    <div className="flex flex-col md:flex-row justify-between bg-[#14323B] p-1.5 rounded-[7px] shadow-md md:max-w-full hover:bg-[#4B7D8D] transition duration-300 text-[#fff] w-full p-2.5 gap-2">
      <SystemOverviewWidget systemOverview={systemOverview} />
      <AlertWidget systemAlerts={systemAlerts} />
      <SystemHealthWidget systemHealth={systemHealth} />
    </div>
  );
};

export default DashboardWidget;

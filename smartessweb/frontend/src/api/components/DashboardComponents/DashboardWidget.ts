import { API_URL } from "@/api/api";

export interface SystemOverview {
  projects: number;
  totalUnits: number;
  pendingTickets: number;
  totalAdminUsers: number;
}

export interface SystemAlerts {
  alertType: string;
  unitAddress: string;
  unitNumber: string;
}

export interface SystemHealth {
  systemsLive: number;
  systemsDown: number;
}

export interface DashboardData {
  companyId: string;
  systemOverview: SystemOverview;
  alerts: SystemAlerts[];
  systemHealth: SystemHealth;
}

export const dashboardApi = {
  getDashboardData: async (token: string): Promise<DashboardData> => {
    const response = await fetch(
      `${API_URL}/widgets/dashboard`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch dashboard data');
    }

    return data;
  }
};
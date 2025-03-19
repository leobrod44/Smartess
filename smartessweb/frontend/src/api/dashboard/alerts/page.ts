import { API_URL } from "../../api";

import { Project } from "@/app/mockData";

export const alertsApi = {
    getProjectsForAlerts: async (token: string): Promise<{ projects: Project[] }> => {
        const response = await fetch(`${API_URL}/alerts/get_projects_for_alerts`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
    
        const data = await response.json();
    
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch projects for alerts");
        }
    
        return data;
      },
  };
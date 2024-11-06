import { API_URL } from "../api";

interface ApiProject {
  proj_id: string;
  name: string;
  address: string;
  units_count: number;
  hub_users_count: number;
  admin_users_count: number;
  pending_tickets_count: number;
  unit_numbers: string[];
}

interface ProjectsResponse {
  projects: ApiProject[];
}

export const projectApi = {
  getUserProjects: async (token: string): Promise<ProjectsResponse> => {
    const response = await fetch(`${API_URL}/projects/get_user_projects`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch projects');
    }

    return data;
  }
};
import { API_URL } from "./api";
import { Project, OrgUser } from "@/app/mockData";

export const projectApi = {
  getUserProjects: async (token: string): Promise<{ projects: Project[] }> => {
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

export const orgUsersApi = {
  getOrgUsersApi: async (token: string): Promise<{ orgUsers: OrgUser[] }> => {
    const response = await fetch(`${API_URL}/manage-accounts/get-org-users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch org users');
    }

    return data;
  }
};
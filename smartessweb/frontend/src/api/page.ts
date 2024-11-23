import { API_URL } from "./api";
import { Project, OrgUser, Individual, CurrentUser } from "@/app/mockData";

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

export const manageAccountsApi = {
  getCurrentUserApi: async (token: string): Promise<{ currentUser: CurrentUser }> => {
    const response = await fetch(`${API_URL}/manage-accounts/get-current-user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch current user data');
    }

    return data;
  },

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
  },

  getOrgIndividualsData: async (fetchedOrgUsers: OrgUser[], token: string): Promise<{ individuals: Individual[] }> => {
    const response = await fetch(`${API_URL}/manage-accounts/get-org-individuals-data`, {
      method: 'POST', 
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fetchedOrgUsers }), 
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch individual data');
    }

    return data;
  },

  getOrgUsersProjects: async (fetchedOrgUsers: OrgUser[], token: string): Promise<{ projects: Project[] }> => {
    const response = await fetch(`${API_URL}/manage-accounts/get-org-users-projects`, {
      method: 'POST', 
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fetchedOrgUsers }), 
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch project data');
    }

    return data;
  },

  getOrgProjects: async (currentOrg: number | undefined, token: string): Promise<{ orgProjects: Project[] }> => {
    const response = await fetch(`${API_URL}/manage-accounts/get-org-projects`, {
      method: 'POST', 
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentOrg }), 
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch project data');
    }

    return data;
  },

  assignOrgUserToProject: async (user_id: number, org_id: number | undefined, proj_ids: number[], org_user_type: string, token: string): Promise<void> => {
    const response = await fetch(`${API_URL}/manage-accounts/assign-org-user-to-project`, {
      method: 'POST', 
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id,
        org_id,
        proj_ids,
        org_user_type
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch project data');
    }

    return data;
  }
};
import { API_URL } from "./api";
import {
  Project,
  OrgUser,
  Individual,
  CurrentUser,
  Unit,
} from "@/app/mockData";

export interface ManageAccEmailResponse {
  message: string;
}

export const projectApi = {
  getUserProjects: async (token: string): Promise<{ projects: Project[] }> => {
    const response = await fetch(`${API_URL}/projects/get_user_projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch projects");
    }

    return data;
  },
};

export const manageAccountsApi = {
  getCurrentUserApi: async (
    token: string
  ): Promise<{ currentUser: CurrentUser }> => {
    const response = await fetch(
      `${API_URL}/manage-accounts/get-current-user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch current user data");
    }

    return data;
  },

  storeProfilePictureApi: async (
    token: string,
    formData: FormData
  ): Promise<void> => {
    const response = await fetch(`${API_URL}/users/post_profile_picture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to store profile picture");
    }
    return data;
  },

  getOrgUsersApi: async (token: string): Promise<{ orgUsers: OrgUser[] }> => {
    const response = await fetch(`${API_URL}/manage-accounts/get-org-users`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch org users");
    }

    return data;
  },

  getOrgIndividualsData: async (
    fetchedOrgUsers: OrgUser[],
    token: string
  ): Promise<{ individuals: Individual[] }> => {
    const response = await fetch(
      `${API_URL}/manage-accounts/get-org-individuals-data`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fetchedOrgUsers }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch individual data");
    }

    return data;
  },

  getOrgUsersProjects: async (
    fetchedOrgUsers: OrgUser[],
    token: string
  ): Promise<{ projects: Project[] }> => {
    const response = await fetch(
      `${API_URL}/manage-accounts/get-org-users-projects`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fetchedOrgUsers }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch project data");
    }

    return data;
  },

  getOrgProjects: async (
    currentOrg: number | undefined,
    token: string
  ): Promise<{ orgProjects: Project[] }> => {
    const response = await fetch(
      `${API_URL}/manage-accounts/get-org-projects`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentOrg }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch project data");
    }

    return data;
  },

  assignOrgUserToProject: async (
    user_id: number,
    org_id: number | undefined,
    proj_ids: number[],
    org_user_type: string,
    token: string
  ): Promise<void> => {
    const response = await fetch(
      `${API_URL}/manage-accounts/assign-org-user-to-project`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id,
          org_id,
          proj_ids,
          org_user_type,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to assign project to user");
    }

    return data;
  },

  removeOrgUserFromProject: async (
    user_id: number,
    org_id: number | undefined,
    proj_ids: number[],
    token: string
  ): Promise<void> => {
    const response = await fetch(
      `${API_URL}/manage-accounts/remove-org-user-from-project`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id,
          org_id,
          proj_ids,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to remove project from user");
    }

    return data;
  },

  changeOrgUserRole: async (
    user_id: number,
    org_id: number | undefined,
    role: string,
    token: string
  ): Promise<void> => {
    const response = await fetch(
      `${API_URL}/manage-accounts/change-org-user-role`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id,
          org_id,
          role,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to change organization user role");
    }

    return data;
  },

  deleteOrgUser: async (
    user_id: number,
    org_id: number | undefined,
    token: string
  ): Promise<void> => {
    const response = await fetch(`${API_URL}/manage-accounts/delete-org-user`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id,
        org_id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to remove user from organization");
    }

    return data;
  },

  /**
   * Sends an invitation email to a user by making a POST request to the API.
   *
   * This function sends a request to the `/manage-accounts/invite-user-email` endpoint
   * with the provided authentication token and form data containing the invitation details.
   *
   * @param {string} token - The authentication token used for authorization.
   * @param {FormData} formData - The form data containing the email, role, sender's name,
   * and selected projects.
   *
   * @returns {Promise<ManageAccEmailResponse>} - A promise that resolves with the API response.
   *
   * @throws {Error} If the request fails, an error is thrown containing the API error message
   * or a default error message ("Failed to send invite email").
   */
  sendInvite: async (
    token: string,
    formData: FormData
  ): Promise<ManageAccEmailResponse> => {
    const formDataObj: Record<string, string> = {};
    formData.forEach((value, key) => {
      formDataObj[key] = value as string;
    });

    const response = await fetch(
      `${API_URL}/manage-accounts/invite-user-email`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to send invite email in page.ts");
    }
    console.log("Response Data:", data);
    return data;
  },
};

export const unitsApi = {
  getUserProjects: async (token: string): Promise<{ projects: Project[] }> => {
    const response = await fetch(`${API_URL}/units/get-user-projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch projects");
    }

    return data;
  },
};

export const individualUnitApi = {
  getCurrentUserApi: async (
    token: string
  ): Promise<{ currentUser: CurrentUser }> => {
    const response = await fetch(
      `${API_URL}/individual-unit/get-current-user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch current user data");
    }

    return data;
  },

  getIndividualUnit: async (
    projAddress: string,
    unit_id: string,
    token: string
  ): Promise<{ unit: Unit }> => {
    const response = await fetch(
      `${API_URL}/individual-unit/get-individual-unit`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projAddress,
          unit_id,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch unit");
    }

    return data;
  },

  removeUserFromHub: async (
    user_id: string | undefined,
    token: string
  ): Promise<void> => {
    const response = await fetch(
      `${API_URL}/individual-unit/remove-user-from-hub`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to remove user from hub");
    }

    return data;
  },
};

export const surveillanceApi = {
  getUserProjects: async (token: string): Promise<{ projects: Project[] }> => {
    const response = await fetch(`${API_URL}/surveillance/get-user-projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch projects");
    }

    return data;
  },

  getProjectImages: async (token: string): Promise<{ images: string[] }> => {
    const response = await fetch(`${API_URL}/surveillance/get-project-images`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch project images");
    }

    return data;
  },
};

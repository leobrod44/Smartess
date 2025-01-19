import { API_URL } from "@/api/api";

export interface AnnouncementResponse {
  message: string;
}

export const announcementApi = {
  getOrgId: async (userId: string): Promise<{ orgId: string }> => {
    const response = await fetch(
      `${API_URL}/announcements/get_current_user_org_id/${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch organization ID");
    }

    return data;
  },

  getEmailsInOrg: async (orgId: string): Promise<{ emails: string[] }> => {
    const response = await fetch(
      `${API_URL}/announcements/get_hub_user_emails_org/${orgId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch emails in organization");
    }

    return data;
  },

  getEmailsInProject: async (projId: string): Promise<{ emails: string[] }> => {
    const response = await fetch(
      `${API_URL}/announcements/get_hub_user_emails_proj/${projId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch emails in project");
    }

    return data;
  },

  sendAnnouncement: async (
    formData: FormData
  ): Promise<AnnouncementResponse> => {
    const response = await fetch(
      `${API_URL}/announcements/send_announcement_email`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to send announcement");
    }

    return data;
  },
};

import { API_URL } from "@/api/api";

export interface AnnouncementResponse {
  message: string;
}

export const announcementApi = {
  // 1) Fetch orgId for a given user
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

  // 2) Fetch all emails in an organization
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

  // 3) Fetch all emails in a project
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

  // 4) Store the announcement in DB, uploading files to Supabase (via /post_announcement).
  postAnnouncement: async (
    formData: FormData
  ): Promise<AnnouncementResponse> => {
    const response = await fetch(`${API_URL}/announcements/post_announcement`, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to post announcement");
    }
    return data;
  },

  // 5) Send the announcement email (optionally with attachments).
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

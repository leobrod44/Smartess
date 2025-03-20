import { API_URL } from "@/api/api";

export interface TicketNotification {
  notification_id: string;
  notification_to_user_id: string;
  ticket_id: string;
  ticket_description: string;
  assigned_to_user_id: string;
  assigned_by_user_id: string;
  is_seen: boolean;
  created_at: string;
  notification_type: string;
}

export const ticketNotificationsApi = {
  getNotifications: async (token: string): Promise<TicketNotification[]> => {
    const response = await fetch(
      `${API_URL}/tickets/get-ticket-notifications`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch ticket notifications");
    }
    return data;
  },
  updateTicketNotification: async (
    token: string,
    ticket_id: string
  ): Promise<void> => {
    const response = await fetch(
      `${API_URL}/tickets/update-ticket-notification`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticket_id }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.error || "Failed to update ticket resolution status"
      );
    }
  },
};

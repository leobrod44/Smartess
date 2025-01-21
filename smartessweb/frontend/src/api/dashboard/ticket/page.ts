import { API_URL } from "@/api/api";

export interface APITicketList {
  ticket_id: string;
  proj_id: string;
  unit_id: string;
  name: string;
  description: string;
  type: string;
  unit: string | null;
  status: string;
  created_at: string;
}

export interface TicketResponse {
  tickets: APITicketList[];
}

export const ticketsListApi = {
  getTickets: async (token: string): Promise<TicketResponse> => {
    const response = await fetch(`${API_URL}/tickets/get-tickets`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch tickets");
    }

    return data;
  },
  deleteTicket: async (token: string, ticketId: string): Promise<void> => {
    const response = await fetch(
      `${API_URL}/tickets/delete-ticket/${ticketId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to delete ticket");
    }
  },
};

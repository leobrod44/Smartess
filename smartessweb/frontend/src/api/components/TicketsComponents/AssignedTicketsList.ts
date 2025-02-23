import { API_URL } from "@/api/api";

export interface APIAssignedTicket {
  ticketId: string;
  projectId: string;
  unitId: string;
  name: string;
  description: string;
  type: string;
  unit: string;
  status: string;
  date: string;
  isResolved: boolean;
}

export interface AssignedTicketsResponse {
  tickets: APIAssignedTicket[];
}

export interface UpdateTicketResolutionRequest {
  ticket_id: string;
  status: 'resolved' | 'unresolved';
}

export const ticketResolutionApi = {
  updateTicketResolution: async (
    token: string, 
    request: UpdateTicketResolutionRequest
  ): Promise<void> => {
    const response = await fetch(
      `${API_URL}/tickets/update-ticket-resolution`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update ticket resolution status");
    }
  },
};
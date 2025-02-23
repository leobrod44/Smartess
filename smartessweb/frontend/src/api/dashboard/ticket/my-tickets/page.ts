import { API_URL } from "@/api/api";

export interface APITicket {
    ticketId: string;
    projectId: string;
    unitId: string;
    name: string;
    description: string;
    type: "Alert" | "Repair" | "Other";
    unit: string;
    status: "Open" | "Pending" | "Closed";
    date: string;
    isResolved: boolean;
}

export const assignedTicketsApi = {
    async getAssignedTickets(token: string): Promise<{ tickets: APITicket[] }> {
        const response = await fetch(`${API_URL}/tickets/get-assigned-tickets-for-user`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        });

        if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch assigned tickets");
        }

        return response.json();
},
};
  
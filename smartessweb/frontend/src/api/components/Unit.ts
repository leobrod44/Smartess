import { API_URL } from "../api";
import { HubUser, TicketsType, Owner, Alert } from "@/app/mockData";
interface HubDetails {
  owner: Owner;
  hubUsers: HubUser[];
  tickets: TicketsType;
  alerts: Alert[];
}

export const hubApi = {
  getHubDetails: async (projectId: string, unitNumber: string, token: string): Promise<HubDetails> => {
    const response = await fetch(
      `${API_URL}/hubs/${projectId}/units/${unitNumber}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch hub details');
    }

    return data;
  }
};
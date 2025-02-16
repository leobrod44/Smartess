import { API_URL } from "@/api/api";

export interface EnergyConsumption {
  id: string;
  proj_id: string;
  hub_id: string;
  unit_number: string;
  created_at: string;
  monthly_energy_consumption: number[];
  monthly_temperature: number[];
  daily_energy_consumption: number[];
  projectAddress: string;
  currentMonthConsumption: number;
  currentMonthTemperature: number;
  variation: number;
}

export interface EnergyConsumptionsData {
  energyConsumptionData: EnergyConsumption[];
}

export const energyConsumptionApi = {
  getEnergyConsumptions: async (
    userId: string
  ): Promise<EnergyConsumptionsData> => {
    const response = await fetch(
      `${API_URL}/consumptions/get_consumptions/${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(
        errorMessage.error || "Failed to fetch energy consumption data"
      );
    }

    const data: EnergyConsumptionsData = await response.json();
    return data;
  },
  getConsumption: async (hubId: string): Promise<EnergyConsumptionsData> => {
    const response = await fetch(
      `${API_URL}/consumptions/get_consumption/${hubId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(
        errorMessage.error || "Failed to fetch energy consumption data"
      );
    }

    const data: EnergyConsumptionsData = await response.json();
    return data;
  },
};

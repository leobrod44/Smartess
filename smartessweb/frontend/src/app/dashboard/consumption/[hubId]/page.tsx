"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { energyConsumptionApi } from "@/api/dashboard/energyConsumption/page";

interface EnergyConsumption {
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

const IndividualConsumptionPage = ({
  params,
}: {
  params: { hubId: string };
}) => {
  const { hubId } = params;
  const [consumption, setConsumption] = useState<EnergyConsumption | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchConsumption() {
      try {
        const response = await energyConsumptionApi.getConsumption(hubId);
        setConsumption(response.energyConsumptionData[0]);
        console.log(consumption);
      } catch (err: any) {
        setError(err.message || "Failed to fetch consumption data");
      } finally {
        setLoading(false);
      }
    }
    fetchConsumption();
  }, [hubId]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!consumption) {
    return <div className="p-4">No consumption data available.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 min-h-screen">
      {/* Top Left Area */}
      <div className="border p-4">
        <h2 className="text-xl font-bold">General Energy Consumption Stats</h2>
        <p>
          <strong>Project Address:</strong> {consumption.projectAddress}
        </p>
        <p>
          <strong>Unit Number:</strong> {consumption.unit_number}
        </p>
        <p>
          <strong>Current Month Consumption:</strong>{" "}
          {consumption.currentMonthConsumption}
        </p>
        <p>
          <strong>Current Month Temperature:</strong>{" "}
          {consumption.currentMonthTemperature}
        </p>
        <p>
          <strong>Variation:</strong> {consumption.variation}%
        </p>
      </div>

      {/* Top Right Area */}
      <div className="border p-4">
        <h2 className="text-xl font-bold">Daily Energy Consumption</h2>
        <p>
          <strong>Daily Energy Consumption:</strong>{" "}
          {consumption.daily_energy_consumption.join(", ")}
        </p>
      </div>

      {/* Bottom Area */}
      <div className="border p-4 col-span-1 md:col-span-2">
        <h2 className="text-xl font-bold">Monthly Energy Consumption</h2>
        <p>
          <strong>Monthly Energy Consumption:</strong>{" "}
          {consumption.monthly_energy_consumption.join(", ")}
        </p>
        <p>
          <strong>Monthly Temperature:</strong>{" "}
          {consumption.monthly_temperature.join(", ")}
        </p>
      </div>
    </div>
  );
};

export default IndividualConsumptionPage;

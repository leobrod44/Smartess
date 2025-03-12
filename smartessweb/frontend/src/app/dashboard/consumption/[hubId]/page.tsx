"use client";

import { useState, useEffect } from "react";
import { energyConsumptionApi } from "@/api/dashboard/energyConsumption/page";
import EnergyConsumptionStats from "@/app/components/EnergyConsumptionComponents/EnergyConsumptionStats";
import DailyConsumptionChart from "@/app/components/EnergyConsumptionComponents/DailyConsumptionChart";
import MonthlyConsumptionChart from "@/app/components/EnergyConsumptionComponents/MonthlyConsumptionChart";
import BackArrowButton from "@/app/components/BackArrowBtn";

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
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch consumption data"
        );
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

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dailyChartData = dayNames.map((day, index) => ({
    name: day,
    energyConsumption: consumption.daily_energy_consumption[index] ?? 0,
  }));

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthlyChartData = monthNames.map((month, index) => ({
    month,
    energyConsumption: consumption.monthly_energy_consumption[index] ?? 0,
    temperature: consumption.monthly_temperature[index] ?? 0,
  }));

  return (
    <div className="mx-4 lg:mx-8 min-h-screen flex flex-col">
      <div className="flex items-center justify-between pb-4">
        <h1 className="text-[#325a67] text-[30px] leading-10 tracking-tight">
          Energy Consumption Overview
        </h1>
        <BackArrowButton />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 min-h-screen">
        <EnergyConsumptionStats consumption={consumption} />
        <DailyConsumptionChart dailyData={dailyChartData} />
        <MonthlyConsumptionChart monthlyData={monthlyChartData} />
      </div>
    </div>
  );
};

export default IndividualConsumptionPage;

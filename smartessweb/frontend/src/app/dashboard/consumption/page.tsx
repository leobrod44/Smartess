"use client";

import { useProjectContext } from "@/context/ProjectProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { energyConsumptionApi } from "@/api/dashboard/energyConsumption/page";
import { useUserContext } from "@/context/UserProvider";
import EnergyConsumptionComponent from "@/app/components/EnergyConsumptionComponents/EnergyConsumptionComponent";

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

const ConsumptionPage = () => {
  const { selectedProjectId } = useProjectContext();
  const { userId } = useUserContext();
  const router = useRouter();

  const [energyConsumptions, setEnergyConsumptions] = useState<
    EnergyConsumption[]
  >([]);
  const [filteredEnergyConsumptions, setFilteredEnergyConsumptions] = useState<
    EnergyConsumption[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/sign-in");
      return;
    }

    console.log(userId);

    const fetchEnergyConsumptions = async () => {
      try {
        const response = await energyConsumptionApi.getEnergyConsumptions(
          userId
        );

        const fetchedEnergyConsumptions = response.energyConsumptionData;

        setEnergyConsumptions(fetchedEnergyConsumptions);
      } catch (err) {
        console.error("Error fetching energy consumption data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load energy consumption data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEnergyConsumptions();
  }, [router, userId]);

  useEffect(() => {
    if (selectedProjectId) {
      setFilteredEnergyConsumptions(
        energyConsumptions.filter((ec) => ec.proj_id === selectedProjectId)
      );
    } else {
      setFilteredEnergyConsumptions(energyConsumptions);
    }
  }, [selectedProjectId, energyConsumptions]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-[#14323B] text-lg">
          Loading energy consumption data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="border border-black rounded-lg p-6 mx-4 lg:mx-8 mt-6 min-h-screen flex flex-col">
      <div className="text-left text-[#325a67] text-[30px] leading-10 tracking-tight pb-4">
        Energy Consumption
      </div>
      <EnergyConsumptionComponent
        energyConsumptions={filteredEnergyConsumptions}
      />
    </div>
  );
};

export default ConsumptionPage;

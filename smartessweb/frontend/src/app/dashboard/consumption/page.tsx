"use client";

import { useProjectContext } from "@/context/ProjectProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { energyConsumptionApi } from "@/api/dashboard/energyConsumption/page";
import { useUserContext } from "@/context/UserProvider";
import EnergyConsumptionComponent from "@/app/components/EnergyConsumptionComponents/EnergyConsumptionComponent";
import FilterComponent from "@/app/components/FilterList";
import Searchbar from "@/app/components/Searchbar";

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

const filterOptionsConsumption = [
  "Highest Consumption",
  "Lowest Consumption",
  "Highest Temperature",
  "Lowest Temperature",
  "Highest Variation",
  "Lowest Variation",
];

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
  const [query, setQuery] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/sign-in");
      return;
    }

    const fetchEnergyConsumptions = async () => {
      try {
        const response = await energyConsumptionApi.getEnergyConsumptions(
          userId
        );
        const fetchedEnergyConsumptions = response.energyConsumptionData;
        setEnergyConsumptions(fetchedEnergyConsumptions);
        setError(null);
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
    let visibleConsumptions = selectedProjectId
      ? energyConsumptions.filter((ec) => ec.proj_id === selectedProjectId)
      : [...energyConsumptions];

    if (query.trim()) {
      visibleConsumptions = visibleConsumptions.filter((ec) =>
        [ec.unit_number, ec.projectAddress].some((field) =>
          field?.toString().toLowerCase().includes(query.toLowerCase())
        )
      );
    }

    setFilteredEnergyConsumptions(visibleConsumptions);
  }, [selectedProjectId, energyConsumptions, query]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  const handleFilterChange = (filterValue: string) => {
    const newFilteredConsumptions = [...filteredEnergyConsumptions];

    switch (filterValue) {
      case "Highest Consumption":
        newFilteredConsumptions.sort(
          (a, b) => b.currentMonthConsumption - a.currentMonthConsumption
        );
        break;
      case "Lowest Consumption":
        newFilteredConsumptions.sort(
          (a, b) => a.currentMonthConsumption - b.currentMonthConsumption
        );
        break;
      case "Highest Temperature":
        newFilteredConsumptions.sort(
          (a, b) => b.currentMonthTemperature - a.currentMonthTemperature
        );
        break;
      case "Lowest Temperature":
        newFilteredConsumptions.sort(
          (a, b) => a.currentMonthTemperature - b.currentMonthTemperature
        );
        break;
      case "Highest Variation":
        newFilteredConsumptions.sort(
          (a, b) => Math.abs(b.variation) - Math.abs(a.variation)
        );
        break;
      case "Lowest Variation":
        newFilteredConsumptions.sort(
          (a, b) => Math.abs(a.variation) - Math.abs(b.variation)
        );
        break;
      default:
        break;
    }
    setFilteredEnergyConsumptions(newFilteredConsumptions);
  };

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
      <div className="flex items-center justify-between pb-4">
        <h1 className="text-[#325a67] text-[30px] leading-10 tracking-tight">
          Energy Consumption
        </h1>
        <div className="flex items-center space-x-4">
          <FilterComponent
            onFilterChange={handleFilterChange}
            filterOptions={filterOptionsConsumption}
          />
          <Searchbar onSearch={handleSearch} />
        </div>
      </div>
      <EnergyConsumptionComponent
        energyConsumptions={filteredEnergyConsumptions}
        query={query}
      />
    </div>
  );
};

export default ConsumptionPage;

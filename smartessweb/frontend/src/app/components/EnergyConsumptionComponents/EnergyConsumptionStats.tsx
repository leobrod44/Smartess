"use client";

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

interface EnergyConsumptionStatsProps {
  consumption: EnergyConsumption;
}

function getConsumptionInfo(consumption: number) {
  if (consumption < 700) {
    return { color: "bg-[#729987]", label: "Low consumption (<700kW)" };
  } else if (consumption <= 850) {
    return {
      color: "bg-[#CAB86B]",
      label: "Moderate consumption (700–850kW)",
    };
  } else {
    return { color: "bg-[#A6634F]", label: "High consumption (>850kW)" };
  }
}

function getTemperatureInfo(temp: number) {
  if (temp < 19) {
    return { color: "bg-[#729987]", label: "Cool (<19°C)" };
  } else if (temp <= 21) {
    return { color: "bg-[#CAB86B]", label: "Comfortable (19–21°C)" };
  } else {
    return { color: "bg-[#A6634F]", label: "Warm (>21°C)" };
  }
}

function getVariationInfo(variation: number) {
  if (variation <= -10) {
    return {
      color: "bg-[#A6634F]",
      label: "Significantly decreased (≤ -10%)",
    };
  } else if (variation < -5) {
    return {
      color: "bg-[#CAB86B]",
      label: "Moderately decreased (-10% to -5%)",
    };
  } else if (variation <= 5) {
    return { color: "bg-[#729987]", label: "Stable (-5% to 5%)" };
  } else if (variation <= 10) {
    return {
      color: "bg-[#CAB86B]",
      label: "Moderately increased (5% to 10%)",
    };
  } else {
    return { color: "bg-[#A6634F]", label: "Significantly increased (>10%)" };
  }
}

const EnergyConsumptionStats: React.FC<EnergyConsumptionStatsProps> = ({
  consumption,
}) => {
  const consumptionInfo = getConsumptionInfo(
    consumption.currentMonthConsumption
  );
  const temperatureInfo = getTemperatureInfo(
    consumption.currentMonthTemperature
  );
  const variationInfo = getVariationInfo(consumption.variation);

  return (
    <div className="border border-gray-200 p-8 h-full flex flex-col bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-8">Energy Consumption Stats</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-grow">
        <div className="font-semibold text-gray-600">Project Address:</div>
        <div className="text-gray-800">{consumption.projectAddress}</div>

        <div className="font-semibold text-gray-600">Unit Number:</div>
        <div className="text-gray-800">{consumption.unit_number}</div>

        <div className="font-semibold text-gray-600">Energy Consumption:</div>
        <div
          className={`
            relative group
            w-full
            h-8
            rounded-full
            flex
            items-center
            justify-center
            text-white
            ${consumptionInfo.color}
            transition-all duration-300
            cursor-pointer
          `}
        >
          <span className="text-base font-medium">
            {consumption.currentMonthConsumption}
          </span>
          <div
            className="
              absolute
              bottom-full
              mb-1
              hidden
              group-hover:block
              w-40
              bg-white
              text-black
              text-xs
              p-2
              border border-gray-300
              rounded
              shadow
              z-20
              opacity-0
              group-hover:opacity-100
              transition-opacity duration-300
            "
            role="tooltip"
          >
            {consumptionInfo.label}
          </div>
        </div>

        <div className="font-semibold text-gray-600">Temperature:</div>
        <div
          className={`
            relative group
            w-full
            h-8
            rounded-full
            flex
            items-center
            justify-center
            text-white
            ${temperatureInfo.color}
            transition-all duration-300
            cursor-pointer
          `}
        >
          <span className="text-base font-medium">
            {consumption.currentMonthTemperature}
          </span>
          <div
            className="
              absolute
              bottom-full
              mb-1
              hidden
              group-hover:block
              w-40
              bg-white
              text-black
              text-xs
              p-2
              border border-gray-300
              rounded
              shadow
              z-20
              opacity-0
              group-hover:opacity-100
              transition-opacity duration-300
            "
            role="tooltip"
          >
            {temperatureInfo.label}
          </div>
        </div>

        <div className="font-semibold text-gray-600">Variation:</div>
        <div
          className={`
            relative group
            w-full
            h-8
            rounded-full
            flex
            items-center
            justify-center
            text-white
            ${variationInfo.color}
            transition-all duration-300
            cursor-pointer
          `}
        >
          <span className="text-base font-medium">{consumption.variation}</span>
          <div
            className="
              absolute
              bottom-full
              mb-1
              hidden
              group-hover:block
              w-40
              bg-white
              text-black
              text-xs
              p-2
              border border-gray-300
              rounded
              shadow
              z-20
              opacity-0
              group-hover:opacity-100
              transition-opacity duration-300
            "
            role="tooltip"
          >
            {variationInfo.label}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnergyConsumptionStats;

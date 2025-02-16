import React, { useState, FC } from "react";
import { Pagination } from "@mui/material";

interface EnergyConsumption {
  id: string;
  projId: string;
  hubId: string;
  unitNumber: string;
  monthlyEnergyConsumption: number[];
  monthlyTemperature: number[];
  dailyEnergyConsumption: number[];
  address: string;
  currentMonthConsumption: number;
  currentMonthTemperature: number;
  variation: number;
}

interface EnergyConsumptionProps {
  energyConsumptions: EnergyConsumption[];
}

function getConsumptionInfo(consumption: number) {
  if (consumption < 700) {
    return { color: "bg-[#729987]", label: "Low consumption (<700kW)" };
  } else if (consumption <= 850) {
    return { color: "bg-[#CAB86B]", label: "Moderate consumption (700–850kW)" };
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
    return { color: "bg-[#A6634F]", label: "Significantly decreased (≤ -10%)" };
  } else if (variation < -5) {
    return {
      color: "bg-[#CAB86B]",
      label: "Moderately decreased (-10% to -5%)",
    };
  } else if (variation <= 5) {
    return { color: "bg-[#729987]", label: "Stable (-5% to 5%)" };
  } else if (variation <= 10) {
    return { color: "bg-[#CAB86B]", label: "Moderately increased (5% to 10%)" };
  } else {
    return { color: "bg-[#A6634F]", label: "Significantly increased (>10%)" };
  }
}

const ITEMS_PER_PAGE = 6;

const EnergyConsumptionInfo: FC<EnergyConsumptionProps> = ({
  energyConsumptions,
}) => {
  const [page, setPage] = useState(1);

  const handleChangePage = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const itemsToDisplay = energyConsumptions.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(energyConsumptions.length / ITEMS_PER_PAGE);

  if (energyConsumptions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        No data available
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen justify-between p-4">
      <div className="mx-auto w-full">
        {itemsToDisplay.map((item) => {
          const consumptionInfo = getConsumptionInfo(
            item.currentMonthConsumption
          );
          const temperatureInfo = getTemperatureInfo(
            item.currentMonthTemperature
          );
          const variationInfo = getVariationInfo(item.variation);

          return (
            <div
              key={item.id}
              className="
                bg-white
                rounded-lg
                shadow-md
                p-4
                my-2
                border 
                border-black 
                border-opacity-30
                hover:border-[#4b7d8d]
                transition 
                duration-300
              "
            >
              {/* Desktop / Tablet Layout */}
              <div className="hidden md:block">
                <div
                  className="
                    grid
                    md:[grid-template-columns:30%_1fr_1fr_1fr_1fr]
                    gap-4
                    w-full
                    border-b
                    border-gray-300
                    pb-2
                    items-center
                    justify-items-center
                    text-center
                    font-semibold
                  "
                >
                  <div>Address</div>
                  <div>Unit Number</div>
                  <div>Energy Consumption</div>
                  <div>Temperature</div>
                  <div>Variation</div>
                </div>

                <div
                  className="
                    grid
                    md:[grid-template-columns:30%_1fr_1fr_1fr_1fr]
                    gap-4
                    w-full
                    pt-2
                    items-center
                    justify-items-center
                    text-center
                  "
                >
                  <div>{item.address}</div>
                  <div>{item.unitNumber}</div>

                  <div
                    className={`
                      relative group
                      w-[100px]
                      h-8
                      rounded-full
                      flex
                      items-center
                      justify-center
                      text-white
                      ${consumptionInfo.color}
                    `}
                  >
                    <span className="text-base">
                      {item.currentMonthConsumption}
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
                        border
                        border-gray-300
                        rounded
                        shadow
                        z-10
                      "
                    >
                      {consumptionInfo.label}
                    </div>
                  </div>

                  <div
                    className={`
                      relative group
                      w-[100px]
                      h-8
                      rounded-full
                      flex
                      items-center
                      justify-center
                      text-white
                      ${temperatureInfo.color}
                    `}
                  >
                    <span className="text-base">
                      {item.currentMonthTemperature}
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
                        border
                        border-gray-300
                        rounded
                        shadow
                        z-10
                      "
                    >
                      {temperatureInfo.label}
                    </div>
                  </div>

                  <div
                    className={`
                      relative group
                      w-[100px]
                      h-8
                      rounded-full
                      flex
                      items-center
                      justify-center
                      text-white
                      ${variationInfo.color}
                    `}
                  >
                    <span className="text-base">{item.variation}</span>
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
                        border
                        border-gray-300
                        rounded
                        shadow
                        z-10
                      "
                    >
                      {variationInfo.label}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="block md:hidden">
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-semibold">Address:</div>
                  <div>{item.address}</div>

                  <div className="font-semibold">Unit Number:</div>
                  <div>{item.unitNumber}</div>

                  <div className="font-semibold">Energy:</div>
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
                    `}
                  >
                    <span className="text-base">
                      {item.currentMonthConsumption}
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
                        border
                        border-gray-300
                        rounded
                        shadow
                        z-10
                      "
                    >
                      {consumptionInfo.label}
                    </div>
                  </div>

                  <div className="font-semibold">Temp:</div>
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
                    `}
                  >
                    <span className="text-base">
                      {item.currentMonthTemperature}
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
                        border
                        border-gray-300
                        rounded
                        shadow
                        z-10
                      "
                    >
                      {temperatureInfo.label}
                    </div>
                  </div>

                  <div className="font-semibold">Variation:</div>
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
                    `}
                  >
                    <span className="text-base">{item.variation}</span>
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
                        border
                        border-gray-300
                        rounded
                        shadow
                        z-10
                      "
                    >
                      {variationInfo.label}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center mt-8">
        <Pagination
          className="custom-pagination"
          count={totalPages}
          page={page}
          onChange={handleChangePage}
          color="primary"
        />
      </div>
    </div>
  );
};

export default EnergyConsumptionInfo;

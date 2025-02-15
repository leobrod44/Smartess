import React, { useState, FC } from "react";
import { Pagination } from "@mui/material";

function getConsumptionColor(consumption: number): string {
  if (consumption < 700) {
    return "bg-[#729987]";
  } else if (consumption <= 850) {
    return "bg-[#CAB86B]";
  } else {
    return "bg-[#A6634F]";
  }
}

function getTemperatureColor(temp: number): string {
  if (temp < 19) {
    return "bg-[#729987]";
  } else if (temp <= 21) {
    return "bg-[#CAB86B]";
  } else {
    return "bg-[#A6634F]";
  }
}

function getVariationColor(variation: number): string {
  if (variation <= -10) {
    return "bg-[#A6634F]";
  } else if (variation < -5) {
    return "bg-[#CAB86B]";
  } else if (variation <= 5) {
    return "bg-[#729987]";
  } else if (variation <= 10) {
    return "bg-[#CAB86B]";
  } else {
    return "bg-[#A6634F]";
  }
}

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
        {itemsToDisplay.map((item) => (
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
                    w-[100px]
                    h-8
                    rounded-full
                    flex
                    items-center
                    justify-center
                    text-white
                    ${getConsumptionColor(item.currentMonthConsumption)}
                  `}
                >
                  <span className="text-base">
                    {item.currentMonthConsumption}
                  </span>
                </div>

                <div
                  className={`
                    w-[100px]
                    h-8
                    rounded-full
                    flex
                    items-center
                    justify-center
                    text-white
                    ${getTemperatureColor(item.currentMonthTemperature)}
                  `}
                >
                  <span className="text-base">
                    {item.currentMonthTemperature}
                  </span>
                </div>

                <div
                  className={`
                    w-[100px]
                    h-8
                    rounded-full
                    flex
                    items-center
                    justify-center
                    text-white
                    ${getVariationColor(item.variation)}
                  `}
                >
                  <span className="text-base">{item.variation}</span>
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
                    w-full
                    h-8
                    rounded-full
                    flex
                    items-center
                    justify-center
                    text-white
                    ${getConsumptionColor(item.currentMonthConsumption)}
                  `}
                >
                  <span className="text-base">
                    {item.currentMonthConsumption}
                  </span>
                </div>

                <div className="font-semibold">Temp:</div>
                <div
                  className={`
                    w-full
                    h-8
                    rounded-full
                    flex
                    items-center
                    justify-center
                    text-white
                    ${getTemperatureColor(item.currentMonthTemperature)}
                  `}
                >
                  <span className="text-base">
                    {item.currentMonthTemperature}
                  </span>
                </div>

                <div className="font-semibold">Variation:</div>
                <div
                  className={`
                    w-full
                    h-8
                    rounded-full
                    flex
                    items-center
                    justify-center
                    text-white
                    ${getVariationColor(item.variation)}
                  `}
                >
                  <span className="text-base">{item.variation}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
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

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import HubOwner from "./UnitComponents/HubOwner";
import HubUsers from "./UnitComponents/HubUsers";
import Tickets from "./UnitComponents/Tickets";
import Alerts from "../components/UnitComponents/Alerts";

import { HubUser, TicketsType, Owner, Unit, Alert } from "../mockData";

const UnitComponent = ({
  unit,
  projectAddress,
}: {
  unit: Unit;
  projectAddress: string;
}) => {
  const [hubUsers] = useState<HubUser[]>(unit.hubUsers || []);
  const [alerts] = useState<Alert[]>(unit.alerts || []);

  const router = useRouter();

  const [tickets] = useState<TicketsType>({
    total: unit.tickets?.total || 0,
    open: unit.tickets?.open || 0,
    pending: unit.tickets?.pending || 0,
    closed: unit.tickets?.closed || 0,
  });

  const [owner] = useState<Owner>(
    unit.owner || {
      tokenId: "",
      firstName: "",
      lastName: "",
      email: "",
    }
  );

  const handleViewUnit = () => {
    // Navigate to the unit details page with the dynamic route
    router.push(
      `../dashboard/individual-unit/${projectAddress}/unit/${unit.unit_id}`
    );
  };

  return (
    <div className="unit-container max-w-fit sm:max-w-full mx-auto">
      <div className="bg-[#fff] rounded-[7px] w-full mb-2">
        <div className="text-[#4B7D8D] text-xxl text-center text-2xl pt-8">
          {projectAddress}
        </div>
        <div className="text-[#729987] text-xl text-center p-2 ">
          Unit {unit.unitNumber}
        </div>

        <div className="unit-info-sections bg-white rounded-[7px] flex flex-col sm:flex-row">
          <div className="flex-1">
            <HubOwner owner={owner} />
          </div>

          <div className="flex-1 md:min-w-[108px]">
            <HubUsers hubUsers={hubUsers} />
          </div>
          <div className="flex-1">
            <Alerts alerts={alerts} />
          </div>

          <div className="flex-1 md:min-w-[150px]">
            <div className="mx-auto">
              <Tickets tickets={tickets} />
            </div>
          </div>
        </div>

        <div className="flex justify-center p-6">
          <div>
            <button
              className="bg-[#266472] rounded-md hover:bg-[#1f505e] w-40 h-10 text-white text-md hover:bg-[#1f505e] transition duration-300"
              onClick={handleViewUnit}
            >
              View Unit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitComponent;

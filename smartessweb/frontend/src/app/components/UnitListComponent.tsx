import { useState } from "react";
import HubOwner from "./UnitComponents/HubOwner";
import HubUsers from "./UnitComponents/HubUsers";
import Tickets from "./UnitComponents/Tickets";
import ActiveAlert from "./UnitComponents/ActiveAlerts";
import { User, TicketsType, Owner, Unit, ActiveAlerts } from "../mockData";

const UnitComponent = ({
  unit,
  projectAddress,
}: {
  unit: Unit;
  projectAddress: string;
}) => {
  const [users] = useState<User[]>(unit.users || []);
  const [tickets] = useState<TicketsType>(
    unit.tickets || {
      total: 0,
      open: 0,
      pending: 0,
      closed: 0,
    }
  );

  const [activeAlerts] = useState<ActiveAlerts>(
    unit.activeAlerts || {
      active: 0,
      closed: 0,
    }
  );

  const [owner] = useState<Owner>(
    unit.owner || {
      tokenId: "",
      firstName: "",
      lastName: "",
      email: "",
    }
  );
  return (
    <div className="unit-container max-w-fit sm:max-w-full mx-auto">
      <div className="bg-[#fff] rounded-[7px] w-full mt-4 mb-4 shadow-xl">
        <div className="text-[#4B7D8D] font-sequel-sans-black text-center text-2xl p-2">
          {projectAddress}
        </div>
        <div className="text-[#729987] text-xl font-sequel-sans-black text-center p-2">
          Unit {unit.unitNumber}
        </div>

        <div className="unit-info-sections bg-white rounded-[7px] flex flex-col sm:flex-row">
          <div className="flex-1">
            <HubOwner owner={owner} />
          </div>

          <div className="flex-1 md:min-w-[108px]">
            <HubUsers users={users} />
          </div>
          <div className="flex-1">
            <ActiveAlert activeAlerts={activeAlerts} />
          </div>

          <div className="flex-1 md:min-w-[150px]">
            <div className="w-3/5 mx-auto">
              <Tickets tickets={tickets} />
            </div>
          </div>
        </div>

        <div className="flex justify-center p-6">
          <div>
            <button className="bg-[#4b7d8d] w-40 h-12 rounded-[10px] text-white text-md font-sequel-sans-black hover:bg-[#1f505e] transition duration-300">
              View Unit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitComponent;

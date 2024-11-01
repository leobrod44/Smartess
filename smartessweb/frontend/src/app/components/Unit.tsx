import { useEffect, useState } from "react";
import HubOwner from "../components/UnitComponents/HubOwner";
import HubUsers from "../components/UnitComponents/HubUsers";
import Tickets from "../components/UnitComponents/Tickets";
import Alerts from "../components/UnitComponents/Alerts";
import {
  User,
  TicketsType,
  Owner,
  Unit,
  generateMockProjects,
} from "../mockData";

const UnitComponent = ({
  unitNumber,
  projectId,
}: {
  unitNumber: string;
  projectId: string;
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [tickets, setTickets] = useState<TicketsType>({
    total: 0,
    open: 0,
    pending: 0,
    closed: 0,
  });
  const [owner, setOwner] = useState<Owner>({
    tokenId: "",
    firstName: "",
    lastName: "",
    email: "",
  });
  const [alerts, setAlerts] = useState<{ message: string }[]>([]);

  // Simulate a backend API call
  const fetchData = async (
    projectId: string,
    unitNumber: string
  ): Promise<Unit | undefined> => {
    // Mock API response
    const project = generateMockProjects().find(
      (project) => project.projectId === projectId
    );
    // If the project is found, return the specific unit
    return project?.units.find((unit) => unit.unitNumber === unitNumber);
  };

  useEffect(() => {
    const getData = async () => {
      const data = await fetchData(projectId, unitNumber);
      if (data) {
        setUsers(data.users);
        setTickets(data.tickets);
        setOwner(data.owner);
        setAlerts(data.alerts);
      }
    };

    getData();
  }, [projectId, unitNumber]);

  return (
    <div className="unit-container bg-[#4b7d8d] p-[5px] rounded-[7px] shadow-xl max-w-fit sm:max-w-full mx-auto hover:bg-[#1f505e] transition duration-300">
      <div className=" w-full h-full unit-title text-white text-l flex justify-center">
        <button className="w-full font-sequel-sans-black">
          Unit {unitNumber}
        </button>
      </div>

      <div className="unit-info-sections bg-white rounded-[7px] flex flex-col sm:flex-row">
        <div className="flex-1">
          <HubOwner owner={owner} />
        </div>

        <div className="divider bg-[#a0bfca] w-[1px]"></div>

        <div className="flex-1 md:min-w-[108px]">
          <HubUsers users={users} />
        </div>

        <div className="divider bg-[#a0bfca] w-[1px]"></div>

        <div className="flex-1 md:min-w-[150px]">
          <Tickets tickets={tickets} />
        </div>

        <div className="divider bg-[#a0bfca] w-[1px]"></div>
        <div className="flex-1">
          <Alerts alerts={alerts} />
        </div>
      </div>
    </div>
  );
};

export default UnitComponent;

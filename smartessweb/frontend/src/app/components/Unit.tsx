import { useEffect, useState } from "react";
import HubOwner from "../components/UnitComponents/HubOwner";
import HubUsers from "../components/UnitComponents/HubUsers";
import Tickets from "../components/UnitComponents/Tickets";
import Alerts from "../components/UnitComponents/Alerts";
import {
  HubUser,
  TicketsType,
  Owner,
  Alert,
  Unit,
  generateMockProjects,
} from "../mockData";
import { hubApi } from "@/api/components/Unit";

interface UnitComponentProps {
  unitNumber: string;
  projectId: string;
  isTest?: boolean;
}

const UnitComponent = ({
  unitNumber,
  projectId,
  isTest = false,
}: UnitComponentProps) => {
  const [hubUsers, setHubUsers] = useState<HubUser[]>([]);
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
    telephone: "",
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMockData = async (
    projectId: string,
    unitNumber: string
  ): Promise<Unit | undefined> => {
    const project = generateMockProjects().find(
      (project) => project.projectId === projectId
    );
    return project?.units.find((unit) => unit.unitNumber === unitNumber);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isTest) {
          const unit = await fetchMockData(projectId, unitNumber);
          if (unit) {
            setHubUsers(unit.hubUsers);
            setTickets(unit.tickets);
            setOwner(unit.owner);
            setAlerts(unit.alerts);
          }
        } else {
          // Use real API
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("No authentication token found");
          }

          const data = await hubApi.getHubDetails(projectId, unitNumber, token);
          setHubUsers(data.hubUsers);
          setTickets(data.tickets);
          setOwner(data.owner);
          setAlerts(data.alerts);
        }
      } catch (err) {
        console.error("Error fetching hub details:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load hub details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, unitNumber, isTest]);

  if (loading) {
    return (
      <div className="unit-container bg-[#4b7d8d] p-[5px] rounded-[7px] shadow-xl max-w-fit sm:max-w-full mx-auto hover:bg-[#1f505e] transition duration-300">
        <div className="w-full h-full unit-title text-white text-l flex justify-center">
          <button className="w-full font-sequel-sans-black">
            Unit {unitNumber}
          </button>
        </div>

        <div className="unit-info-sections bg-white rounded-[7px] flex flex-col sm:flex-row items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 my-3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="unit-container bg-[#4b7d8d] p-[5px] rounded-[7px] shadow-xl max-w-fit sm:max-w-full mx-auto hover:bg-[#1f505e] transition duration-300">
      <div className="w-full h-full unit-title text-white text-l flex justify-center">
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
          <HubUsers hubUsers={hubUsers} />
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

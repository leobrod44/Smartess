import { useEffect, useState } from "react";
import HubOwner from "../components/UnitComponents/HubOwner";
import HubUsers from "../components/UnitComponents/HubUsers";
import Tickets from "../components/UnitComponents/Tickets";
import Alerts from "../components/UnitComponents/Alerts";
import { User, TicketsType, Owner, Alert } from "../mockData";

interface HubDetails {
  owner: Owner;
  users: User[];
  tickets: TicketsType;
  alerts: Alert[];
}

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
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHubDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(
          `http://localhost:3000/api/hubs/${projectId}/units/${unitNumber}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch hub details');
        }

        const data: HubDetails = await response.json();
        
        setUsers(data.users);
        setTickets(data.tickets);
        setOwner(data.owner);
        setAlerts(data.alerts);
      } catch (err) {
        console.error('Error fetching hub details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load hub details');
      } finally {
        setLoading(false);
      }
    };

    fetchHubDetails();
  }, [projectId, unitNumber]);

  if (loading) {
    return <div className="flex justify-center items-center p-4">
      <div className="text-[#14323B] text-lg">Loading unit details...</div>
    </div>;
  }

  if (error) {
    return <div className="flex justify-center items-center p-4">
      <div className="text-red-600 text-lg">{error}</div>
    </div>;
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
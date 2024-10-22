import { useEffect, useState } from "react";
import HubOwner from "../components/UnitComponents/HubOwner";
import HubUsers from "../components/UnitComponents/HubUsers";
import Tickets from "../components/UnitComponents/Tickets";
import Alerts from "../components/UnitComponents/Alerts";

interface User {
  firstName: string;
  lastName: string;
}

interface TicketsType {
  total: number;
  open: number;
  pending: number;
  closed: number;
}

interface Owner {
  firstName: string;
  lastName: string;
  email: string;
}
interface MockResponse {
  users: User[];
  tickets: TicketsType;
  owner: Owner;
  alerts: { message: string }[];
}

const Unit = ({ unitNumber }: { unitNumber: string }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [tickets, setTickets] = useState<TicketsType>({
    total: 0,
    open: 0,
    pending: 0,
    closed: 0,
  });
  const [owner, setOwner] = useState<Owner>({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [alerts, setAlerts] = useState<{ message: string }[]>([]);

  // Simulate a backend API call
  const fetchData = async (): Promise<MockResponse> => {
    // Mock API response
    const response: MockResponse = {
      users: [
        { firstName: "Mary", lastName: "Johnson" },
        { firstName: "Ken", lastName: "Long" },
        { firstName: "Michalo", lastName: "Jam" },
        { firstName: "Sierra", lastName: "McKnight" },
      ],
      tickets: {
        total: 19,
        open: 3,
        pending: 4,
        closed: 12,
      },
      owner: {
        firstName: "LARRY",
        lastName: "JOHNSON",
        email: "larryJ@hotmail.com",
      },
      alerts: [
        { message: "SMOKE ALARM ACTIVATED" },
        { message: "WATER leak DETECTED" },
        { message: "WATER LEAKSSS DETECTED" },
      ],
    };

    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(response);
      }, 1000);
    });
  };

  useEffect(() => {
    const getData = async () => {
      const data = await fetchData();
      setUsers(data.users);
      setTickets(data.tickets);
      setOwner(data.owner);
      setAlerts(data.alerts);
    };

    getData();
  }, []);

  return (
    <div className="unit-container bg-[#4b7d8d] p-[5px] rounded-[7px] shadow-md max-w-fit sm:max-w-full mx-auto hover:bg-[#1f505e] transition duration-300">
      <div className=" w-full h-full unit-title text-white text-l flex justify-center">
        <button className="w-full">Unit {unitNumber}</button>
      </div>
      <div className="unit-info-sections bg-white rounded-[7px] flex flex-col sm:flex-row justify-between px-4">
        <HubOwner owner={owner} />
        <div className="divider bg-[#a0bfca] w-[1px]"></div>

        <div className="flex-grow-0 flex-shrink-0">
          <HubUsers users={users} />
        </div>
        <div className="divider bg-[#a0bfca] w-[1px]"></div>

        <div className="flex-grow-0 flex-shrink-0">
          <Tickets tickets={tickets} />
        </div>
        <div className="divider bg-[#a0bfca] w-[1px] "></div>
        <Alerts alerts={alerts} />
      </div>
    </div>
  );
};

export default Unit;

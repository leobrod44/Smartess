import React, { useState, useEffect } from "react";
import HubOwner from "../components/UnitComponents/HubOwner";
import HubUsers from "../components/UnitComponents/HubUsers";
import Tickets from "../components/UnitComponents/Tickets";
import Alerts from "../components/UnitComponents/Alerts";

const Unit = () => {
  const users = [
    { firstName: "Mary", lastName: "Johnson" },
    { firstName: "Ken", lastName: "Long" },
    { firstName: "Michalo", lastName: "Jam" },
    { firstName: "Sierra", lastName: "McKnight" },
  ];

  const tickets = {
    total: 22, // Total tickets
    open: 3, // Open tickets
    pending: 4, // Pending tickets
    closed: 12, // Closed tickets
  };

  /*   const [hubData, setHubData] = useState<{
        unitNumber: string;
        owner: { name: string; email: string };
        users: string[];
        tickets: { total: number; pending: number; open: number; closed: number };
        alerts: { message: string; type: string }[];
      } | null>(null);
    
      useEffect(() => {
        const fetchData = async () => {
          // Replace with actual data fetching
          const response = await fetch('/api/getHubData');
          const data = await response.json();
          setHubData(data);
        };
    
        fetchData();
      }, []);
    
      if (!hubData) return <div>Loading...</div>; */

  return (
    <div className="unit-container bg-[#4b7d8d] p-[5px] rounded-[7px]">
      <div className="unit-title text-white text-xl px-3 flex justify-center">
        Unit 103
      </div>
      <div className="unit-info-sections bg-white rounded-[7px] flex justify-between gap-10 p-5">
        {/*  <HubOwner owner={hubData.owner} />
            <HubUsers users={hubData.users.slice(0, 3)} />
            <Tickets tickets={hubData.tickets} />
           <Alerts alerts={hubData.alerts} /> */}
        <HubOwner
          owner={{
            firstName: "LARRY",
            lastName: "JOHNSON",
            email: "larryJ@hotmail.com",
          }}
        />
        <div className="divider bg-[#a0bfca] w-[1px]"></div>
        <HubUsers users={users} />
        <div className="divider bg-[#a0bfca] w-[1px]"></div>
        <Tickets tickets={tickets} />
        <div className="divider bg-[#a0bfca] w-[1px]"></div>
        <Alerts
          alerts={[
            { message: "SMOKE ALARM ACTIVATED" },
            { message: "WATER leak DETECTED" },
            { message: "WATER LEAKSSS DETECTED" },
          ]}
        />
      </div>
    </div>
  );
};

export default Unit;

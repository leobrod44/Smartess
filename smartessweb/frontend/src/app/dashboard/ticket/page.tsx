"use client";

import { useProjectContext } from "@/context/ProjectProvider";
import { useEffect, useState } from "react";
import TicketList from "@/app/components/TicketComponents/TicketList";
import TicketWidget from "@/app/components/TicketComponents/TicketWidget";

interface Ticket {
  ticketId: string;
  projectId: string;
  unitId: string;
  name: string;
  description: string;
  type: string;
  unit: string;
  status: string;
  date: string;
}

const tickets: Ticket[] = [
  {
    ticketId: "1",
    projectId: "1",
    unitId: "101",
    name: "TICKET-001",
    description:
      "Fix broken window annanananananananananananananananananananan",
    type: "Repair",
    unit: "101",
    status: "Open",
    date: "2024-11-15",
  },
  {
    ticketId: "2",
    projectId: "1",
    unitId: "102",
    name: "TICKET-002",
    description: "Upgrade kitchen appliances",
    type: "Other",
    unit: "102",
    status: "Pending",
    date: "2024-11-14",
  },
  {
    ticketId: "3",
    projectId: "1",
    unitId: "103",
    name: "TICKET-003",
    description: "Repaint walls after tenant move-out",
    type: "Repair",
    unit: "103",
    status: "Closed",
    date: "2024-11-13",
  },
  {
    ticketId: "4",
    projectId: "2",
    unitId: "104",
    name: "TICKET-004",
    description: "Repair leaky faucet in bathroom",
    type: "Repair",
    unit: "104",
    status: "Open",
    date: "2024-11-12",
  },
  {
    ticketId: "5",
    projectId: "2",
    unitId: "105",
    name: "TICKET-005",
    description: "Install new security cameras",
    type: "Other",
    unit: "105",
    status: "Pending",
    date: "2024-11-11",
  },
  {
    ticketId: "6",
    projectId: "4",
    unitId: "106",
    name: "TICKET-006",
    description: "Enhance landscaping",
    type: "Other",
    unit: "106",
    status: "Pending",
    date: "2024-11-10",
  },
  {
    ticketId: "7",
    projectId: "4",
    unitId: "107",
    name: "TICKET-007",
    description: "Conduct pest control",
    type: "Alert",
    unit: "107",
    status: "Open",
    date: "2024-11-09",
  },
];

const TicketPage = () => {
  const { selectedProjectId } = useProjectContext();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <p>Loading...</p>;
  }

  // Filter tickets based on selectedProjectId
  const filteredTickets =
    selectedProjectId == ""
      ? tickets
      : tickets.filter((ticket) => ticket.projectId == selectedProjectId);

  // Calculate widget counts
  const totalTickets = filteredTickets.length;
  const pendingTickets = filteredTickets.filter(
    (ticket) => ticket.status === "Pending"
  ).length;
  const openTickets = filteredTickets.filter(
    (ticket) => ticket.status === "Open"
  ).length;
  const closedTickets = filteredTickets.filter(
    (ticket) => ticket.status === "Closed"
  ).length;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        {/* Widget Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-6">
          <TicketWidget
            count={totalTickets}
            label="Total Tickets"
            backgroundColor="bg-[#56798d]"
          />
          <TicketWidget
            count={pendingTickets}
            label="Pending Tickets"
            backgroundColor="bg-[#A6634F]"
          />
          <TicketWidget
            count={openTickets}
            label="Open Tickets"
            backgroundColor="bg-[#729987]"
          />
          <TicketWidget
            count={closedTickets}
            label="Closed Tickets"
            backgroundColor="bg-[#CCCCCC]"
          />
        </div>
      </div>
      <TicketList tickets={filteredTickets} />
    </div>
  );
};

export default TicketPage;

"use client";

import { useProjectContext } from "@/context/ProjectProvider";
import { useEffect, useState } from "react";
import TicketList from "@/app/components/TicketComponents/TicketList";
import Link from "next/link";

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

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        {/* Widget and Search Bar */}
      </div>
      <Link href="../dashboard/individual-tickets">
        <button className="bg-[#4b7d8d] pl-2 text-white h-8 rounded-[20px] flex items-center justify-center hover:bg-[#266472] transition duration-300">
          Click here to go to individual ticket page
        </button>
      </Link>
      <TicketList tickets={filteredTickets} />
    </div>
  );
};

export default TicketPage;

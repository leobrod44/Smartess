"use client";

import { useProjectContext } from "@/context/ProjectProvider";
import { useEffect, useMemo, useState } from "react";
import TicketList from "@/app/components/TicketComponents/TicketList";
import TicketWidget from "@/app/components/TicketComponents/TicketWidget";
import FilterComponent from "@/app/components/FilterList";
import Searchbar from "@/app/components/Searchbar";

interface Ticket {
  ticketId: string;
  projectId: string;
  unitId: string;
  name: string;
  description: string;
  type: "Alert" | "Repair" | "Other";
  unit: string;
  status: "Open" | "Pending" | "Closed";
  date: string;
}

const tickets: Ticket[] = [
  {
    ticketId: "t1",
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
    ticketId: "t2",
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
    ticketId: "t3",
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
    ticketId: "t4",
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
    ticketId: "t5",
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
    ticketId: "t6",
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
    ticketId: "t7",
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
  const [query, setQuery] = useState("");
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);

  const filterOptionsTicket = [
    "Ticket A-Z",
    "Status",
    "Most Recent",
    "Least Recent",
    "Most Important",
    "Least Important",
  ];

  useEffect(() => {
    const projectTickets = selectedProjectId
      ? tickets.filter((ticket) => ticket.projectId == selectedProjectId)
      : tickets;

    setFilteredTickets(
      projectTickets.filter((ticket) =>
        [
          ticket.ticketId,
          ticket.name,
          ticket.unitId,
          ticket.description,
          ticket.type,
          ticket.unit,
          ticket.status,
          ticket.date,
        ].some((field) => field.toLowerCase().includes(query.toLowerCase()))
      )
    );
  }, [selectedProjectId, query]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  const ticketCounts = useMemo(() => {
    const total = filteredTickets.length;
    const pending = filteredTickets.filter(
      (ticket) => ticket.status === "Pending"
    ).length;
    const open = filteredTickets.filter(
      (ticket) => ticket.status === "Open"
    ).length;
    const closed = filteredTickets.filter(
      (ticket) => ticket.status === "Closed"
    ).length;
    return { total, pending, open, closed };
  }, [filteredTickets]);

  const handleFilterChange = (filterValue: string) => {
    const newFilteredTickets = [...filteredTickets];

    switch (filterValue) {
      case "Ticket A-Z":
        newFilteredTickets.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Status":
        newFilteredTickets.sort((a, b) => {
          const statusOrder = { Open: 1, Pending: 2, Closed: 3 };
          return statusOrder[a.status] - statusOrder[b.status];
        });
        break;
      case "Most Recent":
        newFilteredTickets.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        break;
      case "Least Recent":
        newFilteredTickets.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        break;
      case "Most Important":
        newFilteredTickets.sort((a, b) => {
          const importanceOrder = { Alert: 1, Repair: 2, Other: 3 };
          return importanceOrder[a.type] - importanceOrder[b.type];
        });
        break;
      case "Least Important":
        newFilteredTickets.sort((a, b) => {
          const importanceOrder = { Alert: 1, Repair: 2, Other: 3 };
          return importanceOrder[b.type] - importanceOrder[a.type];
        });
        break;
      default:
        break;
    }
    setFilteredTickets(newFilteredTickets);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-6 border-2 border-black rounded-lg p-4">
          <TicketWidget
            count={ticketCounts.total}
            label="Total Tickets"
            backgroundColor="bg-[#56798d]"
          />
          <TicketWidget
            count={ticketCounts.pending}
            label="Pending Tickets"
            backgroundColor="bg-[#A6634F]"
          />
          <TicketWidget
            count={ticketCounts.open}
            label="Open Tickets"
            backgroundColor="bg-[#729987]"
          />
          <TicketWidget
            count={ticketCounts.closed}
            label="Closed Tickets"
            backgroundColor="bg-[#CCCCCC]"
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="pt-4 w-[306px] h-[66px] text-[#325a67] text-[30px] leading-10 tracking-tight">
          Your Tickets
        </div>
        <div className="flex items-center space-x-4">
          <FilterComponent
            onFilterChange={handleFilterChange}
            filterOptions={filterOptionsTicket}
          />
          <Searchbar onSearch={handleSearch} />
        </div>
      </div>
      <TicketList tickets={filteredTickets} />
    </div>
  );
};

export default TicketPage;

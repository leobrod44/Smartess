"use client";

import { useProjectContext } from "@/context/ProjectProvider";
import { useEffect, useMemo, useState } from "react";
import TicketList from "@/app/components/TicketComponents/TicketList";
import TicketWidget from "@/app/components/TicketComponents/TicketWidget";
import FilterComponent from "@/app/components/FilterList";
import Searchbar from "@/app/components/Searchbar";
import { useUserContext } from "@/context/UserProvider";

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

interface AssignedTicket {
  ticketId: string;
  isResolved: boolean;
}

const tickets: Ticket[] = [
  {
    ticketId: "t1",
    projectId: "1",
    unitId: "101",
    name: "TICKET-001",
    description:
      "Fix broken window dsfsfsfsfsfsfsfsfsfsfsfsfsffsanananananananandsdsdsdsdsdsananan",
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
  {
    ticketId: "t8",
    projectId: "3",
    unitId: "108",
    name: "TICKET-008",
    description: "Replace broken AC unit",
    type: "Repair",
    unit: "108",
    status: "Open",
    date: "2024-11-08",
  },
  {
    ticketId: "t9",
    projectId: "1",
    unitId: "109",
    name: "TICKET-009",
    description: "Fix damaged carpet in hallway",
    type: "Repair",
    unit: "109",
    status: "Pending",
    date: "2024-11-07",
  },
  {
    ticketId: "t10",
    projectId: "3",
    unitId: "110",
    name: "TICKET-010",
    description: "Inspect fire alarm system",
    type: "Alert",
    unit: "110",
    status: "Open",
    date: "2024-11-06",
  },
  {
    ticketId: "t11",
    projectId: "2",
    unitId: "111",
    name: "TICKET-011",
    description: "Repair broken staircase railing",
    type: "Repair",
    unit: "111",
    status: "Pending",
    date: "2024-11-05",
  },
  {
    ticketId: "t12",
    projectId: "3",
    unitId: "112",
    name: "TICKET-012",
    description: "Fix garage door malfunction",
    type: "Repair",
    unit: "112",
    status: "Closed",
    date: "2024-11-04",
  },
  {
    ticketId: "t13",
    projectId: "4",
    unitId: "113",
    name: "TICKET-013",
    description: "Install energy-efficient lighting",
    type: "Repair",
    unit: "113",
    status: "Open",
    date: "2024-11-03",
  },
  {
    ticketId: "t14",
    projectId: "5",
    unitId: "114",
    name: "TICKET-014",
    description: "Conduct annual HVAC maintenance",
    type: "Other",
    unit: "114",
    status: "Open",
    date: "2024-11-02",
  },
  {
    ticketId: "t15",
    projectId: "1",
    unitId: "115",
    name: "TICKET-015",
    description: "Repair damaged roof shingles",
    type: "Repair",
    unit: "115",
    status: "Pending",
    date: "2024-11-01",
  },
  {
    ticketId: "t16",
    projectId: "2",
    unitId: "116",
    name: "TICKET-016",
    description: "Upgrade lobby with new seating",
    type: "Other",
    unit: "116",
    status: "Pending",
    date: "2024-10-31",
  },
  {
    ticketId: "t17",
    projectId: "3",
    unitId: "117",
    name: "TICKET-017",
    description: "Paint exterior walls",
    type: "Repair",
    unit: "117",
    status: "Pending",
    date: "2024-10-30",
  },
  {
    ticketId: "t18",
    projectId: "5",
    unitId: "118",
    name: "TICKET-018",
    description: "Fix damaged mailbox",
    type: "Repair",
    unit: "118",
    status: "Open",
    date: "2024-10-29",
  },
  {
    ticketId: "t19",
    projectId: "4",
    unitId: "119",
    name: "TICKET-019",
    description: "Clean gutters",
    type: "Other",
    unit: "119",
    status: "Closed",
    date: "2024-10-28",
  },
  {
    ticketId: "t20",
    projectId: "1",
    unitId: "120",
    name: "TICKET-020",
    description: "Replace broken light bulbs in hallway",
    type: "Repair",
    unit: "120",
    status: "Open",
    date: "2024-10-27",
  },
  {
    ticketId: "t21",
    projectId: "2",
    unitId: "121",
    name: "TICKET-021",
    description: "Install new fencing around pool",
    type: "Other",
    unit: "121",
    status: "Pending",
    date: "2024-10-26",
  },
  {
    ticketId: "t22",
    projectId: "3",
    unitId: "122",
    name: "TICKET-022",
    description: "Repair cracked driveway",
    type: "Repair",
    unit: "122",
    status: "Closed",
    date: "2024-10-25",
  },
  {
    ticketId: "t23",
    projectId: "4",
    unitId: "123",
    name: "TICKET-023",
    description: "Remove graffiti from exterior walls",
    type: "Other",
    unit: "123",
    status: "Open",
    date: "2024-10-24",
  },
  {
    ticketId: "t24",
    projectId: "5",
    unitId: "124",
    name: "TICKET-024",
    description: "Conduct electrical system inspection",
    type: "Other",
    unit: "124",
    status: "Open",
    date: "2024-10-23",
  },
  {
    ticketId: "t25",
    projectId: "1",
    unitId: "125",
    name: "TICKET-025",
    description: "Replace carpet in common areas",
    type: "Repair",
    unit: "125",
    status: "Pending",
    date: "2024-10-22",
  },
];

const AssignedTicket: AssignedTicket[] = [
  { ticketId: "t1", isResolved: false },
  { ticketId: "t5", isResolved: false },
  { ticketId: "t10", isResolved: false },
  { ticketId: "t15", isResolved: false },
  { ticketId: "t20", isResolved: false },
];

const AssignedTicketPage = () => {
  const { userEmail, userFirstName, userLastName, userType } = useUserContext();
  const { selectedProjectId } = useProjectContext();
  const [query, setQuery] = useState("");
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);

  console.log(userEmail);
  console.log(userFirstName);
  console.log(userLastName);
  console.log(userType);

  const filterOptionsTicket = [
    "Ticket A-Z",
    "Status",
    "Most Recent",
    "Least Recent",
    "Most Important",
    "Least Important",
  ];

  useEffect(() => {
    const assignedTickets = tickets.filter((ticket) =>
      AssignedTicket.some((assigned) => assigned.ticketId === ticket.ticketId)
    );

    const projectTickets = selectedProjectId
      ? assignedTickets.filter(
          (ticket) => ticket.projectId == selectedProjectId
        )
      : assignedTickets;

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

export default AssignedTicketPage;

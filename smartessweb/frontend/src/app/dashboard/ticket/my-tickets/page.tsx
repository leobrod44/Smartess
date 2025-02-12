"use client";

import { useProjectContext } from "@/context/ProjectProvider";
import { useEffect, useMemo, useState } from "react";
import AssignedTicketList from "@/app/components/TicketComponents/AssignedTicketList";
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
  isResolved: boolean;
}

const tickets: Ticket[] = [
  {
    ticketId: "t1",
    projectId: "1",
    unitId: "101",
    name: "TICKET-001",
    description: "Fix broken window",
    type: "Repair",
    unit: "101",
    status: "Open",
    date: "2024-11-15",
    isResolved: false,
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
    isResolved: true,
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
    isResolved: true,
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
    isResolved: false,
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
    isResolved: false,
  },
];

type WidgetFilter = "all" | "resolved" | "unresolved";

const AssignedTicketPage = () => {
  const { selectedProjectId } = useProjectContext();
  const [query, setQuery] = useState("");
  const [widgetFilter, setWidgetFilter] = useState<WidgetFilter>("all");

  const filterOptionsTicket = [
    "Ticket A-Z",
    "Status",
    "Most Recent",
    "Least Recent",
    "Most Important",
    "Least Important",
  ];

  const projectTickets = useMemo(() => {
    if (!selectedProjectId) return tickets;
    return tickets.filter(
      (ticket) => ticket.projectId === String(selectedProjectId)
    );
  }, [selectedProjectId]);

  const widgetStats = useMemo(() => {
    const total = projectTickets.length;
    const resolved = projectTickets.filter(
      (ticket) => ticket.isResolved
    ).length;
    const unresolved = total - resolved;
    return { total, resolved, unresolved };
  }, [projectTickets]);

  const [displayedTickets, setDisplayedTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    let tempTickets = [...projectTickets];

    if (widgetFilter === "resolved") {
      tempTickets = tempTickets.filter((ticket) => ticket.isResolved);
    } else if (widgetFilter === "unresolved") {
      tempTickets = tempTickets.filter((ticket) => !ticket.isResolved);
    }

    if (query.trim()) {
      tempTickets = tempTickets.filter((ticket) =>
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
      );
    }

    setDisplayedTickets(tempTickets);
  }, [projectTickets, widgetFilter, query]);

  const handleFilterChange = (filterValue: string) => {
    const newDisplayedTickets = [...displayedTickets];

    switch (filterValue) {
      case "Ticket A-Z":
        newDisplayedTickets.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Status":
        newDisplayedTickets.sort((a, b) => {
          const statusOrder: Record<string, number> = { false: 0, true: 1 };
          return (
            statusOrder[String(a.isResolved)] -
            statusOrder[String(b.isResolved)]
          );
        });
        break;
      case "Most Recent":
        newDisplayedTickets.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        break;
      case "Least Recent":
        newDisplayedTickets.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        break;
      case "Most Important":
        newDisplayedTickets.sort((a, b) => {
          const importanceOrder = { Alert: 1, Repair: 2, Other: 3 };
          return importanceOrder[a.type] - importanceOrder[b.type];
        });
        break;
      case "Least Important":
        newDisplayedTickets.sort((a, b) => {
          const importanceOrder = { Alert: 1, Repair: 2, Other: 3 };
          return importanceOrder[b.type] - importanceOrder[a.type];
        });
        break;
      default:
        break;
    }

    setDisplayedTickets(newDisplayedTickets);
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  const handleClickTotal = () => setWidgetFilter("all");
  const handleClickResolved = () => setWidgetFilter("resolved");
  const handleClickUnresolved = () => setWidgetFilter("unresolved");

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-fit border-2 border-black rounded-lg p-4">
          <TicketWidget
            count={widgetStats.total}
            label="Total Tickets"
            backgroundColor="bg-[#56798d]"
            onClick={handleClickTotal}
          />
          <TicketWidget
            count={widgetStats.resolved}
            label="Resolved Tickets"
            backgroundColor="bg-[#729987]"
            onClick={handleClickResolved}
          />
          <TicketWidget
            count={widgetStats.unresolved}
            label="Unresolved Tickets"
            backgroundColor="bg-[#A6634F]"
            onClick={handleClickUnresolved}
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
      <AssignedTicketList tickets={displayedTickets} />
    </div>
  );
};

export default AssignedTicketPage;

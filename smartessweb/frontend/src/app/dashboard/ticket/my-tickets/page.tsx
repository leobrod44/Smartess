"use client";

import { useProjectContext } from "@/context/ProjectProvider";
import { useEffect, useMemo, useState } from "react";
import AssignedTicketList from "@/app/components/TicketComponents/AssignedTicketList";
import TicketWidget from "@/app/components/TicketComponents/TicketWidget";
import FilterComponent from "@/app/components/FilterList";
import Searchbar from "@/app/components/Searchbar";
import { assignedTicketsApi, APITicket } from "@/api/dashboard/ticket/my-tickets/page";

type WidgetFilter = "all" | "resolved" | "unresolved";

const AssignedTicketPage = () => {
  const { selectedProjectId } = useProjectContext();
  const [tickets, setTickets] = useState<APITicket[]>([]);
  const [query, setQuery] = useState("");
  const [widgetFilter, setWidgetFilter] = useState<WidgetFilter>("all");

  useEffect(() => {
    const fetchAssignedTickets = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token not found in localStorage.");
        return;
      }
      try {
        const data = await assignedTicketsApi.getAssignedTickets(token);
        setTickets(data.tickets);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };

    fetchAssignedTickets();
  }, []);

  const projectTickets = useMemo(() => {
    if (!selectedProjectId) return tickets;
    return tickets.filter(
      (ticket) => ticket.projectId === String(selectedProjectId)
    );
  }, [tickets, selectedProjectId]);

  const widgetStats = useMemo(() => {
    const total = projectTickets.length;
    const resolved = projectTickets.filter((ticket) => ticket.isResolved).length;
    const unresolved = total - resolved;
    return { total, resolved, unresolved };
  }, [projectTickets]);

  const [displayedTickets, setDisplayedTickets] = useState<APITicket[]>([]);

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
            statusOrder[String(a.isResolved)] - statusOrder[String(b.isResolved)]
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-fit p-4">
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
            filterOptions={[
              "Ticket A-Z",
              "Status",
              "Most Recent",
              "Least Recent",
              "Most Important",
              "Least Important",
            ]}
          />
          <Searchbar onSearch={handleSearch} />
        </div>
      </div>
      <AssignedTicketList tickets={displayedTickets} />
    </div>
  );
};

export default AssignedTicketPage;

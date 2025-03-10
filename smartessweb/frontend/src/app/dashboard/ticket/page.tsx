"use client";

import { useEffect, useMemo, useState } from "react";
import TicketList from "@/app/components/TicketComponents/TicketList";
import TicketWidget from "@/app/components/TicketComponents/TicketWidget";
import FilterComponent from "@/app/components/FilterList";
import Searchbar from "@/app/components/Searchbar";
import { useUserContext } from "@/context/UserProvider";
import { useProjectContext } from "@/context/ProjectProvider";
import { ticketsListApi, APITicketList } from "@/api/dashboard/ticket/page";
import NoResultsFound from "@/app/components/NoResultsFound";

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

const filterOptionsTicket = [
  "Ticket A-Z",
  "Status",
  "Most Recent",
  "Least Recent",
  "Most Important",
  "Least Important",
];

// Function to transform type string to correct cases
const transformType = (type: string): "Alert" | "Repair" | "Other" => {
  const lowercaseType = type.toLowerCase();
  switch (lowercaseType) {
    case "alert":
      return "Alert";
    case "repair":
      return "Repair";
    default:
      return "Other";
  }
};

// Function to transform status string to correct cases
const transformStatus = (status: string): "Open" | "Pending" | "Closed" => {
  const lowercaseStatus = status.toLowerCase();
  switch (lowercaseStatus) {
    case "open":
      return "Open";
    case "pending":
      return "Pending";
    case "closed":
      return "Closed";
    default:
      return "Open";
  }
};

// Function to transform API ticket to component ticket format
const transformTicket = (apiTicketList: APITicketList): Ticket => ({
  ticketId: apiTicketList.ticket_id,
  projectId: apiTicketList.proj_id,
  unitId: apiTicketList.unit_id,
  name: apiTicketList.name,
  description: apiTicketList.description,
  type: transformType(apiTicketList.type),
  unit: apiTicketList.unit || "N/A",
  status: transformStatus(apiTicketList.status),
  date: apiTicketList.created_at,
});

const TicketPage = () => {
  const { userType } = useUserContext();
  const { selectedProjectId } = useProjectContext();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const [selectedWidgetFilter, setSelectedWidgetFilter] = useState<
    "Open" | "Pending" | "Closed" | null
  >(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }

        const data = await ticketsListApi.getTickets(token);
        const transformedTickets = data.tickets.map(transformTicket);
        setTickets(transformedTickets);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch tickets"
        );
        console.error("Error fetching tickets:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const projectTickets = useMemo(() => {
    return selectedProjectId
      ? tickets.filter((ticket) => ticket.projectId === selectedProjectId)
      : tickets;
  }, [tickets, selectedProjectId]);

  const ticketCounts = useMemo(() => {
    const total = projectTickets.length;
    const pending = projectTickets.filter(
      (ticket) => ticket.status === "Pending"
    ).length;
    const open = projectTickets.filter(
      (ticket) => ticket.status === "Open"
    ).length;
    const closed = projectTickets.filter(
      (ticket) => ticket.status === "Closed"
    ).length;

    return { total, pending, open, closed };
  }, [projectTickets]);

  useEffect(() => {
    let visibleTickets = [...projectTickets];

    if (selectedWidgetFilter !== null) {
      visibleTickets = visibleTickets.filter(
        (ticket) => ticket.status === selectedWidgetFilter
      );
    }

    if (query.trim()) {
      visibleTickets = visibleTickets.filter((ticket) =>
        [
          ticket.ticketId,
          ticket.name,
          ticket.unitId,
          ticket.description,
          ticket.type,
          ticket.unit,
          ticket.status,
          ticket.date,
        ].some((field) =>
          field?.toString().toLowerCase().includes(query.toLowerCase())
        )
      );
    }

    setFilteredTickets(visibleTickets);
  }, [projectTickets, selectedWidgetFilter, query]);

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

  // Handle search input
  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  // Remove a ticket from state after successful delete
  const handleTicketDelete = (ticketId: string) => {
    setTickets((prev) => prev.filter((t) => t.ticketId !== ticketId));
  };

  // Handle clicking on the widgets to filter by status
  const handleWidgetClick = (status: "Open" | "Pending" | "Closed" | null) => {
    setSelectedWidgetFilter(status);
  };

  // Spinner while loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold">Error loading tickets</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-6  p-4">
          <TicketWidget
            count={ticketCounts.total}
            label="Total Tickets"
            backgroundColor="bg-[#56798d]"
            onClick={() => handleWidgetClick(null)}
          />
          <TicketWidget
            count={ticketCounts.pending}
            label="Pending Tickets"
            backgroundColor="bg-[#A6634F]"
            onClick={() => handleWidgetClick("Pending")}
          />
          <TicketWidget
            count={ticketCounts.open}
            label="Open Tickets"
            backgroundColor="bg-[#729987]"
            onClick={() => handleWidgetClick("Open")}
          />
          <TicketWidget
            count={ticketCounts.closed}
            label="Closed Tickets"
            backgroundColor="bg-[#CCCCCC]"
            onClick={() => handleWidgetClick("Closed")}
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
      {tickets.length === 0 ? (
        <p>No data available</p>
      ) : filteredTickets.length === 0 ? (
        <NoResultsFound searchItem={query} />
      ) : (
        <TicketList
          tickets={filteredTickets}
          userType={userType}
          onTicketDelete={handleTicketDelete}
        />
      )}
    </div>
  );
};

export default TicketPage;

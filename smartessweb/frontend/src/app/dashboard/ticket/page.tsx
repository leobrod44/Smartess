"use client";

import { useProjectContext } from "@/context/ProjectProvider";
import { useEffect, useMemo, useState } from "react";
import TicketList from "@/app/components/TicketComponents/TicketList";
import TicketWidget from "@/app/components/TicketComponents/TicketWidget";
import FilterComponent from "@/app/components/FilterList";
import Searchbar from "@/app/components/Searchbar";
import { useUserContext } from "@/context/UserProvider";
import { ticketsListApi, APITicketList} from "@/api/dashboard/ticket/page";

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
    case 'alert':
      return 'Alert';
    case 'repair':
      return 'Repair';
    case 'other':
      return 'Other';
    default:
      return 'Other';
  }
};

// Function to transform status string to correct cases
const transformStatus = (status: string): "Open" | "Pending" | "Closed" => {
  const lowercaseStatus = status.toLowerCase();
  switch (lowercaseStatus) {
    case 'open':
      return 'Open';
    case 'pending':
      return 'Pending';
    case 'closed':
      return 'Closed';
    default:
      return 'Open';
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
  unit: apiTicketList.unit || 'N/A',
  status: transformStatus(apiTicketList.status),
  date: apiTicketList.created_at
});

const TicketPage = () => {
  const { userType } = useUserContext();
  const { selectedProjectId } = useProjectContext();
  const [query, setQuery] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tickets from API
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        const data = await ticketsListApi.getTickets(token);
        const transformedTickets = data.tickets.map(transformTicket);
        setTickets(transformedTickets);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
        console.error('Error fetching tickets:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);
  
  // Filter tickets based on search and selected project
  useEffect(() => {
    const projectTickets = selectedProjectId
      ? tickets.filter((ticket) => ticket.projectId === selectedProjectId)
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
        ].some((field) => 
          field?.toString().toLowerCase().includes(query.toLowerCase())
        )
      )
    );
  }, [selectedProjectId, query, tickets]);

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
      <TicketList
        tickets={filteredTickets}
        userType={userType}
      />
    </div>
  );
};

export default TicketPage;
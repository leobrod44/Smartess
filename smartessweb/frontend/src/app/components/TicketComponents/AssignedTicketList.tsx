import Link from "next/link";
import { useState } from "react";
import { Pagination } from "@mui/material";
import ResolveTicketModal from "./ResolveTicketModal";
import { showToastSuccess } from "@/app/components/Toast";

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
  isResolved: boolean;
}

const AssignedTicketList = ({ tickets }: { tickets: Ticket[] }) => {
  const [page, setPage] = useState(1);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const ticketsPerPage = 20;

  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handleResolveClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setModalOpen(true);
  };

  const handleResolveConfirm = () => {
    if (selectedTicket) {
      if (selectedTicket.isResolved) {
        showToastSuccess(
          `Ticket ${selectedTicket.ticketId} has been marked as unresolved.`
        );
      } else {
        showToastSuccess(
          `Ticket ${selectedTicket.ticketId} has been marked as resolved.`
        );
      }
      setModalOpen(false);
    }
  };

  const startIndex = (page - 1) * ticketsPerPage;
  const ticketsToDisplay = tickets.slice(
    startIndex,
    startIndex + ticketsPerPage
  );

  const formatStatus = (isResolved: boolean) => {
    return isResolved ? "bg-[#729987]" : "bg-[#A6634F]";
  };

  // const formatDate = (dateStr: string) => {
  //   const [year, month, day] = dateStr.split("-").map(Number);
  //   const date = new Date(year, month - 1, day);
  //   return date.toLocaleDateString("en-US", {
  //     year: "numeric",
  //     month: "long",
  //     day: "numeric",
  //   });
  // };

  return (
    <div className="mt-8 flow-root">
      <ResolveTicketModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleResolveConfirm}
        ticketName={selectedTicket?.name || ""}
        isResolved={selectedTicket?.isResolved || false}
      />
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-[#14323B] sm:pl-3 w-1/12"
                >
                  ID
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-[#14323B] w-3/12"
                >
                  Ticket
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-[#14323B] w-1/12"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-[#14323B] w-1/12"
                >
                  Unit
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-[#14323B] w-2/12"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-[#14323B] w-2/12"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-center text-sm font-semibold text-[#14323B] w-1/12"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {ticketsToDisplay.map((ticket) => (
                <tr
                  key={ticket.ticketId}
                  className="even:bg-gray-50"
                >
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-[#14323B] sm:pl-3">
                    {ticket.ticketId}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-[#14323B]">
                    <Link
                      href={`/dashboard/ticket/${ticket.ticketId}`}
                      className="font-semibold text-[#14323B] hover:underline"
                    >
                      {ticket.name}
                    </Link>
                    <div className="text-gray-500 text-xs truncate overflow-hidden md:text-sm max-w-xs md:max-w-sm lg:max-w-md">
                      {ticket.description}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-[#14323B]">
                    {ticket.type}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-[#14323B]">
                    {ticket.unit}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span
                      className={`inline-flex items-center justify-center min-w-[100px] h-[30px] rounded-full text-sm font-medium text-white ${formatStatus(
                        ticket.isResolved
                      )}`}
                    >
                      {ticket.isResolved ? "Resolved" : "Unresolved"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-[#14323B]">
                    {/* {formatDate(ticket.date)} */}
                    {ticket.date}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-center text-sm font-medium sm:pr-3">
                    <button
                      onClick={() => handleResolveClick(ticket)}
                      className={`inline-block w-32 py-2 rounded-md font-semibold text-xs ${
                        ticket.isResolved
                          ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                          : "bg-[#266472] text-white hover:bg-[#254752]"
                      }`}
                    >
                      {ticket.isResolved
                        ? "Mark as Unresolved"
                        : "Mark as Resolved"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-center mt-4">
        <Pagination
          className="custom-pagination"
          count={Math.ceil(tickets.length / ticketsPerPage)}
          page={page}
          onChange={handleChangePage}
          color="primary"
        />
      </div>
    </div>
  );
};

export default AssignedTicketList;

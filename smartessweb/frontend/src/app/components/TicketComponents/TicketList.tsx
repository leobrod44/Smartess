import Link from "next/link";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Pagination } from "@mui/material";
import DeleteTicketModal from "./DeleteTicketModal";
import { showToastSuccess } from "@/app/components/Toast";
import { ticketsListApi } from "@/api/dashboard/ticket/page";

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

const TicketList = ({
  tickets,
  userType,
  onTicketDelete,
}: {
  tickets: Ticket[];
  userType: string;
  onTicketDelete: (ticketId: string) => void;
}) => {
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

  const handleDeleteClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedTicket && userType !== "basic") {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }

        await ticketsListApi.deleteTicket(token, selectedTicket.ticketId);
        onTicketDelete(selectedTicket.ticketId);
        showToastSuccess(`Ticket ${selectedTicket.ticketId} has been deleted.`);
      } catch (err) {
        console.error("Error deleting ticket:", err);
      } finally {
        setModalOpen(false);
      }
    } else {
      setModalOpen(false);
    }
  };

  const startIndex = (page - 1) * ticketsPerPage;
  const ticketsToDisplay = tickets.slice(
    startIndex,
    startIndex + ticketsPerPage
  );

  const formatStatus = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-[#729987]";
      case "Pending":
        return "bg-[#A6634F]";
      case "Closed":
        return "bg-[#CCCCCC]";
    }
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
    <div className=" relative pb-20 mt-8 flow-root">
      <DeleteTicketModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onDelete={handleDeleteConfirm}
        ticketName={selectedTicket?.name || ""}
        userType={userType}
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
                <tr key={ticket.ticketId} className="even:bg-gray-50">
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
                      className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-medium text-white ${formatStatus(
                        ticket.status
                      )}`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-[#14323B]">
                    {/* {formatDate(ticket.date)} */}
                    {ticket.date}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-center text-sm font-medium sm:pr-3">
                    <button
                      className="text-red-600 hover:text-red-900 disabled:cursor-not-allowed"
                      aria-label="Delete ticket"
                      onClick={() => handleDeleteClick(ticket)}
                    >
                      <TrashIcon className="h-5 w-5 mx-auto" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full bg-white pb-0 flex justify-center">
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

export default TicketList;

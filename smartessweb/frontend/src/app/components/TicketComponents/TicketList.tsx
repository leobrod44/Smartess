import Link from "next/link";
import { TrashIcon } from "@heroicons/react/24/outline";

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

const TicketList = ({ tickets }: { tickets: Ticket[] }) => {
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="mt-8 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-[#14323B] sm:pl-3"
                >
                  ID
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-[#14323B]"
                >
                  Ticket
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-[#14323B]"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-[#14323B]"
                >
                  Unit
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-[#14323B]"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-[#14323B]"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-center text-sm font-semibold text-[#14323B]"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {tickets.map((ticket) => (
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
                    <div className="text-gray-500 text-xs truncate overflow-hidden max-w-[150px]">
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
                    {formatDate(ticket.date)}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-center text-sm font-medium sm:pr-3">
                    <button
                      className="text-red-600 hover:text-red-900"
                      aria-label="Delete ticket"
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
    </div>
  );
};

export default TicketList;

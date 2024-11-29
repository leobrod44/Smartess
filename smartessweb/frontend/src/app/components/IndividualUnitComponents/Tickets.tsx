"use client";
import { Ticket } from "../../mockData";
import { useRouter } from "next/navigation";

interface TicketsProps {
  tickets: Ticket[];
}

const Tickets = ({ tickets }: TicketsProps) => {
  const router = useRouter();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColorClasses = (status: "open" | "pending" | "closed") => {
    switch (status) {
      case "open":
        return "bg-[#729987] text-white";
      case "pending":
        return "bg-[#A6634F] text-white";
      case "closed":
        return "bg-[#CCCCCC] text-white";
      default:
        return "bg-gray-300 text-black";
    }
  };

  const handleNavigation = () => {
    router.push("/dashboard/ticket");
  };

  // Sort tickets by most recent
  const sortedTickets = [...tickets].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div>
      {/* Title */}
      <div className="h-5 mb-6 text-center text-[#4b7d8d] text-[25px] font-bold leading-tight tracking-tight">
        Unit Tickets
      </div>

      {/* Table Headers */}
      <div className="hidden md:grid md:grid-cols-5 w-full text-center text-[#14323B] font-semibold text-sm mb-2">
        <div>Id</div>
        <div>Ticket</div>
        <div>Type</div>
        <div>Status</div>
        <div>Date</div>
      </div>
      {/* Separator Line */}
      <div className="w-full h-px bg-[#4b7d8d] mb-4"></div>

      {/* Table Rows */}
      <div className="flex flex-col gap-6 max-h-[300px] overflow-y-auto custom-scrollbar px-2">
        {sortedTickets.map((ticket, index) => (
          <div
            key={index}
            className="md:grid md:grid-cols-5 w-full text-center text-black text-sm gap-2"
          >
            {/* Stacked view for small screens */}
            <div className="md:hidden text-center rounded-lg border p-2">
              <div className="text-[#14323B] font-semibold">Id:</div>
              {ticket.ticket_id}
              <div className="text-[#14323B] font-semibold">Ticket:</div>{" "}
              {ticket.title}
              <div className="text-[#14323B] font-semibold">Type:</div>{" "}
              {ticket.type}
              <div className="text-[#14323B] font-semibold">Status:</div>
              <div className="inline-block">
                <span
                  className={`inline-block px-2 py-1 rounded-[20px] ${getStatusColorClasses(
                    ticket.status
                  )}`}
                >
                  {ticket.status}
                </span>
              </div>
              <div className="text-[#14323B] font-semibold">Date:</div>{" "}
              {formatDate(ticket.created_at)}
            </div>

            {/* Table view for medium and larger screens */}
            <div className="hidden md:block">{ticket.ticket_id}</div>
            <div className="hidden md:block">{ticket.title}</div>
            <div className="hidden md:block">{ticket.type}</div>
            <div
              className={`hidden md:block w-[78px] h-6 rounded-[20px] mx-auto text-center ${getStatusColorClasses(
                ticket.status
              )}`}
            >
              {ticket.status}
            </div>
            <div className="hidden md:block">
              {formatDate(ticket.created_at)}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <button
          onClick={handleNavigation}
          className="w-[150px] h-[30px] mt-6 bg-[#266472] rounded-md hover:bg-[#1f505e] transition duration-300 text-white text-xs font-medium"
        >
          Manage Tickets
        </button>
      </div>
    </div>
  );
};

export default Tickets;

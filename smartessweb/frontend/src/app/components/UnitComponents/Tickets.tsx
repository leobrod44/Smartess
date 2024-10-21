const Tickets = ({
  tickets,
}: {
  tickets: { total: number; pending: number; open: number; closed: number };
}) => (
  <div className="max-w-xs p-4 bg-white flex flex-col justify-start items-center">
    <div className="w-full relative pb-2.5">
      <div className="text-center text-[#4b7d8d] text-l font-bold font-['Sequel Sans'] leading-tight tracking-tight">
        Tickets
      </div>
      <div className="w-full h-px absolute bg-[#4b7d8d]" />
    </div>

    <div className="w-full grid grid-cols-2 gap-2">
      <div className="bg-[#4b7d8d] rounded-[10px] flex justify-center items-center p-1">
        <div className="text-center text-white text-xs font-['Sequel Sans'] leading-tight tracking-tight">
          {tickets.total}
          <br />
          Total
        </div>
      </div>

      <div className="bg-[#729987] rounded-[10px] flex justify-center items-center p-1">
        <div className="text-center text-white text-xs font-['Sequel Sans'] leading-tight tracking-tight">
          {tickets.open}
          <br />
          Open
        </div>
      </div>

      <div className="bg-[#a6634f] rounded-[10px] flex justify-center items-center p-1">
        <div className="text-center text-white text-xs font-['Sequel Sans'] leading-tight tracking-tight">
          {tickets.pending}
          <br />
          Pending
        </div>
      </div>

      <div className="bg-[#cccccc] rounded-[10px] flex justify-center items-center p-1">
        <div className="text-center text-white text-xs font-['Sequel Sans'] leading-tight tracking-tight">
          {tickets.closed}
          <br />
          Closed
        </div>
      </div>
    </div>
  </div>
);

export default Tickets;

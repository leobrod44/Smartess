const Tickets = ({
  tickets,
}: {
  tickets: { total: number; pending: number; open: number; closed: number };
}) => (
  <div className="w-[267px] h-[164px] px-[13px] bg-white flex-col justify-start items-center inline-flex">
    <div className="w-[162px] h-[37px] relative bg-white/0">
      <div className="w-[173px] h-[33px] absolute text-center text-[#4b7d8d] text-xl font-['Sequel Sans'] leading-tight tracking-tight">
        Tickets
      </div>
      <div className="w-36 h-px left-[9px] top-[32px] absolute bg-[#4b7d8d]" />
    </div>

    <div className="w-full h-[127px] grid grid-cols-2 gap-[7px] px-[9px] py-[7px]">
      <div className="h-[50px] px-0.5 bg-[#4b7d8d] rounded-[10px] flex justify-center items-center">
        <div className="text-center text-white text-base font-['Sequel Sans'] leading-tight tracking-tight">
          {tickets.total}
          <br />
          Total
        </div>
      </div>

      <div className="h-[50px] px-0.5 bg-[#729987] rounded-[10px] flex justify-center items-center">
        <div className="text-center text-white text-base font-['Sequel Sans'] leading-tight tracking-tight">
          {tickets.open}
          <br />
          Open
        </div>
      </div>

      <div className="h-[50px] px-0.5 bg-[#a6634f] rounded-[10px] flex justify-center items-center">
        <div className="text-center text-white text-base font-['Sequel Sans'] leading-tight tracking-tight">
          {tickets.pending}
          <br />
          Pending
        </div>
      </div>

      <div className="h-[50px] px-0.5 bg-[#cccccc] rounded-[10px] flex justify-center items-center">
        <div className="text-center text-white text-base font-['Sequel Sans'] leading-tight tracking-tight">
          {tickets.closed}
          <br />
          Closed
        </div>
      </div>
    </div>
  </div>
);

export default Tickets;

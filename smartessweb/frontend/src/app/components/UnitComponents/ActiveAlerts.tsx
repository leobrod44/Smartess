const ActiveAlert = ({
  activeAlerts,
}: {
  activeAlerts: { active: number; closed: number };
}) => (
  <div className="max-w-xs p-4 bg-white flex flex-col justify-start items-center">
    <div className="w-full relative pb-2.5">
      <div className="text-center text-[#4b7d8d] text-l font-sequel-sans-black leading-tight tracking-tight">
        Alerts
      </div>
      <div className="w-[75%] h-px absolute bg-[#4b7d8d] left-1/2 transform -translate-x-1/2" />
    </div>

    <div className="w-1/2 grid   xl:grid-cols-1 lg:grid-cols-1 md:grid-cols-1  sm:grid-cols-1 xs:grid-cols-1 gap-2">
      <div className="bg-[#A65146] rounded-[10px] flex justify-center items-center p-1">
        <div className="text-center text-white text-[10px] font-['Sequel Sans'] leading-tight tracking-tight">
          {activeAlerts.active}
          <br />
          Active
        </div>
      </div>

      <div className="bg-[#729987] rounded-[10px] flex justify-center items-center p-1">
        <div className="text-center text-white text-[10px] font-['Sequel Sans'] leading-tight tracking-tight">
          {activeAlerts.closed}
          <br />
          Closed
        </div>
      </div>
    </div>
  </div>
);

export default ActiveAlert;

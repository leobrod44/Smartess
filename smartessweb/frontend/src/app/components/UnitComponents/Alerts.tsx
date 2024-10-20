
const Alerts = ({ alerts }: { alerts: { message: string }[] }) => {
    // Show only the first 2 alerts
    const firstTwoAlerts = alerts.slice(0, 2);
  
    return (
      <div className="w-[252px] h-[165px] px-[23px] bg-white/0 flex-col justify-start items-center inline-flex">
        <div className="h-[34px] px-[9px] bg-white/0 flex-col justify-center items-center flex">
          <h3 className="self-stretch h-[33px] text-center text-[#4b7d8d] text-xl font-['Sequel Sans'] leading-tight tracking-tight">
            Alerts
          </h3>
          <div className="self-stretch h-px bg-[#4b7d8d]" />
        </div>
  
        <div className="py-[15px] bg-white/0 flex-col justify-center items-center gap-2.5 flex">
          {firstTwoAlerts.map((alert, index) => (
            <div key={index} className="h-[22px] px-3 py-[5px] bg-[#a65146] rounded-[5px] flex justify-center items-center">
              <div className="text-center text-white text-[9px] font-['Sequel Sans'] leading-[17.84px] tracking-tight">
                {alert.message}
              </div>
            </div>
          ))}
        </div>
  
        <button className="w-[82px] h-[22px] px-[1.19px] bg-[#a65146] rounded-md text-white text-xs">
          See All
        </button>
      </div>
    );
  };
  
  export default Alerts;
  
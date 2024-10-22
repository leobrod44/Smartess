const Alerts = ({ alerts }: { alerts: { message: string }[] }) => {
  // Show only the first 2 alerts
  const firstTwoAlerts = alerts.slice(0, 2);

  const capitalizeMessage = (message: string) => {
    return message.toUpperCase();
  };

  return (
    <div className="max-w-xs p-4 flex-col justify-start items-center gap-2.5">
      <div className="w-full relative pb-2.5">
        <h3 className="text-center text-[#4b7d8d] text-l font-bold font-['Sequel Sans'] leading-tight tracking-tight">
          Alerts
        </h3>
        <div className="w-full h-px absolute bg-[#4b7d8d]" />
      </div>

      <div className="flex flex-col justify-center items-center gap-2.5">
        {firstTwoAlerts.length > 0 ? (
          <>
            {firstTwoAlerts.map((alert, index) => (
              <div
                key={index}
                className="w-[150px] h-[22px] bg-[#a65146] rounded-md flex justify-center items-center overflow-hidden"
              >
                <div className="text-center text-white text-[9px] font-['Sequel Sans'] tracking-tight whitespace-nowrap overflow-ellipsis overflow-hidden">
                  {capitalizeMessage(alert.message)}
                </div>
              </div>
            ))}

            {/* Show the button only if there are alerts */}
            <button className="w-[80px] h-[22px] bg-[#a65146] rounded-md text-white text-xs hover:bg-[#8e4135] transition duration-300">
              See All
            </button>
          </>
        ) : (
          <div className="text-center text-black text-xs font-['Sequel Sans'] leading-tight tracking-tight pt-2">
            No alerts found
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;

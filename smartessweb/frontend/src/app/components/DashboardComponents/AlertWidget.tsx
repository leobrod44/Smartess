"use client";
import { useRouter } from "next/navigation";
interface SystemAlerts {
  alertType: string;
  unitAddress: string;
  unitNumber: string;
}

const AlertWidget = ({
  systemAlerts,
}: {
  systemAlerts: SystemAlerts[] | null;
}) => {
  const router = useRouter();
  //show only the first two alerts in the list for cleanliness
  const firstTwoAlerts = systemAlerts?.slice(0, 2);

  return (
    <div className="flex-col bg-[#14323B] w-full rounded-[7px] text-center text-sm m-0.5 hover:scale-105">
      <div className="w-full relative">
        <h3 className="text-center text-[#fff] text-xl font-sequel-sans leading-tight tracking-tight mt-4">
          Alerts
        </h3>
        <div className="w-2/4 h-px absolute left-1/2 transform -translate-x-1/2 bg-[#fff]" />
        <div>
          <p className="p-3 text-xs">
            Alerts will appear here when an emergency is detected by a hub
          </p>
        </div>
      </div>

      <div className="flex justify-center items-center"></div>
      <div className="flex flex-col w-full items-center text-xs">
        {systemAlerts !== null && systemAlerts.length > 0 ? (
          <>
            {firstTwoAlerts?.map((alert, index) => (
              <div
                key={index}
                className="bg-[#A65146] w-2/3 h-1/2 m-1 p-1.5 rounded-[7px]"
              >
                <div className="flex flex-col text-left">
                  <h3 className="font-sequel-sans-black">
                    {alert.alertType.toUpperCase()}
                  </h3>
                  <h3>{alert.unitAddress}</h3>
                  <h3>{alert.unitNumber}</h3>
                </div>
              </div>
            ))}
            <div className="flex justify-center items-center">
              <button
                className="w-[80px] h-[22px] bg-[#A65146] rounded-md text-white text-xs hover:bg-[#8e4135] transition duration-300 m-2"
                onClick={() => router.push("dashboard/alerts")}
              >
                See All
              </button>
            </div>
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
export default AlertWidget;

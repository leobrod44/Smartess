"use client";

import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import WaterDamageIcon from "@mui/icons-material/WaterDamage";
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
import BatteryAlertIcon from "@mui/icons-material/BatteryAlert";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import DoorBackIcon from "@mui/icons-material/DoorBack";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import SensorsIcon from "@mui/icons-material/Sensors";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import WbIncandescentIcon from "@mui/icons-material/WbIncandescent";
import DangerousIcon from "@mui/icons-material/Dangerous";
import { useRouter } from "next/navigation";
import type { Alert } from "../../mockData";

interface AlertProps {
  alerts: Alert[];
}

const Alert = ({ alerts }: AlertProps) => {
  const router = useRouter();
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "Smoke":
        return <LocalFireDepartmentIcon className="text-red-600" fontSize="large" />;
      case "Water":
        return <WaterDamageIcon className="text-blue-600" fontSize="large" />;
      case "Temperature":
        return <DeviceThermostatIcon className="text-orange-500" fontSize="large" />;
      case "BatteryLow":
        return <BatteryAlertIcon className="text-yellow-500" fontSize="large" />;
      case "Motion":
        return <DirectionsRunIcon className="text-gray-700" fontSize="large" />;
      case "DoorOpen":
        return <DoorBackIcon className="text-amber-700" fontSize="large" />;
      case "Sensor":
        return <SensorsIcon className="text-purple-500" fontSize="large" />;
      case "Climate":
        return <AcUnitIcon className="text-teal-500" fontSize="large" />;
      case "Unknown":
        return <HelpOutlineIcon className="text-gray-500" fontSize="large" />;
      case "Light":
        return <WbIncandescentIcon className="text-yellow-400" fontSize="large" />;
      default:
        return <DangerousIcon className="text-gray-400" fontSize="large" />;
    }
  };
  

  // Sort tickets by most recent
  const sortedAlerts = [...alerts].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div>
      {/* Title */}
      <div className="h-5 mb-6 text-center text-[#4b7d8d] text-[25px] font-bold leading-tight tracking-tight">
        Unit Alerts
      </div>

      {/* Table Headers */}
      <div className="hidden md:grid md:grid-cols-4 w-full text-center text-[#14323B] font-semibold text-sm mb-2">
        <div>Message</div>
        <div>Type</div>
        <div>Date</div>
        <div>Time</div>
      </div>
      {/* Separator Line */}
      <div className="w-full h-px bg-[#4b7d8d] mb-4"></div>

      {/* Table Rows */}
      <div className="flex flex-col gap-6 max-h-[300px] overflow-y-auto custom-scrollbar px-2">
        {sortedAlerts.map((alert) => (
          <div
            key={alert.id}
            className="md:grid md:grid-cols-4 w-full text-center text-black text-sm gap-3"
          >
            {/* Stacked view for small screens */}
            <div className="md:hidden text-center rounded-lg border p-2">
              <div className="text-[#14323B] font-semibold">Ticket:</div>
              {alert.message}
              <div className="flex justify-center items-center">
                {getAlertIcon(alert.type)}
              </div>
              <div className="text-[#14323B] font-semibold">Date:</div> 
              {formatDate(alert.timestamp)}
              <div className="text-[#14323B] font-semibold">Time:</div> 
              {formatTime(alert.timestamp)}
            </div>

            {/* Table view for medium and larger screens */}
            <div className="hidden md:block">{alert.message}</div>

            {/* Icon Column */}
            <div className="hidden md:block flex justify-center items-center">
              {getAlertIcon(alert.type)}
            </div>
            
            <div className="hidden md:block">{formatDate(alert.timestamp)}</div>
            <div className="hidden md:block">{formatTime(alert.timestamp)}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <button
          className="w-[150px] h-[30px] mt-6 bg-[#266472] rounded-md hover:bg-[#1f505e] transition duration-300 text-white text-xs font-medium"
          onClick={() => router.push("/dashboard/alerts")}
        >
          Manage Alerts
        </button>
      </div>
    </div>
  );
}

export default Alert;

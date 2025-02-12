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

import type { Alert } from "../../mockData";

interface AlertProps {
  alerts: Alert[];
}

const Alert = ({ alerts }: AlertProps) => {
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
      <div className="hidden md:grid md:grid-cols-5 w-full text-center text-[#14323B] font-semibold text-sm mb-2">
        <div>Id</div>
        <div>Ticket</div>
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
            className="md:grid md:grid-cols-5 w-full text-center text-black text-sm gap-2"
          >
            {/* Stacked view for small screens */}
            <div className="md:hidden text-center rounded-lg border p-2">
              <div className="text-[#14323B] font-semibold">Id:</div>
              {alert.id}
              <div className="text-[#14323B] font-semibold">Ticket:</div>{" "}
              {alert.message}
              <div className="hidden md:block flex justify-center items-center">
                {alert.type === "Light" && <WbIncandescentIcon />}
                {alert.type === "Sensor" && <SensorsIcon />}
                {alert.type === "Climate" && <AcUnitIcon />}
                {alert.type === "BatteryLow" && <BatteryAlertIcon />}
                {alert.type === "Motion" && <DirectionsRunIcon />}
                {alert.type === "DoorOpen" && <DoorBackIcon />}
                {alert.type === "Smoke" && <LocalFireDepartmentIcon />}
                {alert.type === "Water" && <WaterDamageIcon />}
                {alert.type === "Temperature" && <DeviceThermostatIcon />}
                {alert.type === "Unknown" && <HelpOutlineIcon />}
              </div>
              <div className="text-[#14323B] font-semibold">Date:</div>{" "}
              {formatDate(alert.timestamp)}
              <div className="text-[#14323B] font-semibold">Time:</div>{" "}
              {formatTime(alert.timestamp)}
            </div>

            {/* Table view for medium and larger screens */}
            <div className="hidden md:block">{alert.id}</div>
            <div className="hidden md:block">{alert.message}</div>

            {/* Image not loading here */}
            <div className="hidden md:block flex justify-center items-center">
              {alert.type === "Light" && <WbIncandescentIcon />}
              {alert.type === "Sensor" && <SensorsIcon />}
              {alert.type === "Climate" && <AcUnitIcon />}
              {alert.type === "BatteryLow" && <BatteryAlertIcon />}
              {alert.type === "Motion" && <DirectionsRunIcon />}
              {alert.type === "DoorOpen" && <DoorBackIcon />}
              {alert.type === "Smoke" && <LocalFireDepartmentIcon />}
              {alert.type === "Water" && <WaterDamageIcon />}
              {alert.type === "Temperature" && <DeviceThermostatIcon />}
              {alert.type === "Unknown" && <HelpOutlineIcon />}
            </div>
            <div className="hidden md:block">{formatDate(alert.timestamp)}</div>
            <div className="hidden md:block">{formatTime(alert.timestamp)}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <button className="w-[150px] h-[30px] mt-6 bg-[#266472] rounded-md hover:bg-[#1f505e] transition duration-300 text-white text-xs font-medium">
          Manage Alerts
        </button>
      </div>
    </div>
  );
};

export default Alert;

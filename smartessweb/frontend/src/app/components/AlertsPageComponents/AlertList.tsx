"use client";

import React from "react";
import { Alert } from "../../mockData"; // Adjust path as needed
import { format } from "date-fns";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import WaterDamageIcon from "@mui/icons-material/WaterDamage";
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
import BatteryAlertIcon from "@mui/icons-material/BatteryAlert";
import DangerousIcon from "@mui/icons-material/Dangerous";
import WindowIcon from "@mui/icons-material/Window";
import DoorBackIcon from "@mui/icons-material/DoorBack";
import { TrashIcon } from "@heroicons/react/24/outline";

export interface AlertListProps {
  alerts: Alert[];
}

// Map alert messages to corresponding icons
const getAlertIcon = (message: string) => {
  switch (message) {
    case "Smoke Alarm Activated":
      return (
        <LocalFireDepartmentIcon className="text-red-500" fontSize="large" />
      );
    case "Water Leak Detected":
      return <WaterDamageIcon className="text-blue-500" fontSize="large" />;
    case "Thermostat > 25°C":
      return (
        <DeviceThermostatIcon className="text-orange-500" fontSize="large" />
      );
    case "No Battery In Device":
      return <BatteryAlertIcon className="text-gray-500" fontSize="large" />;
    case "Carbon Monoxide Detected":
      return <DangerousIcon className="text-red-600" fontSize="large" />;
    case "Window Opened":
      return <WindowIcon className="text-green-500" fontSize="large" />;
    case "Door Unlocked":
      return <DoorBackIcon className="text-orange-500" fontSize="large" />;
    default:
      return <DangerousIcon className="text-gray-400" fontSize="large" />;
  }
};
const AlertList = ({ alerts }: AlertListProps) => {
  return (
    <div className="space-y-4">
      {alerts.map((alert, index) => (
        <div
          key={alert.id}
          className={`grid grid-cols-6 items-center p-4 transition-all duration-200 ${
            index % 2 === 0 ? "bg-white" : "bg-gray-100"
          }`}
        >
          {/* Id */}
          <div className=" pl-2 text-[#30525E]">{alert.id}</div>

          {/* Alert message */}
          <div className=" pr-6 text-[#30525E]">{alert.message}</div>

          {/* Type */}
          <div className=" pl-2">{getAlertIcon(alert.message)}</div>

          {/* Date */}
          <div className="text-[#30525E]">
            {format(new Date(alert.timestamp), "yyyy-MM-dd")}
          </div>

          {/* Time */}
          <div className=" text-[#30525E]">
            {format(new Date(alert.timestamp), "HH:mm:ss")}
          </div>

          {/* Action (Button or Placeholder for further functionality) */}
          <div className="pl-10">
            <button>
              <TrashIcon className="h-5 w-5 mx-auto text-red-500 hover:text-red-900  " />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertList;

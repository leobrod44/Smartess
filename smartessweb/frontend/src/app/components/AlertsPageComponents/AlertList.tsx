"use client";

import React from "react";
import { Alert, Project } from "../../mockData"; // Adjust path as needed
import { format } from "date-fns";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import WaterDamageIcon from "@mui/icons-material/WaterDamage";
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
import BatteryAlertIcon from "@mui/icons-material/BatteryAlert";
import DangerousIcon from "@mui/icons-material/Dangerous";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import DoorBackIcon from "@mui/icons-material/DoorBack";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import SensorsIcon from "@mui/icons-material/Sensors";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import WbIncandescentIcon from "@mui/icons-material/WbIncandescent";

export interface AlertListProps {
  alerts: Alert[];
  projects: Project[];
}

const getProjectAddress = (projectId: string, projects: Project[]): string => {
  const project = projects.find((p) => p.projectId === projectId);
  return project ? project.address : "Unknown Address"; // Fallback if project not found
};

// Map alert messages to corresponding icons
const getAlertIcon = (type: string) => {
  switch (type) {
    case "Smoke":
      return (
        <LocalFireDepartmentIcon className="text-red-500" fontSize="large" />
      );
    case "Water":
      return <WaterDamageIcon className="text-blue-500" fontSize="large" />;
    case "Temperature":
      return <DeviceThermostatIcon className="text-red-500" fontSize="large" />;

    case "BatteryLow":
      return <BatteryAlertIcon className="text-green-500" fontSize="large" />;
    case "Motion":
      return <DirectionsRunIcon className="text-gray-600" fontSize="large" />;
    case "DoorOpen":
      return <DoorBackIcon className="text-brown-500" fontSize="large" />;
    case "Sensor":
      return <SensorsIcon className="text-orange-500" fontSize="large" />;
    case "Climate":
      return <AcUnitIcon className="text-blue-500" fontSize="large" />;
    case "Unknown":
      return <HelpOutlineIcon className="text-gray-500" fontSize="large" />;
    case "Light":
      return (
        <WbIncandescentIcon className="text-yellow-500" fontSize="large" />
      );
    default:
      return <DangerousIcon className="text-gray-400" fontSize="large" />;
  }
};
const AlertList = ({ alerts, projects }: AlertListProps) => {
  return (
    <div className="space-y-4">
      {alerts.map((alert, index) => (
        <div
            key={`${alert.id}-${alert.unitNumber}-${index}`}
            className={`grid grid-cols-6 gap-x-20 items-center p-2 transition-all duration-200 ${
              index % 2 === 0 ? "bg-white" : "bg-gray-100"
            }`}
          >
            <div className="pl-2 text-[#30525E]">
              {getProjectAddress(alert.projectId, projects)}
            </div>
            <div className="pl-2 text-[#30525E]">{alert.unitNumber}</div>
            <div className="pr-6 text-[#30525E]">{alert.message}</div>
            <div className="pl-2">{getAlertIcon(alert.type)}</div>
            <div className="text-[#30525E]">
              {format(new Date(alert.timestamp), "yyyy-MM-dd")}
            </div>
            <div className="text-[#30525E]">
              {format(new Date(alert.timestamp), "HH:mm:ss")}
            </div>
          </div>
          ))}
        </div>
  );
};

export default AlertList;

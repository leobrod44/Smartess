import React from "react";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";

interface NotificationProps {
  notification: {
    id: string;
    title: string;
    date: string;
    viewed: boolean;
    ticket_description: string;
  };
  onClick: () => void;
}

const formatDate = (datetime: string): string => {
  const date = new Date(datetime);
  return date.toLocaleString("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const NotificationElement: React.FC<NotificationProps> = ({
  notification,
  onClick,
}) => {
  return (
    <div
      className={`flex flex-col justify-between p-3 border-b border-gray-400 w-full cursor-pointer transition duration-200 ${
        notification.viewed
          ? "bg-white"
          : "bg-[#56798d]/10 hover:bg-[#56798d]/20"
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <div className="font-semibold text-[#254752] text-xs">
          {notification.title}
        </div>
      </div>
      <div className="text-xs text-[#325A67] mt-2">
        {notification.ticket_description}
      </div>
      <div className="flex items-center mt-2">
        {!notification.viewed && (
          <ExclamationCircleIcon className="text-[#325A67] mr-2 w-4 h-4" />
        )}
        <div className="text-xs text-gray-700">
          {formatDate(notification.date)}
        </div>
      </div>
    </div>
  );
};

export default NotificationElement;

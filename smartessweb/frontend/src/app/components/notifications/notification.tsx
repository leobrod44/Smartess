import { BellIcon } from "@heroicons/react/20/solid";
import React, { useState, useRef, useEffect } from "react";
import NotificationElement from "./notificationElement";
import { Transition } from "@headlessui/react";

const Notification: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [unviewedCount, setUnviewedCount] = useState<number>(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const fetchedNotifications = [
          {
            id: "1",
            title: "You have been assigned to a new ticket",
            date: "2025-02-12 10:30 AM",
            viewed: false,
            ticketTitle: "Noisy neighbors",
          },
          {
            id: "2",
            title: "You have marked this ticket as resolved",
            date: "2025-02-11 2:15 PM",
            viewed: false,
            ticketTitle: "Air conditioning broken",
          },
          {
            id: "3",
            title: "You have been assigned to a new ticket",
            date: "2025-02-10 9:00 AM",
            viewed: true,
            ticketTitle: "Broken Window",
          },
          {
            id: "4",
            title: "This ticket has been closed",
            date: "2025-02-09 5:45 PM",
            viewed: true,
            ticketTitle: "Exterminator needed",
          },
          {
            id: "5",
            title: "New feature available in your dashboard",
            date: "2025-02-08 8:00 PM",
            viewed: false,
            ticketTitle: "Leaky Sink, Plumber needed",
          },
        ];
        setNotifications(fetchedNotifications);
        const unviewedNotifications = fetchedNotifications.filter(
          (n: any) => !n.viewed
        );
        setUnviewedCount(unviewedNotifications.length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [open]);

  const toggleMenu = () => setOpen(!open);

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    try {
        //viewing/clicking a notif should set it to viewed, decrementing the unviewed count which changes the little red bubble at the top

        // clicking the notification routes you to the individual ticket page for that notif ,
      
    } catch (error) {
      console.error("Error setting notification viewed:", error);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <div className="relative cursor-pointer" onClick={toggleMenu}>
        {unviewedCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {unviewedCount}
          </div>
        )}
        <BellIcon className=" w-8  h-8  text-3xl text-[#56798d] hover:text-[#14323B] transition duration-300" />
      </div>


      <Transition
        show={open} 
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
      
        <div className="absolute right-0 mt-2.5 w-[200px] origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 z-50">
          <h2 className="text-center text-md text-gray-700 mb-2">Notifications</h2>
          {notifications.length > 0 ? (
            <div className="max-h-64 overflow-y-auto">
              {notifications
                .slice(0, showAll ? notifications.length : 3)
                .map((notification, index) => (
                  <NotificationElement
                    key={index}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                  />
                ))}
            </div>
          ) : (
            <p className="text-center text-[#325A67]">No new notifications.</p>
          )}
          {notifications.length > 3 && (
            <div className="flex justify-center mt-3">
              <button
                className="bg-[#325A67] text-white px-2 py-1 rounded-md text-xs hover:bg-[#254752] transition duration-300"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Hide" : "See All"}
              </button>
            </div>
          )}
        </div>
      </Transition>
    </div>
  );
};

export default Notification;
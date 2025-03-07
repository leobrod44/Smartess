import { BellIcon } from "@heroicons/react/20/solid";
import React, { useState, useRef, useEffect } from "react";
import NotificationElement from "./notificationElement";
import { Transition } from "@headlessui/react";
import {
  TicketNotification,
  ticketNotificationsApi,
} from "@/api/components/TicketNotifications";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  title: string;
  date: string;
  viewed: boolean;
  ticket_id: string;
  ticket_description: string;
}

interface NotificationProps {
  token: string;
}

const Notification: React.FC<NotificationProps> = ({ token }) => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [unviewedCount, setUnviewedCount] = useState<number>(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await ticketNotificationsApi.getNotifications(token);

        const transformedNotifications: Notification[] = data.map(
          (notif: TicketNotification) => {
            let title = "";

            switch (notif.notification_type) {
              case "assignment":
                title = `You have been assigned to a new ticket by user ID#${notif.assigned_by_user_id}`;
                break;
              case "unnassignment":
                title = `You have been unassigned from a ticket by user ID#${notif.assigned_by_user_id}`;
                break;
              case "resolved":
                title = `Ticket ID#${notif.ticket_id} has been marked as resolved by user ID#${notif.assigned_to_user_id}`;
                break;
              case "unresolved":
                title = `Ticket ID#${notif.ticket_id} has been marked as unresolved by user ID#${notif.assigned_to_user_id}`;
                break;
              default:
                title = notif.notification_type;
            }

            return {
              id: notif.notification_id,
              title,
              date: notif.created_at,
              viewed: notif.is_seen,
              ticket_id: notif.ticket_id,
              ticket_description: `Ticket ID#${notif.ticket_id}: ${notif.ticket_description}`,
            };
          }
        );

        transformedNotifications.sort((a, b) => {
          if (a.viewed === b.viewed) {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          }
          return a.viewed ? 1 : -1;
        });

        setNotifications(transformedNotifications);

        const unviewedNotifications = transformedNotifications.filter(
          (n: Notification) => !n.viewed
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
  }, [open, token]);

  const toggleMenu = () => setOpen(!open);

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      await ticketNotificationsApi.updateTicketNotification(
        token,
        notification.ticket_id
      );
      router.push(`/dashboard/ticket/${notification.ticket_id}`);
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  return (
    <div
      className="relative"
      ref={menuRef}
    >
      <div
        className="relative cursor-pointer"
        onClick={toggleMenu}
      >
        {unviewedCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {unviewedCount}
          </div>
        )}
        <BellIcon className="w-8 h-8 text-3xl text-[#56798d] hover:text-[#14323B] transition duration-300" />
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
          <h2 className="text-center text-md text-gray-700 mb-2">
            Notifications
          </h2>
          {notifications.length > 0 ? (
            <div className="max-h-64 overflow-y-auto">
              {notifications
                .slice(0, showAll ? notifications.length : 3)
                .map((notification) => (
                  <NotificationElement
                    key={notification.id}
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

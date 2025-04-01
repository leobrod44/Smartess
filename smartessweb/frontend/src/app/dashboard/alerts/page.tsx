"use client";

import AlertList from "../../components/AlertsPageComponents/AlertList";
import {Alert, Project} from "../../mockData";
import Pagination from "@mui/material/Pagination";
import {useEffect, useMemo, useState} from "react";
import Searchbar from "../../components/Searchbar";
import FilterComponent from "@/app/components/FilterList";
import NoResultsFound from "@/app/components/NoResultsFound";
import {useProjectContext} from "@/context/ProjectProvider";
import {alertsApi} from "@/api/dashboard/alerts/page";
import {useRouter} from "next/navigation";
import {Client} from "@stomp/stompjs";

const AlertPage = () => {
  const { selectedProjectId } = useProjectContext();
  const itemsPerPage = 6;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);

  // Update this useMemo to depend on projects state instead of mockProjects
  const allAlerts = useMemo(() => {
    const uniqueAlerts = new Map();

    projects.forEach((project) => {
      project.units.forEach((unit) => {
        unit.alerts.forEach((alert) => {
          if (!uniqueAlerts.has(alert.id)) {
            uniqueAlerts.set(alert.id, alert);
          }
        });
      });
    });
    return Array.from(uniqueAlerts.values());
  }, [projects]);

  //onnce backend is being added, please add the loading state in the try/catch/finally when you are getting the data from db..
  //all alerts frorm db should be saved to all alerts
  const [filteredAlerts, setFilteredAlerts] = useState([...allAlerts]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const filterOptionsAlerts = [
    "Most Recent",
    "Least Recent",
    "Project A-Z",
    "Project Z-A",
    "Clear All Filters",
  ];

  useEffect(() => {
    setFilteredAlerts([...allAlerts]);
  }, [allAlerts]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/sign-in");
      return;
    }

    const fetchProjectsForAlerts = async () => {
      try {
        setIsLoading(true);
        const response = await alertsApi.getProjectsForAlerts(token);

        if (response && response.projects) {
          setProjects(response.projects);
        }

      } catch (err) {
        console.error("Error fetching organization alerts::", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectsForAlerts();
  }, [router]);

  const processNewAlert = (messageBody: string) => {
    try {
      const incomingAlert = JSON.parse(messageBody);

      // Create a deep copy of projects and update it
      setProjects(prevProjects => {
        const updatedProjects = [...prevProjects];

        // Find matching unit by hubIp
        for (const project of updatedProjects) {
          const unitIndex = project.units.findIndex(unit => unit.hubIp === incomingAlert.hub_ip);
          if (unitIndex == -1) {
            console.log('No matching hub found for:', incomingAlert.hub_ip);
            continue;
          }
          if (unitIndex == -1) {
            return updatedProjects;
          }

          const unit = project.units[unitIndex]

          const newAlert : Alert = {
            id: Math.floor(10000 + Math.random() * 90000).toString(),
            projectId: project.projectId,
            unitNumber: unit.unitNumber,
            description: incomingAlert.state,
            message: incomingAlert.type,
            active: true, // Assuming new alerts start as active
            type: incomingAlert.type,
            timestamp: incomingAlert.time_fired,
            deviceId: incomingAlert.device,
            hubIp: incomingAlert.hub_ip
          };
          // Add the new alert to this unit's alerts array
          unit.alerts = [...unit.alerts, newAlert];
          unit.alerts = [
            ...unit.alerts.filter(
                (alert) => !(alert.timestamp === newAlert.timestamp && alert.type === newAlert.type && alert.deviceId === newAlert.deviceId)
            ),
            newAlert,
          ];
          return updatedProjects; // Return updated state
        }

        // If no matching hubIp found, log it
        console.log('No matching hub found for:', incomingAlert.hub_ip);
        return updatedProjects; // Return unchanged state
      });
    } catch (error) {
      console.error('Error processing alert:', error);
    }
  };

  // WebSocket implementation with @stomp/stompjs
  useEffect(() => {
    // Create a new STOMP client
    const client = new Client({
      brokerURL: 'ws://localhost:15674/ws',
      connectHeaders: {
        login: 'admin',
        passcode: 'admin',
      },
      debug: function (str) {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // Define what happens on successful connection
    client.onConnect = function (frame) {
      console.log("Connected to RabbitMQ Web STOMP:", frame);

      // Subscribe to the queue
      client.subscribe("/queue/website.alert", function (message) {
        if (message.body) {
          console.log("Message received:", message.body);
          processNewAlert(message.body);
        }
      });
    };


    client.onStompError = function (frame) {
      console.error("STOMP error:", frame.headers.message);
      console.error("Additional details:", frame.body);
    };

    // Start the connection
    client.activate();

    // Cleanup on component unmount
    return () => {
      if (client.active) {
        console.log("Disconnecting from RabbitMQ...");
        client.deactivate();
      }
    };
  }, []);

  const handleFilterChange = (filterValue: string) => {
    if (filterValue === "Clear Filters") {
      setFilter("");
      setSearchQuery("");
      setCurrentPage(1);
      setFilteredAlerts([...allAlerts]);
    } else {
      setFilter(filterValue);
      setCurrentPage(1);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const sortedFilteredAlerts = filteredAlerts
      .filter((alert) => {
        if (
            selectedProjectId.toString() &&
            alert.projectId !== selectedProjectId.toString()
        ) {
          return false;
        }
        const lowerCaseQuery = searchQuery.toLowerCase();
        const projectAddress =
            projects.find((p) => p.projectId === alert.projectId)?.address ||
            "";

        return (
            (alert.message?.toLowerCase() || "").includes(lowerCaseQuery) ||
            alert.unitNumber.toString().includes(lowerCaseQuery) ||
            alert.type.toLowerCase().includes(lowerCaseQuery) ||
            projectAddress.toLowerCase().includes(lowerCaseQuery)
        );
      })
      .sort((a, b) => {
        const projectA =
            projects.find((p) => p.projectId === a.projectId)?.address || "";
        const projectB =
            projects.find((p) => p.projectId === b.projectId)?.address || "";
        if (filter === " Project A-Z") {
          return projectA.localeCompare(projectB);
        } else if (filter === "Project Z-A") {
          return projectB.localeCompare(projectA);
        }

        if (filter === "Most Recent") {
          return (
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        } else if (filter === "Least Recent") {
          return (
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        }
        return 0;
      });

  const totalPages = Math.ceil(sortedFilteredAlerts.length / itemsPerPage);
  const paginatedAlerts = sortedFilteredAlerts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  const handlePageChange = (
      event: React.ChangeEvent<unknown>,
      page: number
  ) => {
    setCurrentPage(page);
  };

  return (
      <div className="relative mx-4 lg:mx-8 min-h-screen flex-col pb-20">
        <div className="flex items-center justify-between">
          <h1 className="w-full text-[#325a67] text-[30px] leading-10 tracking-tight whitespace-nowrap">
            Alerts
          </h1>
          <div className="flex items-center pt-2">
            <FilterComponent
                onFilterChange={handleFilterChange}
                filterOptions={filterOptionsAlerts}
            />
            <Searchbar onSearch={handleSearch} />
          </div>
        </div>
        <h2 className="text-left text-[#325a67] text-[16px] leading-2 tracking-tight pb-10">
          View and manage the alerts generated by the hubs across your
          organization. Use the Project Filter on the left, or the search bar and
          filter above to narrow results.{" "}
        </h2>

        <div className="grid grid-cols-6 gap-x-20 font-semibold border-b-2 border-black pb-2 mb-4">
          <p className="pl-2 text-[#30525E] text-lg font-sequel-sans-medium leading-tight tracking-tight">
            Project
          </p>
          <p className="pl-2 text-[#30525E] text-lg font-sequel-sans-medium leading-tight tracking-tight">
            Unit
          </p>
          <p className="pl-2 text-[#30525E] text-lg font-sequel-sans-medium leading-tight tracking-tight">
            Alert
          </p>
          <p className="pl-2 text-[#30525E] text-lg font-sequel-sans-medium leading-tight tracking-tight">
            Type
          </p>
          <p className="pl-2 text-[#30525E] text-lg font-sequel-sans-medium leading-tight tracking-tight">
            Date
          </p>
          <p className="pl-2 text-[#30525E] text-lg font-sequel-sans-medium leading-tight tracking-tight">
            Time
          </p>
        </div>

        {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        ) : allAlerts.length === 0 ? (
            <p className="text-[#729987] text-xl font-sequel-sans-black text-left p-2">
              No Data Available
            </p>
        ) : sortedFilteredAlerts.length === 0 && searchQuery !== "" ? (
            <div className="unit-container max-w-fit sm:max-w-full mx-auto">
              <div className="bg-[#fff] rounded-[7px] w-full mt-4 mb-4">
                <NoResultsFound searchItem={searchQuery} />
              </div>
            </div>
        ) : (
            <AlertList alerts={paginatedAlerts} projects={projects} />
        )}

        {!isLoading && allAlerts.length > 0 && sortedFilteredAlerts.length > 0 && (
            <div className="absolute bottom-0 left-0 w-full bg-white pb-0 flex justify-center">
              <Pagination
                  className="custom-pagination"
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
              />
            </div>
        )}
      </div>
  );
};

export default AlertPage;

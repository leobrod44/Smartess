"use client";
import AlertList from "../../components/AlertsPageComponents/AlertList";
import { generateMockProjects } from "../../mockData";
import Pagination from "@mui/material/Pagination";
import { useState, useMemo } from "react";
import Searchbar from "../../components/Searchbar";
import FilterComponent from "@/app/components/FilterList";
import NoResultsFound from "@/app/components/NoResultsFound";

const AlertPage = () => {
  const itemsPerPage = 6;
  const allAlerts = useMemo(
    () =>
      generateMockProjects().flatMap((project) =>
        project.units.flatMap((unit) => unit.alerts)
      ),
    []
  );

  //onnce backend is being added, please add the loading state in the try/catch/finally when you are getting the data from db..
  //all alerts frorm db should be saved to all alerts
  const [filteredAlerts, setFilteredAlerts] = useState([...allAlerts]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const filterOptionsAlerts = [
    "Most Recent",
    "Least Recent",
    "Clear All Filters",
  ];
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
      const lowerCaseQuery = searchQuery.toLowerCase();
      return (
        alert.message.toLowerCase().includes(lowerCaseQuery) ||
        alert.unitNumber.toString().includes(lowerCaseQuery) ||
        alert.type.toLowerCase().includes(lowerCaseQuery)
      );
    })
    .sort((a, b) => {
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
    <div className="flex border border-black rounded-lg p-6 mx-4 lg:mx-8 mt-6 min-h-screen flex-col">
      <div className="flex items-center pt-4 justify-between mb-8">
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
      <div className="grid grid-cols-7 font-semibold border-b-2 border-black pb-2 mb-4">
        <p className="pl-2 text-[#30525E] text-lg font-sequel-sans-medium leading-tight tracking-tight">
          Id
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
        <p className="pl-2 text-[#30525E] text-lg font-sequel-sans-medium leading-tight tracking-tight">
          Action
        </p>
      </div>
      {allAlerts.length === 0 ? (
        <p> No data available</p>
      ) : sortedFilteredAlerts.length === 0 ? (
        <NoResultsFound searchItem={searchQuery} />
      ) : (
        <AlertList alerts={paginatedAlerts} />
      )}
      <div className="mt-4 flex justify-center">
        <Pagination
          className="custom-pagination"
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </div>
    </div>
  );
};

export default AlertPage;

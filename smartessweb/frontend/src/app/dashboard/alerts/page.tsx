"use client";
import AlertList from "../../components/AlertsPageComponents/AlertList";
import { generateMockProjects } from "../../mockData";
import Pagination from "@mui/material/Pagination";
import { useState } from "react";

const itemsPerPage = 8;

const AlertPage = () => {
  const alerts = generateMockProjects().flatMap((project) =>
    project.units.flatMap((unit) => unit.alerts)
  );

  const [currentPage, setCurrentPage] = useState(1);
  // Pagination logic
  const totalPages = Math.ceil(alerts.length / itemsPerPage);
  const currentItems = alerts.slice(
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
    <div className=" flex border border-black rounded-lg p-6 mx-4 lg:mx-8 mt-6 min-h-screen flex flex-col">
      <div className="flex items-center pt-4 justify-between mb-8">
        <div className="w-full text-[#325a67] text-[30px] leading-10 tracking-tight whitespace-nowrap">
          Alerts
        </div>
      </div>
      <div className="grid grid-cols-6 font-semibold border-b-2 border-black pb-2 mb-4">
        <p className=" pl-2 text-[#30525E] text-lg font-sequel-sans-medium leading-tight tracking-tight">
          Id
        </p>
        <p className=" pl-2  text-[#30525E] text-lg font-sequel-sans-medium leading-tight tracking-tight">
          Alert
        </p>
        <p className="pr-8 text-[#30525E] text-lg font-sequel-sans-medium leading-tight tracking-tight">
          Type
        </p>
        <p className=" pr-6 text-[#30525E] text-lg font-sequel-sans-medium leading-tight tracking-tight">
          Date
        </p>
        <p className="pr-6 text-[#30525E] text-lg font-sequel-sans-medium leading-tight tracking-tight">
          Time
        </p>
        <p className=" pr-6 text-[#30525E] text-lg font-sequel-sans-medium leading-tight tracking-tight">
          Action
        </p>
      </div>
      <AlertList alerts={currentItems} />
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

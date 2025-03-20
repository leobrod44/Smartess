const DashboardOverviewWidget = ({
  systemOverview,
}: {
  systemOverview: {
    projects: number;
    totalUnits: number;
    pendingTickets: number;
    totalAdminUsers: number;
  } | null;
}) => {
  return (
    <div className="flex-col bg-[#14323B] w-full rounded-[7px] text-center m-0.5 p-1 hover:scale-105">
      <div className="flex flex-row w-full h-2/4 p-1">
        <div className="bg-[#325A67] w-full h-full place-content-around rounded-[7px] m-0.5">
          <h3 className="text-3xl">{systemOverview?.projects}</h3>
          <h3 className="text-xs pb-1">Projects</h3>
        </div>
        <div className="bg-[#325A67] w-full h-full place-content-around rounded-[7px] m-0.5">
          <h3 className="text-3xl">{systemOverview?.totalUnits}</h3>
          <h3 className="text-xs pb-1 ">Total Units</h3>
        </div>
      </div>

      <div className="flex flex-row h-2/4 w-full p-1">
        <div className="bg-[#325A67] w-full h-full place-content-around rounded-[7px] m-0.5">
          <h3 className="text-3xl">{systemOverview?.pendingTickets}</h3>
          <h3 className="text-xs pb-1">Pending Tickets</h3>
        </div>
        <div className="bg-[#325A67] w-full h-full place-content-around rounded-[7px] m-0.5">
          <h3 className="text-3xl">{systemOverview?.totalAdminUsers}</h3>
          <h3 className="text-xs pb-1">Total Employees</h3>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverviewWidget;

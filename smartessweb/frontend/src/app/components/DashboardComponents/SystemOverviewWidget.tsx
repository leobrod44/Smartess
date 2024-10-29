const DashboardOverviewWidget = () => {
  return (
    <div className="flex-col bg-[#325A67] w-full rounded-[7px] text-center m-0.5 p-1">
      <div className="flex flex-row w-full h-2/4 p-1">
        <div className="bg-[#CCCCCC] w-full h-full place-content-around rounded-[7px] m-0.5">
          <h3 className="text-2xl">15</h3>
          <h3 className="text-xs">Projects</h3>
        </div>
        <div className="bg-[#4B7D8D] w-full h-full place-content-around rounded-[7px] m-0.5">
          <h3 className="text-2xl">13</h3>
          <h3 className="text-xs">Total Units</h3>
        </div>
      </div>

      <div className="flex flex-row h-2/4 w-full p-1">
        <div className="bg-[#A6634F] w-full h-full place-content-around rounded-[7px] m-0.5">
          <h3 className="text-2xl">0</h3>
          <h3 className="text-xs">Pending Tickets</h3>
        </div>
        <div className="bg-[#729987] w-full h-full place-content-around rounded-[7px] m-0.5">
          <h3 className="text-2xl">9</h3>
          <h3 className="text-xs">Total Admin Users</h3>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverviewWidget;

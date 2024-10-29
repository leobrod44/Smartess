import AlertWidget from "./AlertWidget";
import SystemHealthWidget from "./SystemHealthWidget";
import SystemOverviewWidget from "./SystemOverviewWidget";

const DashboardWidget = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between bg-[#14323B] p-1.5 rounded-[7px] shadow-md md:max-w-full hover:bg-[#4B7D8D] transition duration-300 text-[#fff] w-full p-2.5 gap-2">
      <SystemOverviewWidget />
      <AlertWidget />
      <SystemHealthWidget />
    </div>
  );
};

export default DashboardWidget;

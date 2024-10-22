import HubOwner from "../components/UnitComponents/HubOwner";
import HubUsers from "../components/UnitComponents/HubUsers";
import Tickets from "../components/UnitComponents/Tickets";
import Alerts from "../components/UnitComponents/Alerts";

const Unit = () => {
  const users = [
    { firstName: "Mary", lastName: "Johnson" },
    { firstName: "Ken", lastName: "Long" },
    { firstName: "Michalo", lastName: "Jam" },
    { firstName: "Sierra", lastName: "McKnight" },
  ];

  const tickets = {
    total: 22, 
    open: 3, 
    pending: 4, 
    closed: 12, 
  };

  return (
    <div className="unit-container bg-[#4b7d8d] p-[5px] rounded-[7px] shadow-md max-w-fit sm:max-w-full mx-auto">
      <div className="unit-title text-white text-l flex justify-center">
        Unit 103
      </div>
      <div className="unit-info-sections bg-white rounded-[7px] flex flex-col sm:flex-row justify-between px-4">
          <HubOwner
            owner={{
              firstName: "LARRY",
              lastName: "JOHNSON",
              email: "larryJ@hotmail.com",
            }}
          />

        <div className="divider bg-[#a0bfca] w-[1px]"></div>
        <div className="flex-grow-0 flex-shrink-0">
          <HubUsers users={users} />
        </div>
        <div className="divider bg-[#a0bfca] w-[1px]"></div>
        <div className="flex-grow-0 flex-shrink-0">
          <Tickets tickets={tickets} />
        </div>
        <div className="divider bg-[#a0bfca] w-[1px] "></div>
          <Alerts
            alerts={[
              { message: "SMOKE ALARM ACTIVATED" },
              { message: "WATER leak DETECTED" },
              { message: "WATER LEAKSSS DETECTED" },
            ]}
          />
      </div>
    </div>
  );
};

export default Unit;
const AlertWidget = () => {
  return (
    <div className="flex-col bg-[#325A67] w-full rounded-[7px] text-center text-sm m-0.5">
      <div className="w-full relative">
        <h3 className="text-center text-[#fff] text-xl font-sequel-sans leading-tight tracking-tight mt-4">
          Alerts
        </h3>
        <div className="w-2/4 h-px absolute left-1/2 transform -translate-x-1/2 bg-[#fff]" />{" "}
        <div>
          <p className="p-3 text-xs">
            Alerts will appear here when an emergency is detected by a hub
          </p>
        </div>
      </div>

      <div className="flex justify-center items-center"></div>

      <div className="flex flex-col w-full items-center text-xs">
        <div className="bg-[#A65146] w-2/3 h-1/2 m-1 p-1.5 rounded-[7px]">
          <div className="flex flex-col text-left">
            <p className="font-sequel-sans-black">SMOKE ALARM ACTIVATED</p>
            <p>1000 De La Gauchetiere </p>
            <p>Unit 103</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center">
        <button className="w-[80px] h-[22px] bg-[#a65146] rounded-md text-white text-xs hover:bg-[#8e4135] transition duration-300 m-2">
          See All
        </button>
      </div>
    </div>
  );
};
export default AlertWidget;

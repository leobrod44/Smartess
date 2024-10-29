const SystemHealthWidget = () => {
  return (
    <div className="flex-col items-center bg-[#325A67] w-full rounded-[7px] m-0.5">
      <div className="w-full relative pb-0.5">
        <h3 className="text-center text-[#fff] text-xl font-sequel-sans leading-tight tracking-tight mt-4">
          System Health
        </h3>
        <div className="w-2/4 h-px absolute left-1/2 transform -translate-x-1/2 bg-[#fff]" />{" "}
      </div>

      <div className="flex flex-col items-center text-center s-full text-xs p-1">
        <div className="bg-[#729987] w-full m-2 rounded-[7px] h-16 place-content-around w-full">
          <h3 className="text-2xl">10</h3>
          <h3>Systems Live</h3>
        </div>
        <div className="bg-[#A65146] w-full rounded-[7px] h-16 place-content-around w-full">
          <h3 className="text-2xl">1</h3>
          <h3>Systems Down</h3>
        </div>
      </div>
    </div>
  );
};
export default SystemHealthWidget;

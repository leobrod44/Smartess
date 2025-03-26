import { PieChart, Pie, Cell, Tooltip } from "recharts";

const SystemHealthWidget = ({
  systemHealth,
}: {
  systemHealth: {
    systemsLive: number;
    systemsDown: number;
  } | null;

}) => {
  if (!systemHealth) return null;

  const data = [
    { name: "Live", value: systemHealth.systemsLive, color: "#729987" },
    { name: "Down", value: systemHealth.systemsDown, color: "#A65146" },
  ];


  return (
    <div className="flex-col items-center bg-[#14323B] w-full rounded-[7px] m-0.5 hover:scale-105">
      <div className="w-full relative pb-0.5">
        <h3 className="text-center text-[#fff] text-xl font-sequel-sans leading-tight tracking-tight mt-4">
          System Health
        </h3>
        <div className="w-2/4 h-px absolute left-1/2 transform -translate-x-1/2 bg-[#fff]" />{" "}
      </div>

    <div className="flex justify-center items-center w-full">
      <PieChart width={200} height={200}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={35}
          outerRadius={80}
          dataKey="value"
          label={({ cx, cy, midAngle, outerRadius, value }) => {
            const RADIAN = Math.PI / 180;
            const radius = outerRadius + 15;
            const x = cx + radius * Math.cos(-midAngle * RADIAN);
            const y = cy + radius * Math.sin(-midAngle * RADIAN);
      
            return value > 0 ? (
              <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                {value}
              </text>
            ) : null;
          }}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`Cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
      </div>
      <div className="flex flex-col items-center text-xs p-1">
          <h3 className="text-[#729987] text-xl">{systemHealth.systemsLive} Systems Live</h3>
          <h3 className="text-[#A65146] text-xl">{systemHealth.systemsDown} Systems Down</h3>
      </div>
    </div>
  );
};

export default SystemHealthWidget;

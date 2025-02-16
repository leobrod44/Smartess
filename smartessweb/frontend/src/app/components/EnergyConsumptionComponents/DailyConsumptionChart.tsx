import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface DailyConsumptionChartProps {
  dailyData: { name: string; energyConsumption: number }[];
}

const DailyConsumptionChart: React.FC<DailyConsumptionChartProps> = ({
  dailyData,
}) => {
  return (
    <div className="border p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <h2 className="text-xl font-bold mb-6 text-gray-800">
        Daily Energy Consumption (kW)
      </h2>
      <ResponsiveContainer
        width="100%"
        height={300}
      >
        <BarChart
          data={dailyData}
          margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e0e0e0"
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "#555" }}
            axisLine={{ stroke: "#ccc" }}
            label={{
              value: "Day",
              position: "insideBottomRight",
              offset: -10,
              fill: "#555",
              fontSize: 12,
            }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#555" }}
            axisLine={{ stroke: "#ccc" }}
            label={{
              value: "Energy (kW)",
              angle: -90,
              position: "insideLeft",
              fill: "#555",
              fontSize: 12,
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: 4,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar
            dataKey="energyConsumption"
            fill="#56798d"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailyConsumptionChart;

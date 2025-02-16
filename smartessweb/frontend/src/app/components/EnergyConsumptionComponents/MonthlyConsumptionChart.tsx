import {
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  Area,
  Line,
} from "recharts";

interface MonthlyConsumptionChartProps {
  monthlyData: {
    month: string;
    energyConsumption: number;
    temperature: number;
  }[];
}

const MonthlyConsumptionChart: React.FC<MonthlyConsumptionChartProps> = ({
  monthlyData,
}) => {
  return (
    <div className="border p-6 col-span-1 md:col-span-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <h2 className="text-xl font-bold mb-6 text-gray-800">
        Monthly Energy Consumption & Temperature
      </h2>
      <ResponsiveContainer
        width="100%"
        height={400}
      >
        <ComposedChart
          data={monthlyData}
          margin={{ top: 20, right: 40, bottom: 20, left: 20 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e0e0e0"
          />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "#555" }}
            axisLine={{ stroke: "#ccc" }}
            label={{
              value: "Month",
              position: "insideBottomRight",
              offset: -10,
              fill: "#555",
              fontSize: 12,
            }}
            scale="band"
          />
          <YAxis
            yAxisId="left"
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
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: "#555" }}
            axisLine={{ stroke: "#ccc" }}
            label={{
              value: "Temperature (°C)",
              angle: -90,
              position: "insideRight",
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
            yAxisId="left"
            dataKey="energyConsumption"
            barSize={20}
            fill="#56798d"
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="temperature"
            stroke="#14323B"
            strokeWidth={2}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyConsumptionChart;

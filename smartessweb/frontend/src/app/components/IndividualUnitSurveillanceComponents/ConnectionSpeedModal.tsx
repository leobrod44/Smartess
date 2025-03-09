import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Label } from "recharts";

interface ConnectionSpeedModalProps {
  data: { time: string; value: number }[];
  onClose: () => void;
}

const ConnectionSpeedModal: React.FC<ConnectionSpeedModalProps> = ({ data, onClose }) => {
  const chartData = data;

  const yAxisUnit = "kbps"; 

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 backdrop-blur-sm z-50">
      <div className="relative w-[90%] max-w-[1000px] h-[90%] max-h-[625px] bg-white rounded-lg p-10 overflow-y-auto shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 cursor-pointer text-gray-500 hover:text-gray-700 transition duration-300"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold text-[#30525E] mb-4">Connection Speed Over Time</h2>

        {/* Graph Section */}
        <div className="border border-black rounded-lg w-full h-[420px] flex justify-center">
          <LineChart 
            width={1000} 
            height={460} 
            data={chartData} 
            margin={{ top: 20, right: 30, left: 40, bottom: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              interval="preserveStartEnd"
              tickFormatter={(value, index) => index % 3 === 0 ? value : ''} 
              padding={{ left: 10, right: 10 }}
              tick={{ fontSize: 10 }}
            >
              <Label value="Time" position="bottom" offset={20} />
            </XAxis>
            <YAxis 
              unit={yAxisUnit} 
              tick={{ fontSize: 10 }}
              domain={['dataMin - 100', 'dataMax + 100']}
              label={{ value: 'Kilobytes', angle: -90, position: 'insideLeft', offset: -15 }}
            />
            <Tooltip 
              contentStyle={{
                color: "#333"
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#FF5449" 
              strokeWidth={2} 
              dot={false}
              isAnimationActive={false}
              connectNulls={true}
            />
          </LineChart>
        </div>

        <div className="flex justify-end mt-10">
          <button
            onClick={onClose}
            className="bg-[#4b7d8d] cursor-pointer text-white px-6 py-2 rounded-md hover:bg-[#254752] transition duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionSpeedModal;